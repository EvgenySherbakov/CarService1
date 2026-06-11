# Архитектура — CarService1 / AutoDuck

Описание системы в **C4 модели** Симона Брауна — три уровня детализации, от
взгляда «снаружи» (контекст) до взгляда «внутри одного контейнера»
(компоненты фронтенда).

> Диаграммы написаны в **Mermaid** — GitHub отрисует их прямо в README.
> Если ваш просмотрщик не поддерживает Mermaid, ниже каждой диаграммы есть
> текстовое пояснение.

---

## C1 — System Context

Система **AutoDuck App** в окружении пользователей и внешних сервисов.

```mermaid
graph TB
    Client["👤 Клиент<br/>(владелец авто)"]
    Admin["👨‍💼 Менеджер AutoDuck<br/>(администратор)"]

    System["🦆 AutoDuck App<br/>(Web · iOS · Android)<br/><br/>Запись на ремонт/мойку,<br/>аренда авто, оплата"]

    Supabase["🟢 Supabase<br/>Auth + Postgres + Storage<br/>+ Row Level Security"]
    Stripe["💳 Stripe<br/>Payment Sheet,<br/>Apple Pay / Google Pay"]
    Google["🔵 Google Identity<br/>OAuth 2.0"]
    Apple["⚫ Apple<br/>Sign in with Apple"]
    ExpoPush["🔔 Expo Push<br/>Notification Service"]
    Maps["🗺️ Google Maps<br/>(deep link)"]

    Client -->|использует| System
    Admin -->|администрирует| System

    System -->|данные, аутентификация| Supabase
    System -->|онлайн-оплата| Stripe
    System -->|локальные напоминания| ExpoPush
    System -->|открывает адрес| Maps

    Supabase -->|OAuth federation| Google
    Supabase -->|OAuth federation| Apple
```

**Что видно на диаграмме:**

- **Два типа пользователей.** Клиент бронирует, менеджер AutoDuck смотрит
  дашборд и управляет автопарком.
- **Один пользовательский продукт.** Web/iOS/Android — это одно приложение
  на единой кодовой базе (Expo + React Native).
- **Бэкенд — Supabase.** Не свой сервер, а managed-Postgres с Auth, Storage
  и встроенным RLS. OAuth-провайдеры (Google, Apple) подключаются к Supabase
  Auth, а не к приложению напрямую.
- **Платежи опциональны.** Stripe вызывается только если клиент выбирает
  «Оплатить сейчас»; путь «Оплата в офисе» к Stripe не обращается.
- **Карты — deep link.** Своего гео-сервиса нет; экран контактов открывает
  Google Maps по адресу.

---

## C2 — Container

Внутри коробки **AutoDuck App** — что это за «контейнеры» в C4-смысле,
и как они общаются с внешним миром.

```mermaid
graph TB
    subgraph "Клиентские контейнеры"
        Web["🌐 Web App<br/>React Native Web<br/>(браузер)"]
        Mobile["📱 Mobile App<br/>iOS / Android<br/>(Expo Go или нативная сборка)"]
    end

    subgraph "Supabase (managed)"
        Auth["🔐 Supabase Auth<br/>JWT + OAuth"]
        DB["🗄️ Postgres + RLS<br/>profiles, services,<br/>rental_cars, bookings,<br/>rentals, payments, reviews"]
        Storage["📁 Storage<br/>public-images bucket<br/>(фото услуг и авто)"]
        EdgeFn["⚙️ Edge Functions<br/>(roadmap: create-payment-intent)"]
    end

    StripeAPI["💳 Stripe API"]

    Web -->|"@supabase/supabase-js<br/>HTTPS / JWT"| Auth
    Web -->|REST / Realtime| DB
    Web -->|публичные URL| Storage
    Mobile -->|"@supabase/supabase-js"| Auth
    Mobile -->|REST / Realtime| DB
    Mobile -->|публичные URL| Storage

    Web -.->|payment intent<br/>(roadmap)| EdgeFn
    Mobile -.->|payment intent<br/>(roadmap)| EdgeFn
    EdgeFn -.->|server-side| StripeAPI

    Web -->|"@stripe/stripe-react-native"<br/>(client SDK)| StripeAPI
    Mobile -->|"@stripe/stripe-react-native"| StripeAPI
```

**Контейнеры и стек:**

| Контейнер | Технология | Деплой |
|-----------|-----------|--------|
| Web App | React Native Web + Expo Router (export web) | Vercel / Netlify (статика) |
| Mobile App | React Native + Expo SDK 54 | Expo Go (dev), EAS Build → App Store / Google Play (prod) |
| Supabase Auth | Supabase managed | supabase.com |
| Postgres + RLS | Supabase Postgres | supabase.com |
| Storage | Supabase Storage | supabase.com |
| Edge Functions | Deno runtime (Supabase) | supabase.com — *в roadmap* |
| Stripe API | Stripe.com | внешний SaaS |

**Поток данных:**

- Клиент → Supabase: запросы идут с JWT-токеном; **Row Level Security**
  отсекает чужие данные на уровне базы — на клиент попадает только то, что
  клиент имеет право видеть.
- Клиент → Stripe (текущее MVP): SDK работает напрямую с публичным ключом,
  payment intent эмулируется (mock-режим).
- Клиент → Stripe через Edge Function (roadmap): production-вариант, где
  intent создаётся на сервере с secret-ключом.

---

## C3 — Component (Frontend)

Что внутри Web/Mobile-контейнера — функциональные модули и их связи.

