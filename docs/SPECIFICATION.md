# Техническое задание — CarService1 / AutoDuck

> **Назначение документа.** Это полная, самодостаточная спецификация
> приложения. Она написана так, чтобы по ней мог воспроизвести продукт как
> человек-разработчик, так и **AI-агент**: каждый экран, компонент, модель
> данных, маршрут, состояние и сценарий описаны явно, с указанием файлов,
> i18n-ключей и критериев приёмки.
>
> **Формат для агента.** Документ детерминирован: маршруты, имена файлов,
> названия токенов и ключей переводов — это контракт. При генерации кода
> используйте именно эти идентификаторы. Раздел [§16 «Чек-лист сборки»](#16-чек-лист-для-ai-агента)
> содержит пошаговый план реализации с нуля.

---

## Оглавление

1. [Обзор продукта](#1-обзор-продукта)
2. [Роли и сценарии](#2-роли-и-сценарии)
3. [Технологический стек](#3-технологический-стек)
4. [Дизайн-система](#4-дизайн-система)
5. [Адаптивность и навигация](#5-адаптивность-и-навигация)
6. [Карта маршрутов](#6-карта-маршрутов)
7. [Модель данных](#7-модель-данных)
8. [Спецификация экранов](#8-спецификация-экранов)
9. [Переиспользуемые компоненты](#9-переиспользуемые-компоненты)
10. [Состояние приложения (stores)](#10-состояние-приложения-stores)
11. [Сервисный слой (lib)](#11-сервисный-слой-lib)
12. [Платежи (Stripe)](#12-платежи-stripe)
13. [Локализация](#13-локализация)
14. [Конфигурация и окружение](#14-конфигурация-и-окружение)
15. [Нефункциональные требования](#15-нефункциональные-требования)
16. [Чек-лист для AI-агента](#16-чек-лист-для-ai-агента)

---

## 1. Обзор продукта

**CarService1** — кроссплатформенное приложение (Web, iOS, Android из одной
кодовой базы) бренда **AutoDuck**. Покрывает три направления услуг:

1. **Ремонт автомобилей** — запись на сервис с выбором услуги, авто, даты/времени.
2. **Мойка** — запись на пакеты мойки по свободным слотам.
3. **Аренда автомобилей** — выбор авто, периода, оплата + возвратный депозит.

Дополнительно: онлайн-оплата (Stripe), отзывы, push-напоминания, история
заказов, мультиязычность (en/ru/pt-BR), админ-панель.

**Целевые платформы:** Web (приоритет — десктоп + мобильный браузер),
Android, iOS.

**Бренд:** цвета флага Бразилии в современном flat-исполнении.

---

## 2. Роли и сценарии

### 2.1 Роли

| Роль | Идентификатор | Доступ |
|------|---------------|--------|
| Клиент | `client` | основной интерфейс: услуги, аренда, записи, оплата, профиль |
| Администратор | `admin` | всё клиентское + админ-панель (дашборд, автопарк, записи) |

> В БД роль хранится в `profiles.role` (enum `user_role`). Доступ к данным
> разграничивается через **RLS** и функцию `is_admin(uid)`.

### 2.2 Ключевые пользовательские сценарии (user flows)

**Сценарий A — Запись на ремонт/мойку:**
`Welcome → вход → Главная → Услуги → карточка услуги → Бронирование
(авто + дата + время + комментарий) → Оплата → Успех → Мои записи`.

**Сценарий B — Аренда авто:**
`Главная/Аренда → карточка авто → выбор периода → Оплата (аренда + депозит-холд)
→ Успех → Мои записи`.

**Сценарий C — Администрирование:**
`Профиль → Админ-панель → дашборд (KPI) → список записей / автопарк`.

---

## 3. Технологический стек

| Слой | Технология | Версия | Файлы |
|------|-----------|--------|-------|
| Runtime/UI | React Native | 0.74.x | весь `app/`, `components/` |
| Платформа | Expo SDK | 51 | `app.json`, `package.json` |
| Роутинг | Expo Router | 3.5.x | `app/**` |
| Язык | TypeScript (strict) | 5.3 | `tsconfig.json` |
| Локальное состояние | Zustand | 4.5 | `store/` |
| Серверное состояние | TanStack React Query | 5 | `app/_layout.tsx` |
| Бэкенд | Supabase JS | 2.45 | `lib/supabase.ts`, `supabase/` |
| Платежи | @stripe/stripe-react-native | 0.37 | `lib/stripe.ts` |
| i18n | i18next + react-i18next + expo-localization | — | `i18n/` |
| Push | expo-notifications | 0.28 | `lib/notifications.ts` |
| Градиенты | expo-linear-gradient | 13 | многие экраны |

**Метро-конфиг:** `metro.config.js` содержит резолвер-shim, заменяющий
опциональный `@opentelemetry/api` (из supabase-js) на пустой модуль — иначе
web-сборка падает.

---

## 4. Дизайн-система

Все токены — в `constants/theme.ts`. **Не использовать сырые HEX в экранах** —
только через `Palette`.

### 4.1 Палитра (`Palette`)

| Токен | HEX | Назначение |
|-------|-----|-----------|
| `primary` | `#00A859` | основной зелёный (кнопки, акценты) |
| `primaryDark` | `#00753E` | градиенты, нажатия |
| `primaryLight` | `#34C77B` | светлый зелёный |
| `primarySoft` | `#B6F2D3` | мятный фон иконок/чипов |
| `accent` | `#FFD400` | жёлтый акцент |
| `accentDark` | `#E6B800` | тёмно-жёлтый |
| `secondary` | `#0B2D6E` | синий: сайдбар, hero, админ |
| `secondaryLight` | `#1D4FB3` | светлый синий |
| `coral` | `#FF6B5C` | дополнительный акцент |
| `background` | `#FAFCF9` | фон экранов |
| `surface` | `#F1F5F1` | поверхности, поля ввода |
| `card` | `#FFFFFF` | карточки |
| `border` | `#E0E6DE` | границы |
| `text` | `#0E1A2B` | основной текст |
| `textSecondary` | `#4A5567` | вторичный текст |
| `textMuted` | `#8A93A6` | приглушённый |
| `success/warning/danger/info` | — | статусы |
| `white` / `black` | `#FFFFFF` / `#0A0A0A` | контраст |

### 4.2 Прочие токены

- `Spacing`: `xxs=4, xs=8, sm=12, md=16, lg=24, xl=32, xxl=48`.
- `Radius`: `sm=8, md=12, lg=18, xl=28, pill=999`.
- `Typography`: `display(40/900), h1(32/800), h2(24/700), h3(20/700),
  h4(18/600), body(16/400), bodyBold(16/600), caption(14/400), small(12/500)`.
- `Shadow`: `sm | md | lg` (тени с синим оттенком `#0B2D6E`).
- `Gradients`: `brazilFlag, green, yellow, blue, hero, sunset, mint, carnival`.

### 4.3 Визуальный язык

Flat-стиль; карточки со скруглением 18–28 px; мягкие тени; круглые иконочные
плашки (эмодзи-иконки в MVP); градиентные hero-блоки; чипы-фильтры в форме
pill. Контраст текста на цветном фоне обязателен (белый на зелёном/синем).

---

## 5. Адаптивность и навигация

Хук `hooks/useResponsive.ts` возвращает `{ width, height, isWeb, isDesktop,
isWide }`. Брейкпоинты: `desktop = 1000px`, `wide = 1340px`.

| Ширина | Навигация | Раскладка контента |
|--------|-----------|--------------------|
| `< 1000` (телефон) | нижние вкладки (`AppShell` → `BottomTabs`) | 1 колонка, на всю ширину |
| `≥ 1000` (десктоп) | боковое меню слева (`AppShell` → `Sidebar`) | контент центрирован, `maxWidth ≈ 1080` |
| `≥ 1340` (wide) | боковое меню | сетки 3 колонки |

**Оболочка** `components/AppShell.tsx`:
- Desktop: горизонтальная раскладка `[Sidebar 252px][контент flex:1]`.
- Mobile: вертикальная `[контент flex:1][BottomTabs]`.
- Активный пункт определяется по `usePathname()` и массиву `NAV_ITEMS`
  (`constants/nav.ts`).

**Пункты меню** (`NAV_ITEMS`): `home(/) · services(/services) ·
rentals(/rentals) · bookings(/bookings) · profile(/profile)`.

---

## 6. Карта маршрутов

Expo Router, file-based. Корневой layout — `Stack` без хедера.

| Маршрут | Файл | Назначение | Доступ |
|---------|------|-----------|--------|
| `/` | `app/index.tsx` | редирект в `(tabs)` или `(auth)` | все |
| `/(auth)/welcome` | `app/(auth)/welcome.tsx` | вход | гость |
| `/contact` | `app/(public)/contact.tsx` | контакты (телефоны, WhatsApp, адрес, карта) | **публичный** |
| `/fleet` | `app/(public)/fleet.tsx` | каталог авто для аренды (описание, цена от) | **публичный** |
| `/about` | `app/(public)/about.tsx` | о компании, команда, галерея | **публичный** |
| `/(tabs)` → `/` | `app/(tabs)/index.tsx` | Главная (Dashboard) | client |
| `/services` | `app/(tabs)/services.tsx` | каталог услуг | client |
| `/rentals` | `app/(tabs)/rentals.tsx` | каталог авто | client |
| `/bookings` | `app/(tabs)/bookings.tsx` | мои записи | client |
| `/profile` | `app/(tabs)/profile.tsx` | профиль | client |
| `/booking/[serviceId]` | `app/booking/[serviceId].tsx` | бронирование услуги | client |
| `/rental/[carId]` | `app/rental/[carId].tsx` | бронирование аренды | client |
| `/checkout/[type]` | `app/checkout/[type].tsx` | оплата (`booking`\|`rental`) | client |
| `/admin` | `app/admin/index.tsx` | админ-дашборд | admin |

**AuthGate** (`app/_layout.tsx`): следит за `profile` из `useAuthStore`.
Нет профиля и не в `(auth)` и не в `(public)` → `replace('/(auth)/welcome')`.
Есть профиль и в `(auth)` → `replace('/(tabs)')`. Группа **`(public)`**
(контакты, автопарк, о компании) доступна **без регистрации** как гостям, так
и авторизованным пользователям.

**Потоки** (`booking`/`rental`/`checkout`) открываются поверх оболочки
(push в корневом стеке), имеют собственный `FlowHeader` с кнопкой «назад».

---

## 7. Модель данных

TypeScript-типы — `types/index.ts`. SQL-схема — `supabase/schema.sql`.
Соответствие camelCase (TS) ↔ snake_case (Postgres).

### 7.1 Сущности

```ts
type UserRole = 'client' | 'admin';

Profile   { id, email, fullName, avatarUrl?, phone?, role, preferredLanguage?, createdAt }
Vehicle   { id, ownerId, make, model, year, plate?, vin?, color? }
ServiceType = 'repair' | 'wash'
ServiceCategory { id, type, slug, nameKey, icon }
Service   { id, categoryId, type, name, description, priceFrom, durationMinutes,
            imageUrl, rating, reviewsCount }
RentalCar { id, make, model, year, transmission('automatic'|'manual'),
            fuel('petrol'|'diesel'|'electric'|'hybrid'), seats, pricePerDay,
            depositAmount, imageUrl, available, rating, reviewsCount,
            description? }
TeamMember  { id, name, roleKey, photoUrl }
CompanyInfo { name, legalName, foundedYear, phones[], whatsapp, email,
              address, mapQuery, mapImageUrl, heroImageUrl, gallery[],
              team: TeamMember[], stats{years,clients,cars,rating} }
BookingStatus = 'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'
Booking   { id, clientId, serviceId, service?, vehicleId?, scheduledAt, status,
            notes?, totalAmount, paymentId?, createdAt }
Rental    { id, clientId, carId, car?, startDate, endDate, status, totalAmount,
            depositAmount, paymentId?, createdAt }
PaymentStatus = 'pending'|'succeeded'|'failed'|'refunded'
Payment   { id, clientId, amount, currency, status, stripePaymentIntentId?,
            bookingId?, rentalId?, createdAt }
Review    { id, clientId, clientName, serviceId?, carId?, rating(1..5), comment, createdAt }
```

### 7.2 Таблицы БД (Supabase)

`profiles, vehicles, service_categories, services, rental_cars, bookings,
rentals, payments, reviews, push_tokens`.

**Безопасность:**
- RLS включён на всех таблицах.
- Клиент видит/меняет только свои `bookings/rentals/payments/vehicles`.
- Каталоги (`services`, `rental_cars`, `service_categories`) — публичное чтение.
- `reviews` — публичное чтение, запись только своих.
- Функция `is_admin(uid)` даёт админу полный доступ.
- Триггер `handle_new_user()` создаёт `profiles` при регистрации.

Валюта по умолчанию — **BRL** (`R$`), формат — `Intl.NumberFormat('pt-BR')`.

---

## 8. Спецификация экранов

> Формат каждого экрана: **Маршрут · Файл · Цель · Раскладка · Элементы ·
> Состояния · Взаимодействия · i18n-ключи · Критерии приёмки.**

### 8.1 Welcome (вход)

- **Маршрут / файл:** `/(auth)/welcome` · `app/(auth)/welcome.tsx`
- **Цель:** аутентификация через OAuth, выбор языка.
- **Раскладка:** полноэкранный зелёный градиент + декоративные blob-формы
  (жёлтый/синий круги). Контент центрируется, `maxWidth 520` на десктопе.
- **Элементы:**
  - верх: лого-плашка 🦆 + `LanguageSwitcher`;
  - hero-карточка с фото, badge «★ AutoDuck Premium», названием бренда и слоганом;
  - заголовок `auth.welcomeTitle`, подзаголовок `auth.welcomeSubtitle`;
  - кнопка **Google** (`variant="accent"`, иконка «G» в плашке);
  - кнопка **Apple** (чёрная, белый текст через `textColor`, иконка 🍏);
  - **блок гостевого доступа** (`guestMenu.explore`) — ряд из трёх кнопок без
    регистрации: **Контакты** → `/contact`, **Автопарк** → `/fleet`,
    **О компании** → `/about`;
  - текст соглашения `auth.terms`.
- **Состояния:** `loading: 'google' | 'apple' | null` (спиннер на нажатой кнопке).
- **Взаимодействия:** вход → `signInWithProvider(provider)` → `setProfile` →
  `(tabs)`; гостевые кнопки → `router.push` на публичные страницы.
- **i18n:** `brand.*`, `auth.*`, `guestMenu.*`.
- **Критерии приёмки:** обе кнопки видимы и читаемы (текст не пропадает);
  на десктопе контент по центру; смена языка мгновенно меняет тексты; с
  Welcome можно открыть контакты/автопарк/о компании **без входа**.

### 8.1.1 Контакты (публичный)

- **Маршрут / файл:** `/contact` · `app/(public)/contact.tsx` · доступ — гость+
- **Цель:** способы связи и расположение AutoDuck.
- **Раскладка:** `FlowHeader` (назад) + `Page` + `PageHeader`.
- **Элементы:** карточка-список — телефоны (tap → `tel:`), WhatsApp
  (tap → `wa.me`), email (tap → `mailto:`), адрес, часы работы; ниже —
  «Как нас найти»: карточка с картинкой карты + кнопка `contact.openMaps`
  (открывает Google Maps по `mapQuery` через `Linking`).
- **Данные:** `companyInfo` (`lib/company-data.ts`).
- **i18n:** `contact.*`.
- **Критерии приёмки:** доступна без входа; телефон/WhatsApp/почта/карта
  открываются внешними приложениями; кнопка «назад» возвращает на Welcome.

### 8.1.2 Автопарк (публичный)

- **Маршрут / файл:** `/fleet` · `app/(public)/fleet.tsx` · доступ — гость+
- **Цель:** показать гостю авто для аренды с описанием и начальной ценой.
- **Раскладка:** `FlowHeader` + `Page` + `PageHeader` + `Grid` карточек
  (desktop 2 / mobile 1) + карточка-CTA внизу.
- **Элементы карточки:** фото, badge «недоступно» при `available=false`,
  название, спецификации, **описание** (`car.description`), цена
  «от {pricePerDay} / сутки». Внизу страницы — `fleet.note` + кнопка
  `fleet.loginToRent` → `/(auth)/welcome`.
- **Данные:** `mockRentalCars`.
- **i18n:** `fleet.*`, `common.from/perDay`, `rentals.seats`.
- **Критерии приёмки:** доступна без входа; видны описание и начальная цена;
  бронирование доступно только после входа.

### 8.1.3 О компании (публичный)

- **Маршрут / файл:** `/about` · `app/(public)/about.tsx` · доступ — гость+
- **Цель:** рассказ о компании, команде и автосервисе.
- **Раскладка:** `FlowHeader` + `Page`.
- **Элементы:** hero-фото сервиса с градиентом и заголовком; ряд из 4
  статистик (лет на рынке, клиентов, авто в парке, рейтинг); секция «Наша
  история» (`about.description` + `about.mission`); «Наша команда» — `Grid`
  карточек (фото, имя, роль через `member.roleKey`); «Наш автосервис» —
  `Grid`-галерея фото.
- **Данные:** `companyInfo` (heroImageUrl, stats, team, gallery).
- **i18n:** `about.*` (включая роли `roleFounder/roleCoFounder/roleDirector/
  roleLeadMechanic` и `statYears/statClients/statCars/statRating`).
- **Критерии приёмки:** доступна без входа; показаны описание компании,
  владельцы/директор и фото сервиса.

### 8.2 Главная / Dashboard

- **Маршрут / файл:** `/` (в `(tabs)`) · `app/(tabs)/index.tsx`
- **Цель:** точка входа клиента: приветствие, быстрые действия, рекомендации.
- **Раскладка:** `Page` (скролл, центрирование). Без горизонтальных каруселей.
- **Элементы (сверху вниз):**
  1. `PageHeader` — приветствие `home.greeting {name}` + слоган, справа аватар-инициал.
  2. Hero-градиент (`primary→secondary`): badge «★ Premium», `home.promoTitle`,
     `home.promoSubtitle`, эмодзи 🦆.
  3. Секция «Быстрые действия» (`home.quickActions`) — 3 карточки в ряд:
     `bookRepair → /services?type=repair`, `bookWash → /services?type=wash`,
     `rentCar → /rentals`.
  4. (Если есть предстоящие записи) секция `bookings.upcoming` — карточка
     ближайшей записи → `/bookings`.
  5. «Популярные услуги» (`home.featuredServices`) — `Grid` из 3 `ServiceCard`
     (desktop 3 кол. / mobile 1) → `/booking/[id]`.
  6. «Доступные авто» (`home.featuredCars`) — `Grid` из 3 `CarCard` → `/rental/[id]`.
- **Источник данных:** `mockServices`, `mockRentalCars`, `useBookingStore`.
- **i18n:** `home.*`, `bookings.upcoming`.
- **Критерии приёмки:** число колонок зависит от ширины; «Смотреть все» ведёт
  на нужный таб; ближайшая запись показывается только при наличии.

### 8.3 Услуги (каталог)

- **Маршрут / файл:** `/services` · `app/(tabs)/services.tsx`
- **Цель:** просмотр и фильтрация услуг ремонта и мойки.
- **Раскладка:** `Page` + `PageHeader` + ряд чипов-фильтров + `Grid` карточек.
- **Элементы:**
  - фильтры-pill: `all` / `repair` / `wash` (активный — зелёный);
  - `Grid` из `ServiceCard` (desktop 3 / mobile 1);
  - принимает query-параметр `type` (из быстрых действий) как начальный фильтр.
- **Состояния:** `filter: 'all'|'repair'|'wash'` (default из `params.type`).
- **Взаимодействия:** тап по карточке → `/booking/[serviceId]`.
- **i18n:** `services.title/all/repair/wash`, `common.all`.
- **Критерии приёмки:** фильтр корректно сужает список; deep-link
  `/services?type=wash` открывает с активным фильтром «мойка».

### 8.4 Аренда (каталог авто)

- **Маршрут / файл:** `/rentals` · `app/(tabs)/rentals.tsx`
- **Цель:** каталог автомобилей для аренды.
- **Раскладка:** `Page` + `PageHeader` (подзаголовок «N available») + `Grid`.
- **Элементы:** `CarCard` (desktop 3 / mobile 1); недоступные авто помечены
  badge. Тап → `/rental/[carId]`.
- **i18n:** `rentals.title`, `common.*`.
- **Критерии приёмки:** отображаются все авто, доступность видна, переход в карточку работает.

### 8.5 Мои записи

- **Маршрут / файл:** `/bookings` · `app/(tabs)/bookings.tsx`
- **Цель:** история и предстоящие записи клиента.
- **Раскладка:** `Page` + `PageHeader` + две вкладки-pill (`upcoming`/`past`) + `Grid`.
- **Логика разбиения:** запись «предстоящая», если `scheduledAt ≥ now` и статус
  не `completed/cancelled`; иначе «прошедшая».
- **Элементы:** `BookingCard` (desktop 2 кол. / mobile 1); пустое состояние
  (эмодзи 📭 + `bookings.empty`).
- **Состояния:** `tab: 'upcoming'|'past'`.
- **Взаимодействия:** тап по карточке → `/booking/[serviceId]`.
- **i18n:** `bookings.*` (включая `bookings.status.*`).
- **Критерии приёмки:** корректная сортировка по вкладкам; пустое состояние
  при отсутствии записей.

### 8.6 Профиль

- **Маршрут / файл:** `/profile` · `app/(tabs)/profile.tsx`
- **Цель:** данные пользователя, гараж, настройки, выход.
- **Раскладка:** `Page` + `PageHeader`. Desktop — 2 колонки; mobile — стек.
  - **Левая колонка:** карточка профиля (аватар-инициал, имя, email);
    карточка «Мой гараж» — список `mockVehicles` + кнопка «＋».
  - **Правая колонка:** язык (`LanguageSwitcher`); переключатель уведомлений
    (`Switch`); меню (Админ-панель → `/admin`, Поддержка → `mailto`, О приложении);
    кнопка «Выйти» (`variant="outline"`); версия.
- **Взаимодействия:** «Выйти» → `signOut()` + `setProfile(null)` → AuthGate на Welcome.
- **i18n:** `profile.*`, `auth.signOut`.
- **Критерии приёмки:** на десктопе две колонки; выход возвращает на Welcome;
  смена языка применяется сразу.

### 8.7 Бронирование услуги

- **Маршрут / файл:** `/booking/[serviceId]` · `app/booking/[serviceId].tsx`
- **Цель:** оформить запись на услугу.
- **Раскладка:** `FlowHeader` (назад + название услуги) + скролл (`maxWidth 720`)
  + прилипающий нижний бар с ценой и кнопкой.
- **Элементы:**
  1. фото услуги, badge типа, рейтинг (`RatingStars`), название, описание;
  2. карточка с длительностью и ценой «от»;
  3. **выбор авто** — список `mockVehicles`, выделение активного;
  4. **выбор даты** — горизонтальные чипы на 7 дней;
  5. **выбор времени** — сетка слотов (`09:00…17:00`);
  6. поле комментария (`Input`, multiline);
  7. нижний бар: цена + кнопка `services.bookNow` (`variant="gradient"`).
- **Состояния:** `vehicle, date, time, notes`.
- **Взаимодействия:** кнопка → `setBookingDraft({...})` →
  `push('/checkout/[type]', { type:'booking', amount, when, title })`.
- **Ошибки:** если услуга не найдена — `FlowHeader` с `common.error`.
- **i18n:** `services.*`, `common.*`.
- **Критерии приёмки:** нельзя продолжить без выбранных авто/даты/времени
  (есть значения по умолчанию); черновик попадает в `bookingStore`.

### 8.8 Бронирование аренды

- **Маршрут / файл:** `/rental/[carId]` · `app/rental/[carId].tsx`
- **Цель:** оформить аренду авто на период.
- **Раскладка:** `FlowHeader` + скролл (`maxWidth 720`) + нижний бар.
- **Элементы:**
  1. фото авто, название, год/коробка/топливо, рейтинг;
  2. карточка характеристик (места, коробка, топливо, год);
  3. **выбор периода** — два горизонтальных пикера дат (pickup / drop-off),
     drop-off не раньше pickup;
  4. сводка: число дней, цена/сутки, итого, badge с депозитом (`rentals.depositInfo`);
  5. нижний бар: итог + кнопка `rentals.rentNow` (`gradient`).
- **Расчёт:** `days = max(1, round((end-start)/день))`, `total = days*pricePerDay`.
- **Взаимодействия:** кнопка → `setRentalDraft({...})` →
  `push('/checkout/[type]', { type:'rental', amount, deposit, title, days })`.
- **i18n:** `rentals.*`, `common.*`.
- **Критерии приёмки:** корректный расчёт дней и суммы; депозит показан явно.

### 8.9 Оплата (Checkout)

- **Маршрут / файл:** `/checkout/[type]` · `app/checkout/[type].tsx`
  (`type` = `booking` | `rental`)
- **Цель:** оплата услуги/аренды и фиксация заказа.
- **Раскладка:** `FlowHeader` + скролл (`maxWidth 640`) + нижний бар.
- **Элементы:**
  1. карточка-сводка заказа (для аренды: дни/депозит/итого; для услуги:
     авто/дата-время/итого);
  2. секция «Способ оплаты» — `card` (•••• 4242) / `applePay` (🍏) / `googlePay` (G),
     выбор радио-кнопкой;
  3. нижний бар: итог + кнопка `checkout.pay {amount}` (`gradient`, спиннер при оплате).
- **Экран успеха (`done=true`):** полноэкранный градиент, ✅, `checkout.success`,
  кнопки «Открыть запись» → `/bookings`, «Закрыть» → `/`.
- **Логика:** `handlePay()` → `presentPaymentSheet({amount,currency,description})`.
  При `succeeded` создаёт `Booking`/`Rental` (статус `confirmed`,
  `paymentId`), кладёт в стор, очищает черновик; для услуги планирует
  `scheduleBookingReminder()`. Затем `done=true`.
- **Состояния:** `method`, `paying`, `done`.
- **i18n:** `checkout.*`, `services.total`, `rentals.*`.
- **Критерии приёмки:** успешная (mock) оплата создаёт запись, видимую в
  «Мои записи»; экран успеха показывает корректные действия.

### 8.10 Админ-дашборд

- **Маршрут / файл:** `/admin` · `app/admin/index.tsx` (layout `app/admin/_layout.tsx`)
- **Цель:** операционный обзор для менеджера AutoDuck.
- **Раскладка:** градиентный hero (`secondary→primary`) + сетка KPI + списки.
- **Элементы:**
  - 4 KPI-карточки: записи сегодня, активные аренды, выручка, новые отзывы
    (значения считаются из `useBookingStore` + `mockReviews`);
  - список последних записей (`BookingCard`);
  - карточка автопарка (`mockRentalCars`) с индикатором доступности.
- **i18n:** `admin.*`.
- **Критерии приёмки:** KPI отражают данные стора; доступ из Профиля.

---

## 9. Переиспользуемые компоненты

| Компонент | Файл | Назначение / API |
|-----------|------|------------------|
| `AppShell` | `components/AppShell.tsx` | оболочка: Sidebar (desktop) / BottomTabs (mobile); вход — `children` |
| `Page` | `components/layout/Page.tsx` | скролл-контейнер, центрирование, `maxWidth` (default 1080); props `scroll, maxWidth, pad` |
| `PageHeader` | `components/layout/PageHeader.tsx` | заголовок страницы; props `title, subtitle?, right?` |
| `FlowHeader` | `components/layout/FlowHeader.tsx` | шапка потока с «назад»; props `title, right?` |
| `Grid` | `components/layout/Grid.tsx` | адаптивная сетка; props `data, columns, keyExtractor, renderItem, gap` |
| `SectionHeader` | `components/SectionHeader.tsx` | заголовок секции + «смотреть все»; props `title, actionLabel?, onAction?` |
| `ServiceCard` | `components/ServiceCard.tsx` | карточка услуги; props `service, onPress?, horizontal?` |
| `CarCard` | `components/CarCard.tsx` | карточка авто; props `car, onPress?, horizontal?` |
| `BookingCard` | `components/BookingCard.tsx` | карточка записи со статусом; props `booking, onPress?` |
| `RatingStars` | `components/RatingStars.tsx` | звёзды; props `value, outOf?, size?, onChange?, showValue?` |
| `LanguageSwitcher` | `components/LanguageSwitcher.tsx` | переключатель en/ru/pt-BR |
| `Button` | `components/ui/Button.tsx` | props `title, onPress?, variant('primary'|'secondary'|'outline'|'ghost'|'gradient'|'accent'), size('sm'|'md'|'lg'), loading?, disabled?, icon?, fullWidth?, textColor?` |
| `Card` | `components/ui/Card.tsx` | props `onPress?, padded?, variant('default'|'elevated'|'flat')` |
| `Input` | `components/ui/Input.tsx` | props `label?, error?` + `TextInputProps` |
| `Badge` | `components/ui/Badge.tsx` | props `label, tone('success'|'warning'|'info'|'danger'|'neutral'|'brand')` |

---

## 10. Состояние приложения (stores)

### 10.1 `store/auth.ts` (Zustand)

```ts
{ profile: Profile | null,
  hydrated: boolean,
  setProfile(p), setHydrated(v) }
```
Используется в AuthGate для редиректов и во всех экранах для данных юзера.

### 10.2 `store/booking.ts` (Zustand)

```ts
{ bookings: Booking[],          // init: mockBookings
  rentals: Rental[],            // init: mockRentals
  bookingDraft: { service?, vehicle?, date?, time?, notes? },
  rentalDraft:  { car?, startDate?, endDate? },
  setBookingDraft(d), clearBookingDraft(),
  setRentalDraft(d), clearRentalDraft(),
  addBooking(b), addRental(r), cancelBooking(id) }
```
Черновики наполняются на экранах бронирования и читаются на Checkout.

---

## 11. Сервисный слой (lib)

| Файл | Экспортирует | Поведение в mock-режиме |
|------|--------------|--------------------------|
| `lib/supabase.ts` | `getSupabase()`, `isSupabaseEnabled()` | возвращает `null` (клиент не создаётся) |
| `lib/auth.ts` | `signInWithProvider`, `signOut`, `fetchProfile` | возвращает `mockProfile`/`mockAdminProfile` с задержкой |
| `lib/stripe.ts` | `presentPaymentSheet`, `formatAmount` | имитирует успешную оплату (`pi_mock_*`) |
| `lib/notifications.ts` | `ensureNotificationPermissions`, `scheduleBookingReminder` | на web — no-op |
| `lib/mock-data.ts` | демоданные | источник всех каталогов/записей |
| `lib/company-data.ts` | `companyInfo: CompanyInfo` | контент публичных страниц (контакты, команда, галерея, статистика) |
| `scripts/check-supabase.mjs` | CLI-проверка готовности БД | запускается локально: `npm run check:supabase -- <URL> <ANON_KEY>`; проверяет доступность таблиц каталога, что приватные таблицы защищены RLS, и включены ли провайдеры OAuth. Не требует зависимостей (Node 18+). |

**Переключение mock → live:** `Config.useMock` становится `false`, когда задан
`EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_USE_MOCK=false`. Тогда `lib/*`
обращаются к Supabase/Stripe.

---

## 12. Платежи (Stripe)

### 12.1 Контракт `presentPaymentSheet`

```ts
type PaymentRequest = { amount, currency, description, capture?: 'immediate'|'manual' };
type PaymentSheetResult =
  | { status: 'succeeded', paymentIntentId }
  | { status: 'failed', reason }
  | { status: 'cancelled' };
```

### 12.2 Сценарии

- **Услуга (ремонт/мойка):** разовое списание `amount`, `capture: 'immediate'`.
- **Аренда:** списание стоимости аренды + **предавторизация депозита**
  (`capture: 'manual'`, освобождается при возврате авто).
- **Кошельки:** Apple Pay / Google Pay как методы в Payment Sheet.

### 12.3 Реальная интеграция (вне MVP)

1. ENV `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Бэкенд `create-payment-intent` (Supabase Edge Function) возвращает
   `client_secret`.
3. В `lib/stripe.ts` использовать `initPaymentSheet` + `presentPaymentSheet`
   из SDK.
4. `merchantIdentifier` (Apple) и Google Pay настроить в `app.json`
   (плагин `@stripe/stripe-react-native`).
5. Webhook Stripe пишет в таблицу `payments` и обновляет статусы заказов.

---

## 13. Локализация

- Языки: `en` (fallback), `ru`, `pt-BR`. Файлы `i18n/{lang}.json`.
- Инициализация — `i18n/index.ts`: язык из `expo-localization`, иначе fallback.
- Доступ — `useTranslation()` → `t('namespace.key')`.
- Неймспейсы ключей: `brand, common, auth, guestMenu, contact, fleet, about,
  tabs, home, services, rentals, checkout, bookings, profile, review, admin`.
- **Правило:** любой видимый текст — только через `t()`. Новые строки
  добавлять во все три файла одновременно (одинаковые ключи).

---

## 14. Конфигурация и окружение

`constants/config.ts` (`Config`):

| Поле | Источник ENV | Назначение |
|------|--------------|-----------|
| `supabaseUrl` | `EXPO_PUBLIC_SUPABASE_URL` | URL проекта |
| `supabaseAnonKey` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon-ключ |
| `stripePublishableKey` | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | публичный ключ Stripe |
| `useMock` | `EXPO_PUBLIC_USE_MOCK` (default `true`) | mock-режим |
| `currency` | — | `BRL` |
| `supportEmail` | — | адрес поддержки |

Шаблон — `.env.example`. **Секреты не коммитить** (`.env` в `.gitignore`).

Expo-конфиг — `app.json`: `scheme: carservice1`, bundle id
`com.autoduck.carservice1`, плагины `expo-router`, `expo-notifications`,
сплеш в цветах бренда (`#00A859`). **Плагин `@stripe/stripe-react-native` в
MVP не подключён** — он требует development build (`expo prebuild`) и
ломает запуск через Expo Go. Подключать при интеграции реальных платежей.

**Совместимость с Expo Go.** В MVP запуск на телефоне через Expo Go
(Android/iOS) поддерживается без условий: нет нативных модулей, требующих
prebuild; нет ссылок на отсутствующие asset-файлы в `app.json`. Это
проверяется тем, что `Android Bundled` и `iOS Bundled` собираются без
ошибок резолвинга при `npx expo start`.

---

## 15. Нефункциональные требования

- **Типобезопасность:** `npm run typecheck` (tsc strict) — без ошибок.
- **Сборка web:** `npx expo start --web` собирается без ошибок резолвинга
  (см. `metro.config.js`).
- **Производительность:** списки — через `Grid`/`FlatList`; изображения —
  `expo-image`/кеш.
- **Доступность:** контраст текста на цветном фоне; зоны нажатия ≥ 44px
  (`hitSlop` где нужно).
- **Офлайн-устойчивость dev:** поддержка `EXPO_OFFLINE=1`.
- **Безопасность:** RLS на всех таблицах; ключи только в ENV; оплата — на
  серверной стороне (intent создаётся бэкендом).
- **Кроссплатформенность:** один код для Web/iOS/Android; платформенные ветки
  через `Platform.select`/`useResponsive`. На телефоне (Android/iOS) MVP
  должен запускаться через **Expo Go** без `prebuild` — никаких нативных
  модулей (Stripe-плагин подключается только при реальной интеграции
  платежей).

---

## 16. Чек-лист для AI-агента

Пошаговый план воспроизведения проекта с нуля. Выполнять по порядку.

1. **Инициализация.** `package.json` (Expo 51, expo-router, react 18.2,
   react-dom 18.2, supabase-js, stripe-react-native, zustand, react-query,
   i18next, expo-localization/notifications/linear-gradient), `app.json`,
   `tsconfig.json` (alias `@/*`), `babel.config.js` (+reanimated plugin),
   `metro.config.js` (shim `@opentelemetry/api` → empty), `.gitignore`,
   `.env.example`.
2. **Дизайн-токены.** `constants/theme.ts` (§4), `constants/config.ts` (§14),
   `constants/nav.ts` (§5).
3. **Типы и данные.** `types/index.ts` (§7.1), `lib/mock-data.ts` (демо).
4. **Сервисы.** `lib/supabase.ts`, `lib/auth.ts`, `lib/stripe.ts`,
   `lib/notifications.ts` (§11) с поддержкой mock-режима.
5. **Состояние.** `store/auth.ts`, `store/booking.ts` (§10).
6. **i18n.** `i18n/index.ts` + `en/ru/pt-BR.json` со всеми неймспейсами (§13).
7. **UI-компоненты.** `components/ui/*` (Button, Card, Input, Badge),
   затем `RatingStars`, `SectionHeader`, `LanguageSwitcher` (§9).
8. **Layout-примитивы.** `hooks/useResponsive.ts`, `components/layout/*`
   (Page, PageHeader, FlowHeader, Grid), `components/AppShell.tsx` (§5, §9).
9. **Доменные карточки.** `ServiceCard`, `CarCard`, `BookingCard`.
10. **Роутинг.** `app/_layout.tsx` (Stack + AuthGate), `app/index.tsx`
    (редирект), `app/(auth)/*`, `app/(tabs)/_layout.tsx` (AppShell+Slot) (§6).
11. **Экраны клиента.** `(auth)/welcome` (с гостевыми ссылками),
    `(tabs)/index|services|rentals|bookings|profile` по §8.1–8.6.
11a. **Публичные страницы.** `lib/company-data.ts`, группа `app/(public)/`
    (`contact`, `fleet`, `about`) по §8.1.1–8.1.3; разрешить `(public)` в
    AuthGate.
12. **Потоки.** `booking/[serviceId]`, `rental/[carId]`, `checkout/[type]`
    по §8.7–8.9.
13. **Админка.** `admin/_layout.tsx`, `admin/index.tsx` по §8.10.
14. **Бэкенд.** `supabase/schema.sql` (таблицы, enum, RLS, `is_admin`,
    триггер), `supabase/seed.sql` (§7.2).
15. **Проверки.** `npm run typecheck` без ошибок; `npx expo start --web`
    собирается; пройти сценарии A/B/C (§2.2).
16. **Документация.** Обновить `README.md` и этот файл при изменениях.

### Критерии готовности MVP (Definition of Done)

- [ ] Все маршруты §6 существуют и открываются.
- [ ] Сценарии A, B, C проходятся полностью на mock-данных.
- [ ] Боковое меню на десктопе, нижние вкладки на мобильном.
- [ ] Все три языка переключаются, тексты не «ломаются».
- [ ] `tsc` без ошибок, web-сборка успешна.
- [ ] Цвета строго из `Palette`; видимый текст — только через `t()`.
- [ ] SQL-схема применяется и содержит RLS на всех таблицах.
