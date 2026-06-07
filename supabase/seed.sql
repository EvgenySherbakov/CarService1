-- Seed data for AutoDuck / CarService1
-- Run after schema.sql.

-- Service categories
insert into public.service_categories (type, slug, name, icon) values
  ('repair', 'engine',     'Engine',       'engine'),
  ('repair', 'brakes',     'Brakes',       'brakes'),
  ('repair', 'suspension', 'Suspension',   'suspension'),
  ('repair', 'electrical', 'Electrical',   'bolt'),
  ('wash',   'basic',      'Basic wash',   'wash'),
  ('wash',   'premium',    'Premium wash', 'sparkle')
on conflict (slug) do nothing;

-- Services
insert into public.services (category_id, type, name, description, price_from, duration_minutes, image_url)
select c.id, 'repair', 'Engine diagnostics',
       'Full computer diagnostics, error codes and inspection report.', 180, 60,
       'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'
from public.service_categories c where c.slug = 'engine'
on conflict do nothing;

insert into public.services (category_id, type, name, description, price_from, duration_minutes, image_url)
select c.id, 'repair', 'Brake pads replacement',
       'Front or rear pads + brake fluid check.', 320, 90,
       'https://images.unsplash.com/photo-1632823469850-2f77dd1eea7c?w=800'
from public.service_categories c where c.slug = 'brakes'
on conflict do nothing;

insert into public.services (category_id, type, name, description, price_from, duration_minutes, image_url)
select c.id, 'wash', 'Basic wash',
       'Exterior wash, drying and tire shine.', 60, 30,
       'https://images.unsplash.com/photo-1605618826115-fb9e0cabd9c4?w=800'
from public.service_categories c where c.slug = 'basic'
on conflict do nothing;

insert into public.services (category_id, type, name, description, price_from, duration_minutes, image_url)
select c.id, 'wash', 'Premium detail',
       'Inside-out detail, wax and leather treatment.', 220, 120,
       'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800'
from public.service_categories c where c.slug = 'premium'
on conflict do nothing;

-- Rental fleet
insert into public.rental_cars (make, model, year, transmission, fuel, seats, price_per_day, deposit_amount, image_url) values
  ('Chevrolet','Onix',          2024,'automatic','petrol',  5, 220, 800,  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200'),
  ('Volkswagen','T-Cross',      2023,'automatic','petrol',  5, 320, 1200, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200'),
  ('Tesla','Model 3',           2024,'automatic','electric',5, 690, 2500, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200'),
  ('Toyota','Corolla Cross',    2023,'automatic','hybrid',  5, 410, 1500, 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=1200'),
  ('Fiat','Mobi',               2022,'manual','petrol',     4, 140, 500,  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200')
on conflict do nothing;
