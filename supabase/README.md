# Supabase setup for CarService1

## Quick start

1. Create a Supabase project at https://supabase.com
2. Open SQL editor and run `schema.sql`
3. Run `seed.sql` to populate the catalog
4. Get your project URL + anon key from **Settings → API**
5. Copy `.env.example` to `.env` and paste the values
6. Restart `npx expo start` — the app will switch from mock to live mode

## OAuth providers

In the Supabase dashboard:

- **Authentication → Providers → Google**
  Add Web client ID/secret. Add redirect URL `carservice1://auth-callback`.
- **Authentication → Providers → Apple**
  Configure Sign in with Apple service ID and key.

## Stripe (optional in MVP)

Real Stripe charges require a backend that creates `PaymentIntent`s and
returns the client secret. Recommended path:

1. Add Stripe extension in Supabase (or deploy an Edge Function `create-payment-intent`).
2. Replace mock logic in `lib/stripe.ts` with `initPaymentSheet` + `presentPaymentSheet` from `@stripe/stripe-react-native`.
3. Configure Apple Pay merchant ID and Google Pay merchant ID in `app.json`.
