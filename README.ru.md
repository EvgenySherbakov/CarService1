# CarService1 — AutoDuck 🦆

**Языки:** [English](README.md) · **Русский**

Кроссплатформенное приложение (**Web · iOS · Android** из единой кодовой базы)
для автосервиса **AutoDuck**: запись на **ремонт** и **мойку**, **аренда
автомобилей** с онлайн-оплатой. Дизайн в цветах флага Бразилии, интерфейс на
трёх языках.

> Стек: **Expo Router + React Native + TypeScript + Supabase + Stripe**.
> Сейчас работает на mock-данных — без ключей бэкенда запускается «из коробки».

---

## Содержание

- [Возможности](#возможности)
- [Скриншоты экранов](#экраны)
- [Технологический стек](#технологический-стек)
- [Дизайн-система](#дизайн-система)
- [Быстрый старт](#быстрый-старт)
- [Запуск на Web / Android / iOS](#запуск-на-платформах)
- [Структура проекта](#структура-проекта)
- [Архитектура](#архитектура)
- [Подключение Supabase](#подключение-supabase)
- [Подключение Stripe](#подключение-stripe)
- [Локализация](#локализация)
- [Команды](#команды)
- [Roadmap](#roadmap)
- [Документация](#документация)

---

## Возможности

### Без регистрации (гостевой доступ)
С экрана входа доступны публичные страницы:
- 📞 **Контакты** — телефоны, WhatsApp, email, адрес, карта
- 🚗 **Автопарк** — каталог авто для аренды с описанием и ценой «от»
- ℹ️ **О компании** — история, владельцы и директор, галерея автосервиса

### Для клиента
- 🔐 Вход через **Google** и **Apple** (Supabase OAuth)
- 🔧 **Запись на ремонт** — каталог услуг, выбор авто, даты, времени, комментарий
- 💧 **Запись на мойку** — пакеты услуг и свободные слоты
- 🚗 **Аренда авто** — каталог, период аренды, расчёт по дням, депозит
- 💳 **Оплата через Stripe** — карта, **Apple Pay**, **Google Pay**, депозит-холд
- 📅 **Мои записи** — предстоящие и прошедшие, статусы
- 🚙 **Мой гараж** — автомобили пользователя
- ⭐ **Отзывы и рейтинги** услуг и автомобилей
- 🔔 **Push-уведомления** — напоминания о записях
- 🌐 **3 языка** — English, Русский, Português (pt-BR)

### Для администратора (AutoDuck)
- 📊 Дашборд: записи на сегодня, выручка, активные аренды, новые отзывы
- 🚗 Управление автопарком
- 📅 Просмотр и управление записями

---

## Экраны

| Группа | Экран | Файл |
|--------|-------|------|
| Auth | Welcome / вход | `app/(auth)/welcome.tsx` |
| Публичный | Контакты | `app/(public)/contact.tsx` |
| Публичный | Автопарк (аренда) | `app/(public)/fleet.tsx` |
| Публичный | О компании | `app/(public)/about.tsx` |
| Клиент | Главная (Dashboard) | `app/(tabs)/index.tsx` |
| Клиент | Услуги (ремонт/мойка) | `app/(tabs)/services.tsx` |
| Клиент | Аренда | `app/(tabs)/rentals.tsx` |
| Клиент | Записи | `app/(tabs)/bookings.tsx` |
| Клиент | Профиль | `app/(tabs)/profile.tsx` |
| Поток | Бронирование услуги | `app/booking/[serviceId].tsx` |
| Поток | Бронирование аренды | `app/rental/[carId].tsx` |
| Поток | Оплата (Stripe) | `app/checkout/[type].tsx` |
| Админ | Дашборд | `app/admin/index.tsx` |

Подробное описание каждого экрана, состояний и сценариев — в
[`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).

---

## Технологический стек

| Слой | Технология | Назначение |
|------|-----------|-----------|
| UI / Runtime | React Native `0.81` + Expo SDK `54` | единый код Web/iOS/Android |
| Роутинг | Expo Router `v6` (file-based) | навигация по файловой структуре |
| Язык | TypeScript (strict) | типобезопасность |
| Состояние (клиент) | Zustand | auth-стор, booking-стор |
| Серверное состояние | TanStack React Query | кеш запросов к Supabase |
| Бэкенд / БД | Supabase (Postgres + Auth + Storage + RLS) | данные, аутентификация |
| Платежи | Stripe (`@stripe/stripe-react-native`) | оплата, Apple/Google Pay |
| i18n | i18next + expo-localization | мультиязычность |
| Push | expo-notifications | напоминания |
| Графика | expo-linear-gradient, react-native-svg | градиенты, иконки |

---

## Дизайн-система

Цвета вдохновлены флагом Бразилии, но осовременены (как у NuBank/iFood):

| Токен | HEX | Применение |
|-------|-----|-----------|
| `primary` | `#00A859` | основной зелёный |
| `accent` | `#FFD400` | жёлтый акцент |
| `secondary` | `#0B2D6E` | глубокий синий (сайдбар, hero) |
| `coral` | `#FF6B5C` | дополнительный акцент |
| `background` | `#FAFCF9` | тёплый фон |
| `text` | `#0E1A2B` | charcoal-navy текст |

Все токены — в `constants/theme.ts` (`Palette`, `Spacing`, `Radius`,
`Typography`, `Shadow`, `Gradients`). Стиль: flat, скруглённые карточки
(18–28 px), мягкие тени с синим оттенком, градиенты из палитры флага.

**Адаптивность** (`hooks/useResponsive.ts`):
- `< 1000px` (телефон) — нижние вкладки, контент на всю ширину
- `≥ 1000px` (десктоп) — **боковое меню** + контент с max-width по центру
- `≥ 1340px` (wide) — расширенные сетки

---

## Быстрый старт

```bash
git clone https://github.com/EvgenySherbakov/CarService1.git
cd CarService1
npm install
npx expo start
```

Без файла `.env` приложение запускается на **mock-данных** —
весь UI и все сценарии (включая «оплату») работают локально.

> ⚠️ Требуется **Node.js 18+** и npm. На Windows запускайте из PowerShell или cmd.

---

## Запуск на платформах

После `npx expo start` в терминале:

| Клавиша | Платформа | Требования |
|---------|-----------|-----------|
| `w` | Web (браузер) | — |
| `a` | Android | эмулятор или **Expo Go** на телефоне |
| `i` | iOS | только на macOS / Expo Go на iPhone |

> В средах без доступа к сети Expo используйте `EXPO_OFFLINE=1 npx expo start`.

### Android через Expo Go (без Android Studio)

Самый простой способ протестировать на телефоне — **Expo Go**, не требует
Android Studio, эмулятора и установки SDK.

1. На Android-телефоне установите бесплатное приложение **Expo Go** из Google
   Play.
2. Убедитесь, что телефон и компьютер в **одной Wi-Fi сети**.
3. На компьютере запустите `npx expo start`.
4. В терминале появится QR-код. Откройте Expo Go и **отсканируйте** его.
5. Приложение загрузится и запустится на телефоне.

**Если Wi-Fi разная или есть проблемы с подключением** — запустите tunnel-режим:

```bash
npx expo start --tunnel
```

Он создаст публичный URL через ngrok, и QR-код будет работать с любой сети
(в т.ч. мобильный интернет на телефоне).

### Что если нажали `a` и видите «Failed to resolve the Android SDK path»

Это значит, что у вас не установлены Android Studio + SDK. Не нужно их
устанавливать ради тестирования — используйте **Expo Go** (см. выше).

Полный путь Android-разработчика (Android Studio + эмулятор + SDK) нужен
только для production-сборки в Google Play.

---

## Структура проекта

```
CarService1/
├── app/                       # Экраны (Expo Router, file-based)
│   ├── _layout.tsx            # Root Stack + AuthGate (редирект по сессии)
│   ├── index.tsx              # Редирект на (tabs) или (auth)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── welcome.tsx        # Вход Google/Apple + гостевые ссылки
│   ├── (public)/              # Публичные страницы (без регистрации)
│   │   ├── _layout.tsx
│   │   ├── contact.tsx        # Контакты + карта
│   │   ├── fleet.tsx          # Автопарк для аренды
│   │   └── about.tsx          # О компании / команда / галерея
│   ├── (tabs)/                # Клиентская оболочка (AppShell)
│   │   ├── _layout.tsx        # AppShell + Slot
│   │   ├── index.tsx          # Главная / Dashboard
│   │   ├── services.tsx       # Каталог услуг
│   │   ├── rentals.tsx        # Каталог авто
│   │   ├── bookings.tsx       # Мои записи
│   │   └── profile.tsx        # Профиль
│   ├── booking/[serviceId].tsx# Бронирование услуги
│   ├── rental/[carId].tsx     # Бронирование аренды
│   ├── checkout/[type].tsx    # Оплата (booking | rental)
│   └── admin/                 # Админ-панель
│       ├── _layout.tsx
│       └── index.tsx
├── components/
│   ├── AppShell.tsx           # Сайдбар (desktop) / нижние вкладки (mobile)
│   ├── ServiceCard.tsx        # Карточка услуги
│   ├── CarCard.tsx            # Карточка авто
│   ├── BookingCard.tsx        # Карточка записи
│   ├── RatingStars.tsx        # Рейтинг звёздами
│   ├── LanguageSwitcher.tsx   # Переключатель языка
│   ├── SectionHeader.tsx      # Заголовок секции + «смотреть все»
│   ├── layout/                # Page, PageHeader, FlowHeader, Grid
│   └── ui/                    # Button, Card, Input, Badge
├── constants/
│   ├── theme.ts               # Дизайн-токены
│   ├── config.ts              # ENV + mock-режим
│   └── nav.ts                 # Пункты навигации
├── hooks/useResponsive.ts     # Брейкпоинты web
├── lib/
│   ├── supabase.ts            # Клиент Supabase (или null в mock)
│   ├── auth.ts                # OAuth, профиль
│   ├── stripe.ts              # Оплата (mock-ready), formatAmount
│   ├── notifications.ts       # Push-напоминания
│   ├── mock-data.ts           # Демоданные
│   └── company-data.ts        # Контент публичных страниц
├── store/
│   ├── auth.ts                # Zustand: профиль, сессия
│   └── booking.ts             # Zustand: записи, аренды, черновики
├── types/index.ts             # Доменные типы
├── i18n/                      # en / ru / pt-BR + init
├── supabase/
│   ├── schema.sql             # Таблицы, enum, RLS, триггеры
│   ├── seed.sql               # Каталог услуг и автопарк
│   └── README.md              # Инструкция по настройке
├── docs/
│   └── SPECIFICATION.md       # Полное ТЗ (для людей и AI-агентов)
├── metro.config.js            # Shim @opentelemetry/api для web
├── app.json                   # Конфиг Expo
└── TZ.md                      # Краткое ТЗ (исходное)
```

---

## Архитектура

- **Роутинг.** Корневой `app/_layout.tsx` — `Stack` с `AuthGate`: при наличии
  профиля редиректит в `(tabs)`, иначе — на `welcome`. Группа `(tabs)`
  рендерит `AppShell` + `Slot` (без отдельного навигатора, чтобы оболочка
  адаптировалась к платформе). Потоки `booking` / `rental` / `checkout`
  открываются поверх оболочки как экраны корневого стека.
- **Состояние.** Локальное UI-состояние — `useState`; кросс-экранное —
  Zustand (`store/auth.ts`, `store/booking.ts`). Серверные данные — через
  React Query (готово к подключению Supabase).
- **Mock-режим.** `Config.useMock` (`constants/config.ts`) включён, пока не
  заданы переменные `.env`. В этом режиме `lib/*` возвращают данные из
  `lib/mock-data.ts`, а `lib/stripe.ts` имитирует успешную оплату.
- **Адаптивность.** Один набор экранов; layout-примитивы (`Page`, `Grid`,
  `AppShell`) меняют поведение по `useResponsive()`.

---

## Подключение Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В SQL-редакторе выполните `supabase/schema.sql`, затем `supabase/seed.sql`.
3. Включите провайдеры **Google** и **Apple** в Authentication → Providers,
   добавьте redirect `carservice1://auth-callback`.
4. Скопируйте `.env.example` → `.env` и впишите `EXPO_PUBLIC_SUPABASE_URL` и
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`, поставьте `EXPO_PUBLIC_USE_MOCK=false`.
5. Перезапустите `npx expo start` — приложение переключится на живые данные.

Чтобы проверить, что всё применилось правильно:

```bash
npm run check:supabase -- https://ВАШ.supabase.co ВАШ_ANON_KEY
```

Скрипт покажет, какие таблицы есть, сколько в них строк, защищены ли
приватные таблицы RLS и включены ли провайдеры Google/Apple.

Схема использует **Row Level Security** на всех таблицах, функцию
`is_admin()` и триггер автосоздания `profiles` при регистрации. Детали — в
[`supabase/README.md`](supabase/README.md).

---

## Подключение Stripe

В MVP оплата сымитирована (`lib/stripe.ts`). Для реальных платежей:

1. Добавьте `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` в `.env`.
2. Разверните бэкенд (Supabase Edge Function `create-payment-intent`),
   создающий `PaymentIntent` и возвращающий `client_secret`.
3. Замените тело `presentPaymentSheet` на `initPaymentSheet` +
   `presentPaymentSheet` из `@stripe/stripe-react-native`.
4. Настройте `merchantIdentifier` (Apple Pay) и Google Pay в `app.json`.

---

## Локализация

Переводы — в `i18n/{en,ru,pt-BR}.json`, инициализация — `i18n/index.ts`
(язык подхватывается из системы, fallback — английский). В компонентах:

```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('home.bookRepair')}</Text>
```

Переключение языка в рантайме — компонент `LanguageSwitcher` (в Welcome и
Профиле).

---

## Команды

```bash
npm start            # Expo dev-сервер
npm run web          # запуск в браузере
npm run android      # Android
npm run ios          # iOS
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # expo lint
```

---

## Roadmap

- [ ] Реальная интеграция Stripe (Edge Function + Payment Sheet)
- [ ] Realtime-статусы записей (Supabase Realtime)
- [ ] Загрузка фото авто в Supabase Storage
- [ ] Карты и геолокация сервисных центров
- [ ] Роль механика с графиком работ
- [ ] Email/телефон-аутентификация в дополнение к OAuth
- [ ] EAS Build и публикация в App Store / Google Play

---

## Документация

- 📄 [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) — **полное ТЗ**: каждый
  экран, компонент, модель данных, сценарии, критерии готовности. Написано
  так, чтобы по нему мог собрать приложение как человек, так и AI-агент.
- 📄 [`docs/CONTENT.md`](docs/CONTENT.md) — **гид по контенту**: как менять
  цены, фото, названия авто, добавлять услуги. Для mock-режима (правка
  кода) и для Supabase Dashboard.
- 📄 [`TZ.md`](TZ.md) — исходное краткое ТЗ.
- 📄 [`supabase/README.md`](supabase/README.md) — настройка бэкенда.

---

<sub>AutoDuck · сделано с 💚💛💙 в стиле Бразилии.</sub>
