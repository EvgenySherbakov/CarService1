# CarService1 — AutoDuck

Кроссплатформенное приложение (Web / iOS / Android) для услуг автосервиса AutoDuck:
**ремонт**, **мойка** и **аренда автомобилей** с онлайн-оплатой.

> Сделано на **Expo Router** + **React Native** + **Supabase** + **Stripe**, в цветах флага Бразилии.

## ✨ Возможности

- Запись на ремонт и мойку с выбором даты/времени и автомобиля
- Аренда авто с депозитом и расчётом стоимости по дням
- Оплата картой, Apple Pay, Google Pay через Stripe (заглушка в MVP)
- OAuth-вход через Google и Apple (Supabase Auth)
- Мультиязычность: English / Русский / Português (pt-BR)
- Push-уведомления о записях
- Личный кабинет: автомобили, история заказов, способы оплаты
- Отзывы и рейтинги
- Админ-панель: дашборд, записи, автопарк

## 🇧🇷 Дизайн

Цветовая палитра флага Бразилии:
- 🟢 **#009C3B** primary
- 🟡 **#FFDF00** accent
- 🔵 **#002776** secondary

Современный flat-стиль, скруглённые карточки, мягкие градиенты.

## 🛠 Стек

| Слой | Технология |
|------|-----------|
| UI | React Native + Expo SDK 51 + Expo Router v3 |
| State | Zustand + React Query |
| i18n | i18next + expo-localization |
| BE | Supabase (Postgres + Auth + RLS) |
| Pay | Stripe (Payment Sheet, Apple/Google Pay) |
| Lang | TypeScript |

## 🚀 Запуск

```bash
npm install
cp .env.example .env       # необязательно — без него работает mock
npx expo start             # затем нажмите w / i / a
```

Без `.env` приложение работает на mock-данных. Чтобы подключить
реальный бэкенд, заполните `.env` и выполните SQL из `supabase/`.

## 📁 Структура

```
CarService1/
├── app/                  # Expo Router экраны
│   ├── (auth)/welcome    # Welcome + Google/Apple OAuth
│   ├── (tabs)/           # 5 основных табов
│   ├── booking/[id]      # Бронирование услуги
│   ├── rental/[id]       # Бронирование аренды
│   ├── checkout/[type]   # Stripe checkout
│   └── admin/            # Админ-панель
├── components/           # UI + ServiceCard / CarCard / BookingCard
├── constants/            # Theme (бразильские цвета), Config
├── i18n/                 # en / ru / pt-BR
├── lib/                  # supabase / stripe / auth / notifications / mock
├── store/                # Zustand stores
├── supabase/             # schema.sql + seed.sql + README
└── TZ.md                 # Техническое задание
```

## 🗺 Roadmap (после MVP)

- Реальная интеграция Stripe через Edge Function `create-payment-intent`
- Карты — выбор сервисного центра по геолокации (react-native-maps)
- Realtime-уведомления о статусе через Supabase Realtime
- Загрузка фото авто в Supabase Storage
- Роль механика с собственным графиком работ
- EAS Build для публикации в App Store / Play Store
