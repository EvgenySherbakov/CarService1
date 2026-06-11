# Деплой — CarService1 / AutoDuck

Пошаговый план вывода приложения в прод. У проекта **три независимых
артефакта**, каждый хостится по-своему:

| Артефакт | Хостинг | Docker |
|----------|---------|--------|
| Web | Vercel (статика на CDN) | не нужен |
| iOS / Android | EAS Build → App Store / Google Play | не нужен |
| Бэкенд (БД, Auth, Storage) | Supabase (managed) | не нужен |

Делать их можно в любом порядке, но логичнее так: **Supabase → Web → Mobile**
(сначала бэкенд, чтобы web и mobile уже стартовали на живых данных).

- [Часть 0. Переменные окружения](#часть-0--переменные-окружения)
- [Часть 1. Supabase (бэкенд)](#часть-1--supabase-бэкенд)
- [Часть 2. Web на Vercel](#часть-2--web-на-vercel)
- [Часть 3. Mobile через EAS Build](#часть-3--mobile-через-eas-build)
- [Часть 4. CI/CD (GitHub Actions)](#часть-4--cicd-github-actions)
- [Чек-лист релиза](#чек-лист-релиза)
- [Частые проблемы](#частые-проблемы)

---

## Часть 0 — Переменные окружения

Все ключи фронтенда начинаются с `EXPO_PUBLIC_` (иначе Expo их не прокинет
в бандл). Полный список — в `.env.example`:

| Переменная | Где взять | Назначение |
|-----------|-----------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | адрес проекта |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | там же → `anon public` | публичный ключ (безопасно класть в клиент) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → Publishable | публичный ключ Stripe (опционально) |
| `EXPO_PUBLIC_USE_MOCK` | вручную | `false` в проде, `true`/пусто для демо без бэкенда |

> ⚠️ **`anon`-ключ — публичный**, он и так уходит на клиент, защита данных —
> на уровне **RLS** в Postgres. А вот `service_role`-ключ **никогда** не
> кладите во фронтенд и в Vercel-переменные с префиксом `EXPO_PUBLIC_`.

Локально эти значения лежат в `.env` (он в `.gitignore`). В Vercel и EAS
их задают отдельно — см. соответствующие части.

---

## Часть 1 — Supabase (бэкенд)

### 1.1 Создать проект

1. Зайдите на [supabase.com](https://supabase.com) → **New project**.
2. Задайте имя, регион (ближе к пользователям — для Бразилии `South America (São Paulo)`), пароль БД.
3. Дождитесь инициализации (~2 мин).

### 1.2 Применить схему и сид

1. Слева **SQL Editor → New query**.
2. Вставьте содержимое [`supabase/schema.sql`](../supabase/schema.sql) → **Run**.
   Создаст таблицы, enum'ы, RLS-политики, функцию `is_admin()` и триггер
   `handle_new_user()`.
3. Новый запрос → вставьте [`supabase/seed.sql`](../supabase/seed.sql) → **Run**.
   Наполнит каталог услуг, категории и автопарк.

### 1.3 Проверить

```bash
npm run check:supabase -- https://ВАШ.supabase.co ВАШ_ANON_KEY
```

Все строки должны стать ✓: публичные таблицы читаются, приватные защищены RLS.

### 1.4 Storage для фото

1. **Storage → New bucket** → имя `public-images`, тип **Public**.
2. Внутри создайте папки `cars/`, `services/`, `team/`, `gallery/`.
3. Подробнее об управлении фото — [`docs/CONTENT.md`](CONTENT.md).

### 1.5 OAuth-провайдеры

**Google** (нужен для входа):
1. [Google Cloud Console](https://console.cloud.google.com) → новый проект →
   **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. В **Authorized redirect URIs** добавьте (Supabase показывает на странице
   провайдера):
   ```
   https://ВАШ.supabase.co/auth/v1/callback
   ```
3. Скопируйте **Client ID** и **Client Secret**.
4. Supabase → **Authentication → Providers → Google → Enable**, вставьте ключи → **Save**.

**Apple** (можно отложить — требует Apple Developer Program $99/год):
- Supabase → Providers → Apple. Нужен Services ID + ключ Sign in with Apple.
- Для Web и Android не обязателен; включайте перед публикацией в App Store.

### 1.6 Redirect URLs для приложения

Supabase → **Authentication → URL Configuration → Redirect URLs**, добавьте:
```
carservice1://auth-callback
https://ВАШ-ВЕБ-ДОМЕН.vercel.app
http://localhost:8081
```

> `carservice1` — это `scheme` из `app.json` (deep link для мобильных).

### 1.7 (Roadmap) Edge Function для Stripe

Для реальной оплаты intent должен создаваться на сервере:

```bash
npm install -g supabase
supabase login
supabase link --project-ref ВАШ-REF
supabase functions deploy create-payment-intent
```

Функция берёт `STRIPE_SECRET_KEY` из секретов Supabase
(`supabase secrets set STRIPE_SECRET_KEY=sk_live_...`), создаёт `PaymentIntent`
и возвращает `client_secret`. Затем в `lib/stripe.ts` заменяете mock на
`initPaymentSheet` + `presentPaymentSheet`. В MVP этот шаг пропускается.

---

## Часть 2 — Web на Vercel

Expo Web — это **статический сайт**, серверной части нет. Docker не нужен.

### 2.1 Проверить сборку локально

```bash
npx expo export --platform web
```

Появится папка `dist/` со статикой. Можно проверить:
```bash
npx serve dist
```

### 2.2 Подключить репозиторий к Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** ваш GitHub-репозиторий.
2. На экране настройки проекта:
   - **Framework Preset:** `Other`
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci --legacy-peer-deps`
     (флаг обязателен — у проекта есть peer-конфликты, которые корректно
     резолвятся; см. историю с Reanimated/worklets)

### 2.3 Переменные окружения в Vercel

**Settings → Environment Variables**, добавьте (для Production и Preview):
```
EXPO_PUBLIC_SUPABASE_URL        = https://ВАШ.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...   (опционально)
EXPO_PUBLIC_USE_MOCK            = false
```

### 2.4 Деплой

Нажмите **Deploy**. Через ~2 мин получите URL `https://carservice1.vercel.app`.

Дальше **каждый `git push`** в подключённую ветку → автодеплой. Pull
request'ы получают **preview-окружение** с отдельным URL.

> Не забудьте добавить итоговый Vercel-домен в Supabase Redirect URLs (§1.6),
> иначе OAuth-вход не вернётся обратно.

### 2.5 SPA-роутинг (важно)

`app.json` уже содержит `web.output: "single"` — Expo генерирует
SPA-страницу. Если используете кастомный хостинг с нестандартным поведением
404, настройте, чтобы любой путь отдавал `index.html`. На Vercel с пресетом
`Other` и `output: single` это работает из коробки.

---

## Часть 3 — Mobile через EAS Build

Нативные бинарники собирает **EAS Build** (managed-сервис Expo). VPS и
Docker не нужны.

### 3.1 Установка и логин

```bash
npm install -g eas-cli
eas login                 # аккаунт expo.dev (бесплатный)
```

### 3.2 Инициализация

```bash
eas build:configure
```

Создаст `eas.json` с профилями `development`, `preview`, `production`.
В `app.json` уже заданы идентификаторы:
- iOS `bundleIdentifier`: `com.autoduck.carservice1`
- Android `package`: `com.autoduck.carservice1`

### 3.3 Переменные окружения для сборки

EAS не читает локальный `.env` автоматически. Задайте через EAS Secrets:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://ВАШ.supabase.co
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJ...
eas env:create --name EXPO_PUBLIC_USE_MOCK --value false
```

(в старых версиях CLI — `eas secret:create`).

### 3.4 Сборка

```bash
# Android — выдаёт .aab для Google Play
eas build --platform android --profile production

# iOS — выдаёт .ipa (нужен Apple Developer Program)
eas build --platform ios --profile production
```

Сборка идёт в облаке Expo (~10–20 мин), по ссылке скачиваете артефакт.
Бесплатный тариф: ограниченное число сборок в месяц — для pet-проекта хватает.

### 3.5 Публикация в сторы

**Android (Google Play):**
1. Зарегистрируйте аккаунт Google Play Console (разовые $25).
2. ```bash
   eas submit --platform android --profile production
   ```
   или вручную загрузите `.aab` в консоли.

**iOS (App Store):**
1. Apple Developer Program ($99/год).
2. ```bash
   eas submit --platform ios --profile production
   ```

### 3.6 Альтернатива без сторов — EAS Update (OTA)

Для JS-only изменений (без новых нативных модулей) можно публиковать
обновления «по воздуху», без пересборки:

```bash
eas update --branch production --message "fix prices"
```

Приложение подтянет новый бандл при следующем запуске.

### 3.7 Stripe-плагин для прода

⚠️ Сейчас `@stripe/stripe-react-native` **намеренно отключён** в `app.json`
(чтобы работал Expo Go). Перед EAS-сборкой с реальной оплатой верните плагин:

```jsonc
// app.json → expo.plugins
[
  "@stripe/stripe-react-native",
  { "merchantIdentifier": "merchant.com.autoduck.carservice1", "enableGooglePay": true }
]
```

После этого Expo Go перестанет открывать dev-сборку — нужен
`development build` (`eas build --profile development`).

---

## Часть 4 — CI/CD (GitHub Actions)

Минимальный пайплайн: на каждый push гонять typecheck + тесты.

Создайте `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main, "claude/**"]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run typecheck
      - run: npm test
```

**Деплой web** при пуше в `main` Vercel делает сам (после подключения
репозитория в §2.2) — отдельный workflow не нужен.

**Деплой mobile** можно автоматизировать через
[`expo-github-action`](https://github.com/expo/expo-github-action), но для
pet-проекта проще запускать `eas build` руками по необходимости.

---

## Чек-лист релиза

**Бэкенд:**
- [ ] `schema.sql` и `seed.sql` применены, `npm run check:supabase` зелёный
- [ ] Storage bucket `public-images` создан (public)
- [ ] Google OAuth включён, redirect URLs добавлены (вкл. vercel-домен)
- [ ] `service_role`-ключ нигде не во фронтенде

**Web:**
- [ ] `npx expo export --platform web` собирается без ошибок
- [ ] ENV в Vercel заданы, `EXPO_PUBLIC_USE_MOCK=false`
- [ ] Vercel-домен прописан в Supabase Redirect URLs
- [ ] Вход через Google работает на проде

**Mobile:**
- [ ] `eas build:configure` выполнен, идентификаторы верны
- [ ] EAS Secrets заданы
- [ ] Stripe-плагин возвращён в `app.json` (если нужна оплата в приложении)
- [ ] Сборка проходит, приложение запускается на устройстве

**Качество:**
- [ ] `npm run typecheck` — без ошибок
- [ ] `npm test` — все зелёные
- [ ] CI workflow добавлен и проходит

---

## Частые проблемы

**На проде белый экран / 404 при обновлении страницы.**
SPA-роутинг: убедитесь, что `app.json` → `web.output: "single"` и хостинг
отдаёт `index.html` на любой путь. На Vercel с пресетом `Other` это
работает из коробки.

**OAuth-вход на проде не возвращается в приложение.**
Домен Vercel не добавлен в Supabase → Authentication → URL Configuration →
Redirect URLs. Добавьте точный URL (с `https://`).

**`npm ci` падает на Vercel/CI с ERESOLVE.**
Добавьте флаг `--legacy-peer-deps` в Install Command (Vercel) и в CI
(`npm ci --legacy-peer-deps`).

**EAS-сборка не видит ENV.**
EAS не читает локальный `.env`. Задайте значения через `eas env:create`
(или `eas secret:create` в старых CLI).

**Expo Go перестал открывать проект после включения Stripe-плагина.**
Это ожидаемо — нативный модуль требует development build. Либо соберите
`eas build --profile development`, либо временно уберите плагин для
теста в Expo Go.

**Данные не подгружаются на проде, хотя Supabase настроен.**
Проверьте, что `EXPO_PUBLIC_USE_MOCK=false` в окружении сборки (Vercel/EAS),
а не только локально. Без этого приложение остаётся на mock-данных.

---

## Ссылки

- [Архитектура (C4)](ARCHITECTURE.md)
- [Полное ТЗ](SPECIFICATION.md)
- [Управление контентом](CONTENT.md)
- [Настройка Supabase](../supabase/README.md)
- Expo EAS: https://docs.expo.dev/eas/
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
