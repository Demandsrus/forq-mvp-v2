-- Schema extension for platforms, restaurants, and reviews
-- Run this in your Supabase SQL Editor

-- NEW: platforms user linking (MVP: store tokens/ids you obtain manually for now)
create table if not exists linked_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  provider text not null check (provider in ('doordash','ubereats','postmates','grubhub')),
  external_user_id text not null,
  access_token text,         -- store encrypted in prod; plaintext for MVP only
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, provider)
);

-- NEW: restaurants
create table if not exists restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  platform text not null check (platform in ('doordash','ubereats','postmates','grubhub')),
  platform_restaurant_id text not null,
  cuisine text not null,
  address text,
  city text,
  state text,
  postal_code text,
  lat double precision,
  lng double precision,
  hours jsonb,               -- {"mon":[["11:30","21:00"],...], "sun":[...]}
  atmosphere text,           -- short descriptor for UI
  rating numeric,            -- 0..5
  review_count int,
  reservation_url text,      -- OpenTable/Resy or site; optional
  image_url text
);

-- MODIFY: dishes -> link to restaurant + mark as real-menu item
alter table dishes
  add column if not exists restaurant_id uuid references restaurants(id),
  add column if not exists platform text check (platform in ('doordash','ubereats','postmates','grubhub')),
  add column if not exists price_cents int;

-- OPTIONAL: lightweight reviews (seeded)
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id),
  stars int check (stars between 1 and 5),
  text text,
  created_at timestamptz default now()
);

-- Helpful indexes for FKs
create index if not exists idx_dishes_restaurant_id on dishes(restaurant_id);
create index if not exists idx_reviews_restaurant_id on reviews(restaurant_id);

