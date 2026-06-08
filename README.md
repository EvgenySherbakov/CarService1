# CarService1 — AutoDuck 🦆

**Languages:** **English** · [Русский](README.ru.md)

Cross-platform application (**Web · iOS · Android** from a single codebase)
for the **AutoDuck** car service: book **repairs** and **car washes**, **rent
cars** with online payment. Brazil-flag-inspired design, UI available in
three languages.

> Stack: **Expo Router + React Native + TypeScript + Supabase + Stripe**.
> Runs out of the box on mock data — no backend keys required to try it.

---

## Contents

- [Features](#features)
- [Screens](#screens)
- [Tech stack](#tech-stack)
- [Design system](#design-system)
- [Quick start](#quick-start)
- [Running on Web / Android / iOS](#running-on-platforms)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Supabase setup](#supabase-setup)
- [Stripe setup](#stripe-setup)
- [Localization](#localization)
- [Commands](#commands)
- [Roadmap](#roadmap)
- [Documentation](#documentation)

---

## Features

### Without sign-in (guest access)
From the welcome screen guests can open three public pages:
- 📞 **Contacts** — phones, WhatsApp, email, address, map
- 🚗 **Fleet** — rental catalogue with description and starting price
- ℹ️ **About** — company story, owners and director, workshop gallery

### For the client
- 🔐 Sign in with **Google** and **Apple** (Supabase OAuth)
- 🔧 **Book a repair** — service catalogue, vehicle/date/time, notes
- 💧 **Book a wash** — wash packages and free time slots
- 🚗 **Rent a car** — catalogue, rental period, per-day pricing, deposit
- 💳 **Stripe payment** — card, **Apple Pay**, **Google Pay**, deposit hold
- 📅 **My bookings** — upcoming and past, statuses
- 🚙 **My garage** — user vehicles
- ⭐ **Reviews and ratings** of services and cars
- 🔔 **Push notifications** — booking reminders
- 🌐 **3 languages** — English, Russian, Português (pt-BR)

### For the administrator (AutoDuck)
- 📊 Dashboard: today's bookings, revenue, active rentals, new reviews
- 🚗 Fleet management
- 📅 Booking overview and status management

---

## Screens

| Group | Screen | File |
|-------|--------|------|
| Auth | Welcome / sign-in | `app/(auth)/welcome.tsx` |
| Public | Contacts | `app/(public)/contact.tsx` |
| Public | Fleet (rental) | `app/(public)/fleet.tsx` |
| Public | About | `app/(public)/about.tsx` |
| Client | Home (Dashboard) | `app/(tabs)/index.tsx` |
| Client | Services (repair/wash) | `app/(tabs)/services.tsx` |
| Client | Rentals | `app/(tabs)/rentals.tsx` |
| Client | Bookings | `app/(tabs)/bookings.tsx` |
| Client | Profile | `app/(tabs)/profile.tsx` |
| Flow | Service booking | `app/booking/[serviceId].tsx` |
| Flow | Rental booking | `app/rental/[carId].tsx` |
| Flow | Checkout (Stripe) | `app/checkout/[type].tsx` |
| Admin | Dashboard | `app/admin/index.tsx` |

Detailed per-screen specs, states and acceptance criteria — in
[`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).

---

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI / Runtime | React Native `0.81` + Expo SDK `54` | unified Web/iOS/Android code |
| Routing | Expo Router `v6` (file-based) | navigation through the file tree |
| Language | TypeScript (strict) | type safety |
| Client state | Zustand | auth store, booking store |
| Server state | TanStack React Query | Supabase query cache |
| Backend / DB | Supabase (Postgres + Auth + Storage + RLS) | data, authentication |
| Payments | Stripe (`@stripe/stripe-react-native`) | payment, Apple/Google Pay |
| i18n | i18next + expo-localization | multilingual UI |
| Push | expo-notifications | reminders |
| Graphics | expo-linear-gradient, react-native-svg | gradients, icons |

---

## Design system

Colours inspired by the Brazilian flag, modernised (à la NuBank / iFood):

| Token | HEX | Usage |
|-------|-----|-------|
| `primary` | `#00A859` | main green |
| `accent` | `#FFD400` | yellow accent |
| `secondary` | `#0B2D6E` | deep blue (sidebar, hero) |
| `coral` | `#FF6B5C` | extra accent |
| `background` | `#FAFCF9` | warm background |
| `text` | `#0E1A2B` | charcoal-navy text |

All tokens live in `constants/theme.ts` (`Palette`, `Spacing`, `Radius`,
`Typography`, `Shadow`, `Gradients`). Style: flat, rounded cards (18–28 px),
soft blue-tinted shadows, gradients from the flag palette.

**Responsiveness** (`hooks/useResponsive.ts`):
- `< 1000px` (phone) — bottom tabs, full-width content
- `≥ 1000px` (desktop) — **sidebar** + content centred with a max-width
- `≥ 1340px` (wide) — wider grids

---

## Quick start

```bash
git clone https://github.com/EvgenySherbakov/CarService1.git
cd CarService1
npm install
npx expo start
```

Without a `.env` file the app runs on **mock data** — the whole UI and all
flows (including the "payment") work locally.

> ⚠️ Requires **Node.js 18+** and npm. On Windows use PowerShell or cmd.

---

## Running on platforms

After `npx expo start`, in the terminal:

| Key | Platform | Requirements |
|-----|----------|--------------|
| `w` | Web (browser) | — |
| `a` | Android | emulator or **Expo Go** on a phone |
| `i` | iOS | macOS only / Expo Go on an iPhone |

> In environments without access to the Expo registry use
> `EXPO_OFFLINE=1 npx expo start`.

### Android via Expo Go (no Android Studio required)

The easiest way to test on a phone is **Expo Go** — no Android Studio,
emulator or SDK install needed.

1. On your Android phone install the free **Expo Go** app from Google Play.
2. Make sure the phone and the computer are on the **same Wi-Fi network**.
3. On the computer run `npx expo start`.
4. A QR code appears in the terminal. Open Expo Go and **scan** it.
5. The app loads and runs on the phone.

**If networks differ or there are connection issues** — use tunnel mode:

```bash
npx expo start --tunnel
```

It creates a public URL through ngrok, so the QR code works from any network
(including mobile data on the phone).

### What if you pressed `a` and saw "Failed to resolve the Android SDK path"

This means you don't have Android Studio + SDK installed. You don't need to
install them just to test — use **Expo Go** instead (see above).

The full Android dev path (Android Studio + emulator + SDK) is only required
for a production build to Google Play.

---

## Project structure

```
CarService1/
├── app/                       # Screens (Expo Router, file-based)
│   ├── _layout.tsx            # Root Stack + AuthGate (session redirects)
│   ├── index.tsx              # Redirect to (tabs) or (auth)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── welcome.tsx        # Google/Apple sign-in + guest links
│   ├── (public)/              # Public pages (no sign-in)
│   │   ├── _layout.tsx
│   │   ├── contact.tsx        # Contacts + map
│   │   ├── fleet.tsx          # Rental fleet
│   │   └── about.tsx          # About / team / gallery
│   ├── (tabs)/                # Client shell (AppShell)
│   │   ├── _layout.tsx        # AppShell + Slot
│   │   ├── index.tsx          # Home / Dashboard
│   │   ├── services.tsx       # Service catalogue
│   │   ├── rentals.tsx        # Car catalogue
│   │   ├── bookings.tsx       # My bookings
│   │   └── profile.tsx        # Profile
│   ├── booking/[serviceId].tsx# Service booking
│   ├── rental/[carId].tsx     # Rental booking
│   ├── checkout/[type].tsx    # Checkout (booking | rental)
│   └── admin/                 # Admin panel
│       ├── _layout.tsx
│       └── index.tsx
├── components/
│   ├── AppShell.tsx           # Sidebar (desktop) / bottom tabs (mobile)
│   ├── ServiceCard.tsx        # Service card
│   ├── CarCard.tsx            # Car card
│   ├── BookingCard.tsx        # Booking card
│   ├── RatingStars.tsx        # Star rating
│   ├── LanguageSwitcher.tsx   # Language toggle
│   ├── SectionHeader.tsx      # Section header + "view all"
│   ├── layout/                # Page, PageHeader, FlowHeader, Grid
│   └── ui/                    # Button, Card, Input, Badge
├── constants/
│   ├── theme.ts               # Design tokens
│   ├── config.ts              # ENV + mock mode
│   └── nav.ts                 # Navigation items
├── hooks/useResponsive.ts     # Web breakpoints
├── lib/
│   ├── supabase.ts            # Supabase client (or null in mock)
│   ├── auth.ts                # OAuth, profile
│   ├── stripe.ts              # Payment (mock-ready), formatAmount
│   ├── notifications.ts       # Push reminders
│   ├── mock-data.ts           # Demo data
│   └── company-data.ts        # Public-pages content
├── store/
│   ├── auth.ts                # Zustand: profile, session
│   └── booking.ts             # Zustand: bookings, rentals, drafts
├── types/index.ts             # Domain types
├── i18n/                      # en / ru / pt-BR + init
├── supabase/
│   ├── schema.sql             # Tables, enums, RLS, triggers
│   ├── seed.sql               # Service catalogue and fleet
│   └── README.md              # Backend setup
├── docs/
│   └── SPECIFICATION.md       # Full spec (for humans and AI agents)
├── metro.config.js            # @opentelemetry/api shim for web
├── app.json                   # Expo config
├── CLAUDE.md                  # Project rules
└── TZ.md                      # Original short spec (RU)
```

---

## Architecture

- **Routing.** The root `app/_layout.tsx` is a `Stack` with an `AuthGate`:
  with a profile it redirects to `(tabs)`, otherwise to `welcome`. The
  `(public)` group (contacts, fleet, about) is open to both guests and
  authenticated users. The `(tabs)` group renders `AppShell` + `Slot` (no
  separate navigator, so the shell adapts to the platform). The `booking` /
  `rental` / `checkout` flows open over the shell as root-stack screens.
- **State.** Local UI state via `useState`; cross-screen state via Zustand
  (`store/auth.ts`, `store/booking.ts`). Server data through React Query
  (ready for Supabase wiring).
- **Mock mode.** `Config.useMock` (`constants/config.ts`) is on until `.env`
  is filled. In this mode `lib/*` return data from `lib/mock-data.ts` and
  `lib/stripe.ts` simulates a successful payment.
- **Responsiveness.** One set of screens; layout primitives (`Page`, `Grid`,
  `AppShell`) change behaviour via `useResponsive()`.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Enable **Google** and **Apple** providers in Authentication → Providers,
   add the redirect `carservice1://auth-callback`.
4. Copy `.env.example` → `.env`, paste `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`, set `EXPO_PUBLIC_USE_MOCK=false`.
5. Restart `npx expo start` — the app switches to live data.

To verify everything is wired up correctly:

```bash
npm run check:supabase -- https://YOUR.supabase.co YOUR_ANON_KEY
```

The script lists which tables exist, how many rows they contain, whether
RLS protects the private ones, and whether Google/Apple providers are on.

The schema enables **Row Level Security** on every table, ships an
`is_admin()` helper and a trigger that auto-creates `profiles` on signup.
Details — in [`supabase/README.md`](supabase/README.md).

---

## Stripe setup

In the MVP payment is simulated (`lib/stripe.ts`). For real payments:

1. Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env`.
2. Deploy a backend (Supabase Edge Function `create-payment-intent`) that
   creates a `PaymentIntent` and returns the `client_secret`.
3. Replace the `presentPaymentSheet` body with `initPaymentSheet` +
   `presentPaymentSheet` from `@stripe/stripe-react-native`.
4. Configure `merchantIdentifier` (Apple Pay) and Google Pay in `app.json`
   (the `@stripe/stripe-react-native` plugin).

> **Note.** The Stripe Expo plugin is intentionally **not enabled** in
> `app.json` so the app works in Expo Go for testing. When integrating real
> payments, add the plugin and run a development build
> (`npx expo prebuild` + `expo run:android`).

---

## Localization

Translations live in `i18n/{en,ru,pt-BR}.json`, init in `i18n/index.ts`
(language detected from the system, fallback English). In components:

```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('home.bookRepair')}</Text>
```

Runtime switching — the `LanguageSwitcher` component (used in Welcome and
Profile).

---

## Commands

```bash
npm start            # Expo dev server
npm run web          # run in browser
npm run android      # Android
npm run ios          # iOS
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # expo lint
```

---

## Roadmap

- [ ] Real Stripe integration (Edge Function + Payment Sheet)
- [ ] Realtime booking statuses (Supabase Realtime)
- [ ] Upload car photos to Supabase Storage
- [ ] Maps and geolocation of service centres
- [ ] Mechanic role with a personal schedule
- [ ] Email / phone auth alongside OAuth
- [ ] EAS Build and publishing to App Store / Google Play

---

## Documentation

- 📄 [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) — **full spec**: every
  screen, component, data model, scenario, acceptance criterion. Written so
  that both a developer and an AI agent can rebuild the app from it.
- 📄 [`docs/CONTENT.md`](docs/CONTENT.md) — **content management guide**: how
  to change prices, photos, car names, add services and cars; both for the
  mock mode (edit code) and the Supabase Dashboard.
- 📄 [`TZ.md`](TZ.md) — original short spec (RU).
- 📄 [`supabase/README.md`](supabase/README.md) — backend setup.
- 📄 [`README.ru.md`](README.ru.md) — Russian version of this README.

---

<sub>AutoDuck · made with 💚💛💙 in Brazilian style.</sub>
