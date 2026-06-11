// Default ENV for tests — keeps the app in mock mode so lib/* return
// deterministic data and avoid touching network.
process.env.EXPO_PUBLIC_USE_MOCK = 'true';
process.env.EXPO_PUBLIC_SUPABASE_URL = '';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';
process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = '';

// AsyncStorage ships a native module; in Jest there is no native runtime,
// so we plug in the package's official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
