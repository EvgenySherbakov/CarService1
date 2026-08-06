#!/usr/bin/env node
/**
 * Verifies that a Supabase project has the expected schema and seed data
 * for CarService1 / AutoDuck.
 *
 * Usage:
 *   node scripts/check-supabase.mjs <SUPABASE_URL> <ANON_KEY>
 *   # or
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/check-supabase.mjs
 *
 * Uses only the anon key, so all checks honour RLS (it never sees private
 * rows — that is the point). Requires Node 18+ (built-in fetch).
 */

const [, , argUrl, argKey] = process.argv;
const url = (argUrl || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = argKey || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Usage: node scripts/check-supabase.mjs <SUPABASE_URL> <ANON_KEY>');
  process.exit(2);
}

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const PUBLIC_TABLES = [
  { name: 'service_categories', minRows: 6 },
  { name: 'services',           minRows: 4 },
  { name: 'rental_cars',        minRows: 5 },
  { name: 'reviews',            minRows: 0 },
];

const PRIVATE_TABLES = [
  'profiles',
  'vehicles',
  'bookings',
  'rentals',
  'payments',
  'push_tokens',
];

async function selectCount(table) {
  // PostgREST trick: request a HEAD with Prefer: count=exact
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
    method: 'HEAD',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
      Range: '0-0',
    },
  });
  const range = res.headers.get('content-range') || '';
  const count = parseInt(range.split('/')[1] ?? '', 10);
  return { status: res.status, count: Number.isFinite(count) ? count : null };
}

async function tryAuth() {
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  return res.json();
}

let problems = 0;
let warnings = 0;
const note = (kind, msg) => {
  if (kind === 'err') { problems++; console.log(c.err('  ✗ ') + msg); }
  else if (kind === 'warn') { warnings++; console.log(c.warn('  ! ') + msg); }
  else console.log(c.ok('  ✓ ') + msg);
};

console.log(c.bold(`\nChecking Supabase project: ${url}\n`));

// 1. Auth reachable
console.log(c.bold('Auth endpoint'));
try {
  const auth = await tryAuth();
  if (!auth) note('err', 'Cannot reach /auth/v1/settings — wrong URL or key?');
  else {
    note('ok', `Auth reachable; external providers: ${
      [auth.external?.google && 'google', auth.external?.apple && 'apple']
        .filter(Boolean).join(', ') || c.dim('none enabled')
    }`);
    if (!auth.external?.google) note('warn', 'Google OAuth provider is OFF (Authentication → Providers)');
    if (!auth.external?.apple) note('warn', 'Apple OAuth provider is OFF (Authentication → Providers)');
  }
} catch (e) {
  note('err', `Auth check failed: ${e.message}`);
}

// 2. Public catalogue tables
console.log('\n' + c.bold('Public catalogue tables (anon SELECT allowed by RLS)'));
for (const t of PUBLIC_TABLES) {
  try {
    const { status, count } = await selectCount(t.name);
    if (status === 404 || status === 400) {
      note('err', `${t.name}: table not found (HTTP ${status}) — run supabase/schema.sql`);
    } else if (status === 401 || status === 403) {
      note('err', `${t.name}: blocked by RLS for anon (HTTP ${status}) — public read policy missing`);
    } else if (count === null) {
      note('warn', `${t.name}: reachable but row count not returned (HTTP ${status})`);
    } else if (count < t.minRows) {
      note('warn', `${t.name}: only ${count} rows, expected ≥ ${t.minRows} — run supabase/seed.sql`);
    } else {
      note('ok', `${t.name}: ${count} rows`);
    }
  } catch (e) {
    note('err', `${t.name}: ${e.message}`);
  }
}

// 3. Private tables — anon must NOT see rows (RLS check)
console.log('\n' + c.bold('Private tables (anon SELECT must be denied or empty)'));
for (const name of PRIVATE_TABLES) {
  try {
    const { status, count } = await selectCount(name);
    if (status === 404 || status === 400) {
      note('err', `${name}: table not found (HTTP ${status}) — run supabase/schema.sql`);
    } else if (status === 401 || status === 403) {
      note('ok', `${name}: protected by RLS (HTTP ${status})`);
    } else if (count === null) {
      note('warn', `${name}: HTTP ${status}, count unavailable`);
    } else if (count === 0) {
      note('ok', `${name}: reachable, 0 rows visible to anon (RLS OK)`);
    } else {
      note('err', `${name}: anon can see ${count} rows — RLS misconfigured!`);
    }
  } catch (e) {
    note('err', `${name}: ${e.message}`);
  }
}

console.log('\n' + c.bold('Summary'));
if (problems === 0 && warnings === 0) {
  console.log(c.ok('✓ Database is fully ready for CarService1.'));
} else {
  if (problems) console.log(c.err(`✗ ${problems} problem(s)`));
  if (warnings) console.log(c.warn(`! ${warnings} warning(s)`));
  console.log(c.dim('See messages above. Fix order: schema.sql → seed.sql → OAuth providers.'));
}
console.log();
process.exit(problems > 0 ? 1 : 0);
