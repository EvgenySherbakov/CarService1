export const Config = {
  appName: 'AutoDuck',
  appSlug: 'CarService1',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  useMock:
    (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true').toLowerCase() === 'true' ||
    !process.env.EXPO_PUBLIC_SUPABASE_URL,
  currency: 'BRL',
  currencyDisplay: 'R$',
  supportEmail: 'support@autoduck.example',
};
