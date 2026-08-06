const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolver = config.resolver.resolveRequest;

const ZUSTAND_DIR = path.join(__dirname, 'node_modules', 'zustand');
const ZUSTAND_CJS_MAP = {
  zustand: 'index.js',
  'zustand/traditional': 'traditional.js',
  'zustand/middleware': 'middleware.js',
  'zustand/shallow': 'shallow.js',
  'zustand/vanilla': 'vanilla.js',
  'zustand/react': 'index.js',
  'zustand/react/shallow': 'shallow.js',
  'zustand/context': 'context.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Zustand 4.5 ships ESM-only `.mjs` files via the `exports` field,
  // which contain `import.meta.env.MODE` references. Hermes and the
  // classic web script tag both reject `import.meta`, so route every
  // zustand import to its CommonJS sibling (loaded via a direct path
  // so Node's `exports` resolution does not intercept it).
  if (ZUSTAND_CJS_MAP[moduleName]) {
    return {
      filePath: path.join(ZUSTAND_DIR, ZUSTAND_CJS_MAP[moduleName]),
      type: 'sourceFile',
    };
  }

  // Supabase-js ships an optional `@opentelemetry/api` dynamic import
  // that Metro tries to resolve even though it's behind a try/catch.
  if (moduleName === '@opentelemetry/api') {
    return { type: 'empty' };
  }

  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