```mermaid
graph TB
    subgraph "App / Expo Router"
        Root["app/_layout.tsx<br/>Root Stack + AuthGate"]
        Public["(public)/<br/>Гостевые страницы:<br/>contact · fleet · about"]
        Auth["(auth)/<br/>Welcome / OAuth"]
        Tabs["(tabs)/<br/>Home · Services · Rentals<br/>Bookings · Profile"]
        Flows["Flows<br/>booking · rental ·<br/>checkout · booking-success"]
        Admin["admin/<br/>Dashboard"]
    end

    subgraph "Layout & UI"
        Shell["AppShell<br/>Sidebar / BottomTabs"]
        Layout["Page · PageHeader ·<br/>Grid · FlowHeader"]
        UI["ui/<br/>Button · Card · Input · Badge"]
        Cards["ServiceCard · CarCard ·<br/>BookingCard · RatingStars"]
    end

    subgraph "State (Zustand)"
        AuthStore["store/auth.ts<br/>profile, hydrated"]
        BookingStore["store/booking.ts<br/>bookings, rentals,<br/>drafts"]
    end

    subgraph "Service Layer"
        SupaLib["lib/supabase.ts<br/>(client or null)"]
        AuthLib["lib/auth.ts<br/>signInWithProvider"]
        StripeLib["lib/stripe.ts<br/>presentPaymentSheet"]
        Currency["lib/currency.ts<br/>formatAmount"]
        Notif["lib/notifications.ts<br/>scheduleReminder"]
        Mock["lib/mock-data.ts<br/>lib/company-data.ts"]
    end

    subgraph "Foundation"
        Theme["constants/theme.ts<br/>Palette, Typography,<br/>Spacing, Shadow"]
        Config["constants/config.ts<br/>ENV, useMock flag"]
        I18n["i18n/<br/>en · ru · pt-BR"]
        Hooks["hooks/useResponsive"]
        Types["types/<br/>Profile, Service,<br/>RentalCar, Booking, ..."]
    end

    Root --> Public
    Root --> Auth
    Root --> Tabs
    Root --> Flows
    Root --> Admin

    Tabs --> Shell
    Public --> Layout
    Tabs --> Layout
    Flows --> Layout
    Admin --> Layout

    Layout --> UI
    Layout --> Cards
    Cards --> UI

    Auth --> AuthStore
    Tabs --> AuthStore
    Tabs --> BookingStore
    Flows --> BookingStore
    Admin --> BookingStore

    AuthLib --> SupaLib
    AuthLib --> Mock
    Cards --> Currency
    Flows --> Currency
    Flows --> StripeLib
    Flows --> Notif
    Layout --> Theme
    UI --> Theme
    Cards --> Theme

    SupaLib --> Config
    StripeLib --> Config
    AuthLib --> Config

    Public --> I18n
    Auth --> I18n
    Tabs --> I18n
    Flows --> I18n
    UI --> Hooks
    Shell --> Hooks
    Layout --> Hooks
```

**Модули и их роли:**

| Слой | Что делает | Ключевые файлы |
|------|-----------|----------------|
| **App / Router** | Маршрутизация + AuthGate (редиректы по сессии) | `app/_layout.tsx`, группы `(public)`, `(auth)`, `(tabs)` |
| **Layout & UI** | Адаптивный shell, layout-примитивы, базовые UI-компоненты, доменные карточки | `components/AppShell.tsx`, `components/layout/*`, `components/ui/*`, `components/{Service,Car,Booking}Card.tsx` |
| **State** | Zustand-сторы для сессии и записей; черновики bookingDraft / rentalDraft | `store/auth.ts`, `store/booking.ts` |
| **Service Layer** | Тонкая обёртка над Supabase, Stripe, push, форматированием. Поддерживает mock-режим без бэкенда | `lib/*.ts` |
| **Foundation** | Дизайн-токены, ENV/конфиг, i18n, типы, адаптивные хуки | `constants/`, `i18n/`, `types/`, `hooks/` |

**Правила границ:**

- Экраны зависят от `lib/*` и `store/*`, **никогда не наоборот**.
- `lib/*` зависит только от `constants/config.ts` и типов.
- Компоненты не импортируют экраны.
- Все цвета — через `Palette`, все строки — через `t()`, всё это закреплено
  в [`CLAUDE.md`](../CLAUDE.md).

---

## Mock-режим vs Live-режим

Один из ключевых архитектурных приёмов проекта — **переключаемый источник
данных**. Без `.env` или с `EXPO_PUBLIC_USE_MOCK=true` все сервисы возвращают
демоданные; при заполненных ключах Supabase автоматически активируется live.

```mermaid
graph LR
    Screen["Экран / Хук"] --> Lib["lib/auth · lib/stripe · ..."]
    Lib --> Config{"Config.useMock?"}
    Config -->|"true (нет .env)"| MockData["lib/mock-data.ts<br/>lib/company-data.ts"]
    Config -->|"false (есть .env)"| SupaClient["lib/supabase.ts<br/>→ HTTP/Realtime"]
    SupaClient --> SB[("Supabase")]
```

Это даёт две важные вещи: приложение работает «из коробки» сразу после
`git clone && npm install`, и команды разработки и контента могут двигаться
параллельно.

---

## Ссылки

- [Spec — все экраны и контракты](SPECIFICATION.md)
- [Content guide — как менять контент](CONTENT.md)
- [Supabase setup](../supabase/README.md)
- C4 model: https://c4model.com
- Mermaid: https://mermaid.js.org
