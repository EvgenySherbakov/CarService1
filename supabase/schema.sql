-- ============================================================
-- AutoDuck / CarService1 - Supabase schema
-- ============================================================
-- Run in Supabase SQL editor, or via `supabase db push`.
-- Idempotent: safe to re-run during development.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type user_role as enum ('client', 'admin', 'mechanic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type service_type as enum ('repair', 'wash');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role user_role not null default 'client',
  preferred_language text default 'pt-BR',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- ---------- vehicles owned by clients ----------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  make text not null,
  model text not null,
  year int not null,
  plate text,
  vin text,
  color text,
  created_at timestamptz not null default now()
);

-- ---------- service catalog ----------
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  type service_type not null,
  slug text not null unique,
  name text not null,
  icon text
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories (id) on delete set null,
  type service_type not null,
  name text not null,
  description text,
  price_from numeric(10,2) not null check (price_from >= 0),
  duration_minutes int not null check (duration_minutes > 0),
  image_url text,
  active bool not null default true,
  created_at timestamptz not null default now()
);

-- ---------- rental fleet ----------
create table if not exists public.rental_cars (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year int not null,
  transmission text not null check (transmission in ('automatic','manual')),
  fuel text not null check (fuel in ('petrol','diesel','electric','hybrid')),
  seats int not null check (seats > 0),
  price_per_day numeric(10,2) not null check (price_per_day >= 0),
  deposit_amount numeric(10,2) not null default 0 check (deposit_amount >= 0),
  image_url text,
  available bool not null default true,
  created_at timestamptz not null default now()
);

-- ---------- bookings (repair / wash) ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  scheduled_at timestamptz not null,
  status booking_status not null default 'pending',
  notes text,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  payment_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists bookings_client_idx on public.bookings (client_id, scheduled_at desc);
create index if not exists bookings_status_idx on public.bookings (status, scheduled_at);

-- ---------- rentals ----------
create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  car_id uuid not null references public.rental_cars (id) on delete restrict,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  status booking_status not null default 'pending',
  total_amount numeric(10,2) not null check (total_amount >= 0),
  deposit_amount numeric(10,2) not null default 0,
  payment_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists rentals_client_idx on public.rentals (client_id, start_date desc);

-- ---------- payments (Stripe) ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  booking_id uuid references public.bookings (id) on delete set null,
  rental_id uuid references public.rentals (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  car_id uuid references public.rental_cars (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  rental_id uuid references public.rentals (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  check (service_id is not null or car_id is not null)
);

-- ---------- push notification tokens ----------
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios','android','web')),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

-- ============================================================
-- Helper: is admin?
-- ============================================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

-- ============================================================
-- Trigger to auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row level security
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.vehicles          enable row level security;
alter table public.service_categories enable row level security;
alter table public.services          enable row level security;
alter table public.rental_cars       enable row level security;
alter table public.bookings          enable row level security;
alter table public.rentals           enable row level security;
alter table public.payments          enable row level security;
alter table public.reviews           enable row level security;
alter table public.push_tokens       enable row level security;

-- profiles
drop policy if exists "profiles self read"  on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- vehicles
drop policy if exists "vehicles owner all" on public.vehicles;
create policy "vehicles owner all" on public.vehicles
  for all using (owner_id = auth.uid() or public.is_admin(auth.uid()))
  with check (owner_id = auth.uid() or public.is_admin(auth.uid()));

-- public catalogs (read anywhere)
drop policy if exists "categories public read" on public.service_categories;
create policy "categories public read" on public.service_categories for select using (true);

drop policy if exists "services public read" on public.services;
create policy "services public read" on public.services for select using (active = true);

drop policy if exists "cars public read" on public.rental_cars;
create policy "cars public read" on public.rental_cars for select using (true);

drop policy if exists "services admin write" on public.services;
create policy "services admin write" on public.services
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "cars admin write" on public.rental_cars;
create policy "cars admin write" on public.rental_cars
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- bookings
drop policy if exists "bookings owner select" on public.bookings;
create policy "bookings owner select" on public.bookings
  for select using (client_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "bookings owner insert" on public.bookings;
create policy "bookings owner insert" on public.bookings
  for insert with check (client_id = auth.uid());

drop policy if exists "bookings owner update" on public.bookings;
create policy "bookings owner update" on public.bookings
  for update using (client_id = auth.uid() or public.is_admin(auth.uid()))
  with check (client_id = auth.uid() or public.is_admin(auth.uid()));

-- rentals (mirror)
drop policy if exists "rentals owner select" on public.rentals;
create policy "rentals owner select" on public.rentals
  for select using (client_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "rentals owner insert" on public.rentals;
create policy "rentals owner insert" on public.rentals
  for insert with check (client_id = auth.uid());

drop policy if exists "rentals owner update" on public.rentals;
create policy "rentals owner update" on public.rentals
  for update using (client_id = auth.uid() or public.is_admin(auth.uid()))
  with check (client_id = auth.uid() or public.is_admin(auth.uid()));

-- payments (insert via edge functions; read by owner)
drop policy if exists "payments owner select" on public.payments;
create policy "payments owner select" on public.payments
  for select using (client_id = auth.uid() or public.is_admin(auth.uid()));

-- reviews
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select using (true);

drop policy if exists "reviews owner write" on public.reviews;
create policy "reviews owner write" on public.reviews
  for insert with check (client_id = auth.uid());

-- push tokens
drop policy if exists "push tokens owner" on public.push_tokens;
create policy "push tokens owner" on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
