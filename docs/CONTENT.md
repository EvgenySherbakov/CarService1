# Управление контентом — CarService1 / AutoDuck

Это практическое руководство: где лежит контент, как менять цены, фото,
описания и состав автопарка, как добавлять новые услуги и авто. Написано
для двух режимов работы приложения: **mock** (без бэкенда, контент в коде)
и **live** (с подключённым Supabase, контент в БД).

## Содержание

- [Какой режим у меня сейчас?](#какой-режим-у-меня-сейчас)
- [Карта контента](#карта-контента)
- [Mock-режим: редактирование кода](#mock-режим-редактирование-кода)
  - [Поменять цену услуги](#поменять-цену-услуги-mock)
  - [Поменять название/описание автомобиля](#поменять-названиеописание-автомобиля-mock)
  - [Заменить фотографию](#заменить-фотографию-mock)
  - [Добавить новую услугу](#добавить-новую-услугу-mock)
  - [Добавить новый автомобиль](#добавить-новый-автомобиль-mock)
  - [Поменять контакты / адрес / WhatsApp](#поменять-контакты--адрес--whatsapp-mock)
  - [Добавить / переименовать сотрудника](#добавить--переименовать-сотрудника-mock)
- [Live-режим: Supabase Dashboard](#live-режим-supabase-dashboard)
  - [Настройка Storage для фото](#настройка-storage-для-фото)
  - [Поменять цену услуги](#поменять-цену-услуги-live)
  - [Поменять название автомобиля](#поменять-название-автомобиля-live)
  - [Заменить фото через Storage](#заменить-фото-через-storage)
  - [Добавить новую услугу](#добавить-новую-услугу-live)
  - [Добавить новый автомобиль](#добавить-новый-автомобиль-live)
  - [Скрыть услугу или авто временно](#скрыть-услугу-или-авто-временно)
- [Контактные данные и «О компании»](#контактные-данные-и-о-компании)
- [Чек-лист перед коммитом / публикацией](#чек-лист-перед-коммитом--публикацией)
- [FAQ и частые ошибки](#faq-и-частые-ошибки)

---

## Какой режим у меня сейчас?

Откройте файл `.env` в корне проекта (если его нет — он не создавался):

| Условие | Режим |
|---------|-------|
| Файла `.env` нет, или `EXPO_PUBLIC_USE_MOCK=true` | **Mock** — контент в `lib/mock-data.ts` и `lib/company-data.ts` |
| Файл `.env` есть и `EXPO_PUBLIC_USE_MOCK=false`, ключи Supabase указаны | **Live** — каталог (услуги/авто) из Supabase; контакты/команда по-прежнему из кода |

> Контакты, команда и галерея пока всегда из `lib/company-data.ts` — отдельной
> таблицы для них в схеме нет. См. секцию ниже.

---

## Карта контента

| Контент | Mock-источник | Live-источник | Пример полей |
|---------|---------------|---------------|--------------|
| Услуги (ремонт/мойка) | `lib/mock-data.ts` → `mockServices` | таблица `services` | `name`, `description`, `price_from`, `duration_minutes`, `image_url` |
| Категории услуг | `lib/mock-data.ts` → `serviceCategories` | таблица `service_categories` | `slug`, `name`, `type`, `icon` |
| Автопарк | `lib/mock-data.ts` → `mockRentalCars` | таблица `rental_cars` | `make`, `model`, `year`, `price_per_day`, `deposit_amount`, `image_url`, `description`, `available` |
| Автомобили пользователя (демо) | `lib/mock-data.ts` → `mockVehicles` | таблица `vehicles` (привязка к юзеру) | — пользовательский контент |
| Демо-записи и аренды | `lib/mock-data.ts` → `mockBookings`, `mockRentals` | таблицы `bookings`, `rentals` | — пользовательский контент |
| Отзывы | `lib/mock-data.ts` → `mockReviews` | таблица `reviews` | `rating`, `comment`, `client_name` |
| Контакты, владельцы, галерея | `lib/company-data.ts` → `companyInfo` | **только код** (пока) | `phones`, `whatsapp`, `email`, `address`, `team`, `gallery` |

---

## Mock-режим: редактирование кода

Все примеры — правка одного TypeScript-файла + коммит + push. Приложение
подхватит изменения после перезапуска `npx expo start`.

> Перед коммитом: `npm run typecheck` должен быть зелёный.

### Поменять цену услуги (mock)

`lib/mock-data.ts`, найдите нужный объект в `mockServices`:

```ts
{
  id: 's2',
  categoryId: 'c2',
  type: 'repair',
  name: 'Brake pads replacement',
  description: 'Front or rear pads + brake fluid check.',
  priceFrom: 320,        // ← меняете число
  durationMinutes: 90,
  imageUrl: '…',
  rating: 4.9,
  reviewsCount: 88,
},
```

Цена указана **в реалах (BRL)**. Формат отображения автоматически — `R$ 320`.

### Поменять название/описание автомобиля (mock)

`lib/mock-data.ts`, найдите объект в `mockRentalCars`:

```ts
{
  id: 'r2',
  make: 'Volkswagen',        // ← марка
  model: 'T-Cross',          // ← модель
  year: 2023,
  // …
  description: 'Stylish compact SUV with a roomy trunk…',  // ← описание
},
```

### Заменить фотографию (mock)

Два варианта:

**A. URL внешнего изображения** (быстро, без файлов в репо):
1. Найдите подходящее фото на Unsplash / Pexels или загрузите его в любое
   хранилище с публичной ссылкой (Imgur, GitHub Gist + raw, и т.п.).
2. Вставьте URL в поле `imageUrl`:
   ```ts
   imageUrl: 'https://images.unsplash.com/photo-XXXX?w=1200',
   ```
3. Желательно с параметром `?w=1200` — приложение получит уже сжатое
   изображение.

**B. Локальный файл в репозитории** (рекомендую для production-mock):
1. Положите файл в `assets/cars/onix.jpg`.
2. В `lib/mock-data.ts` импортируйте:
   ```ts
   const onixImg = require('@/assets/cars/onix.jpg');
   // …
   imageUrl: onixImg,
   ```
3. Уточните тип `imageUrl` в `types/index.ts` — `string | number` (RN
   возвращает числовой id для статических ассетов).

### Добавить новую услугу (mock)

В `lib/mock-data.ts` добавьте элемент в массив `mockServices`:

```ts
{
  id: 's7',                   // уникальный id, строкой
  categoryId: 'c1',           // должен существовать в serviceCategories
  type: 'repair',             // 'repair' или 'wash'
  name: 'Oil change',
  description: 'Engine oil + filter replacement.',
  priceFrom: 120,
  durationMinutes: 45,
  imageUrl: 'https://…',
  rating: 4.8,                // 0..5
  reviewsCount: 0,
},
```

Если категории нет — добавьте её в `serviceCategories`:

```ts
{ id: 'c7', type: 'repair', slug: 'oil', nameKey: 'Oil', icon: 'oil' },
```

### Добавить новый автомобиль (mock)

В `mockRentalCars`:

```ts
{
  id: 'r6',
  make: 'Honda',
  model: 'HR-V',
  year: 2024,
  transmission: 'automatic',     // 'automatic' | 'manual'
  fuel: 'petrol',                 // 'petrol' | 'diesel' | 'electric' | 'hybrid'
  seats: 5,
  pricePerDay: 360,
  depositAmount: 1400,
  imageUrl: 'https://…',
  available: true,
  rating: 4.7,
  reviewsCount: 0,
  description: 'Comfortable family SUV with a panoramic roof.',
},
```

### Поменять контакты / адрес / WhatsApp (mock)

`lib/company-data.ts` → объект `companyInfo`:

```ts
{
  name: 'AutoDuck',
  legalName: 'AutoDuck Serviços Automotivos LTDA',
  foundedYear: 2014,
  phones: ['+55 11 4002-8922', '+55 11 99999-0000'],  // ← массив телефонов
  whatsapp: '5511999990000',     // ← без + и пробелов, чтобы wa.me работал
  email: 'contato@autoduck.com.br',
  address: 'Av. Paulista, 1000 — Bela Vista, São Paulo - SP',
  mapQuery: 'Av. Paulista 1000, São Paulo',  // что искать в Google Maps
  mapImageUrl: 'https://…',                  // картинка карты на экране Контакты
  heroImageUrl: 'https://…',                 // hero-фото на экране О компании
  // …
}
```

**Важно для WhatsApp:** `whatsapp` хранится в формате `<страна><номер>` без
плюса и пробелов. Например `5511999990000`. Приложение подставит это в
`https://wa.me/<номер>`.

### Добавить / переименовать сотрудника (mock)

В `companyInfo.team` массив:

```ts
team: [
  {
    id: 't1',
    name: 'Ricardo Almeida',
    roleKey: 'about.roleFounder',     // ключ из i18n
    photoUrl: 'https://i.pravatar.cc/300?img=11',
  },
  // …
]
```

Если нужна **новая роль** (которой нет в переводах):
1. Добавьте ключ в `i18n/en.json`, `i18n/ru.json`, `i18n/pt-BR.json`:
   ```json
   "about": {
     "roleAccountant": "Accountant"
   }
   ```
2. Используйте этот ключ в `roleKey: 'about.roleAccountant'`.

> Без локализации экраны выглядят кривовато — приложение покажет ключ как
> текст. Всегда добавляйте перевод во все три файла.

---

## Live-режим: Supabase Dashboard

Самый удобный способ управления каталогом. **Без коммитов, без пересборки.**
Изменения видны в приложении после следующего открытия (или pull-to-refresh).

### Настройка Storage для фото

Один раз настраиваем хранилище:

1. Откройте проект на [supabase.com](https://supabase.com).
2. Слева **Storage → New bucket**.
3. Имя: `public-images`. Тип: **Public bucket** (важно — чтобы фото открывались без авторизации).
4. **Save**.
5. Внутри bucket — **Create folder** для удобства: `cars/`, `services/`, `team/`, `gallery/`.

Готово. Туда теперь можно перетаскивать фото мышью и получать публичный URL.

### Поменять цену услуги (live)

1. Supabase → **Table Editor** → таблица `services`.
2. Найдите строку (можно через фильтр сверху).
3. Двойной клик по `price_from` → новое число → **Enter** (или Save).

> Поле `price_from` — `numeric(10,2)`, поэтому десятичные допустимы: `120.50`.

### Поменять название автомобиля (live)

1. **Table Editor → rental_cars**.
2. Двойной клик по полю `make` или `model`.
3. Введите новое значение → **Enter**.

### Заменить фото через Storage

1. **Storage → public-images → cars/** → перетащите новый `.jpg` мышью.
2. Кликните по загруженному файлу → справа панель → **Copy URL**.
3. **Table Editor → rental_cars** → найдите авто → вставьте URL в `image_url`.

**Лайфхак:** называйте файлы понятно (`tesla-model-3.jpg`), тогда легче найти.

### Добавить новую услугу (live)

1. **Table Editor → services → Insert → Insert row**.
2. Заполните:
   - `category_id` — выберите из списка (FK к `service_categories`)
   - `type` — `repair` или `wash`
   - `name`, `description`
   - `price_from`, `duration_minutes`
   - `image_url`
   - `active` — оставьте `true`
3. **Save**.

> `id`, `created_at` заполнятся автоматически.

Если нужна **новая категория** — сначала в `service_categories`:
- `type`: `repair` или `wash`
- `slug`: короткий уникальный идентификатор (например, `oil`)
- `name`: отображаемое имя
- `icon`: имя иконки (необязательно)

### Добавить новый автомобиль (live)

1. **Table Editor → rental_cars → Insert row**.
2. Заполните:
   - `make`, `model`, `year`
   - `transmission`: `automatic` или `manual`
   - `fuel`: `petrol` / `diesel` / `electric` / `hybrid`
   - `seats`: целое число
   - `price_per_day`, `deposit_amount`
   - `image_url` — публичная ссылка из Storage
   - `available` — `true`
3. Save.

### Скрыть услугу или авто временно

- Услугу: поле `active = false` → не показывается в каталоге (политика RLS
  публичного чтения смотрит именно на `active = true`).
- Авто: `available = false` → отображается в каталоге с пометкой
  «Недоступно», бронирование заблокировано.

---

## Контактные данные и «О компании»

⚠ **Эти данные пока в коде даже в live-режиме.** Отдельной таблицы для
`companyInfo` в схеме сейчас нет.

Чтобы поменять — правьте `lib/company-data.ts` и коммитьте (см. mock-секцию).

Если хотите вынести в БД — нужно добавить таблицу `company_info` (одна
строка) и таблицы `team_members`, `gallery_images`. Скажите, сделаем.

---

## Чек-лист перед коммитом / публикацией

**Mock-режим:**
- [ ] `npm run typecheck` зелёный
- [ ] Все ссылки на фото открываются в браузере
- [ ] Цены — числа, без знака валюты (валюта — `BRL`)
- [ ] WhatsApp в формате `<страна><номер>`, без `+` и пробелов
- [ ] Новые роли сотрудников / новые i18n-ключи добавлены во все три языка
- [ ] Коммит + пуш

**Live-режим (Supabase):**
- [ ] Фото в Storage загружены, URL открывается в инкогнито-вкладке
- [ ] Поле `active` (для услуг) / `available` (для авто) выставлено осознанно
- [ ] Цены — без копеек или с двумя знаками
- [ ] Если меняли что-то критичное (удаление авто) — проверили, нет ли
      активных аренд на эту машину

---

## FAQ и частые ошибки

**Изменил в Supabase — в приложении не видно.**
Закройте и заново откройте экран (или потяните вниз для refresh). Кэш React
Query держит данные несколько минут. Полный сброс — закрыть и открыть
Expo Go.

**Картинка не показывается, серый квадрат.**
- В live-режиме: bucket Storage должен быть **public**. Проверьте, что URL
  открывается в инкогнито-вкладке.
- В mock-режиме: URL должен быть **https** (не http), иначе iOS заблокирует.

**WhatsApp кнопка ведёт «в никуда».**
Поле `whatsapp` должно быть в формате `5511999990000` (страна + код + номер),
без `+`, пробелов и дефисов.

**Хочу удалить услугу совсем.**
В live: `Table Editor → услуга → Delete row`. Но если на эту услугу есть
ссылки в `bookings` — Postgres не даст удалить (ON DELETE RESTRICT). Лучше
выставить `active = false`.

**После изменения цены старые записи показывают новую цену?**
Нет — в `bookings.total_amount` цена сохранена на момент бронирования.
Изменение `price_from` действует только на новые заказы.

**Кто может править данные в Supabase?**
RLS-политики разрешают запись в `services` и `rental_cars` только
пользователям с ролью `admin` (поле `profiles.role`). Через Dashboard вы
пишете под service_role, RLS не применяется — вы всегда сможете править.
В приложении же без `role='admin'` редактирования не будет.

**Можно ли редактировать прямо в приложении (без Supabase Dashboard)?**
Сейчас экран `/admin` показывает только дашборд (KPI + просмотр). CRUD-формы
не реализованы. Если нужны — отдельная задача, скажите.

---

## Шпаргалка: команды

```bash
# Проверить типы перед коммитом
npm run typecheck

# Проверить, что схема в Supabase в порядке
npm run check:supabase -- https://YOUR.supabase.co YOUR_ANON_KEY

# Запустить приложение локально, чтобы увидеть результат
npx expo start --clear
```
