#!/usr/bin/env node

const migration = `
-- FORQ Database Migration
-- Run this SQL in your Supabase SQL Editor

-- Create profiles table
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null,
  diet_tags text[] default '{}',
  allergy_tags text[] default '{}',
  cuisines jsonb not null default '{}', -- {"japanese":0.9,"mexican":0.2}
  spice int default 0,
  sweet_savory float default 0.5,
  herby_umami float default 0.5,
  crunchy_soft float default 0.5,
  budget text default '$$',
  goals text[] default '{}',
  excludes text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create restaurants table (needed before dishes FK)
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
  hours jsonb,
  atmosphere text,
  rating numeric,
  review_count int,
  reservation_url text,
  image_url text
);

-- Create dishes table
create table if not exists dishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cuisine text not null,
  diet_tags text[] default '{}',      -- e.g. {"vegan","gluten_free"}
  allergens text[] default '{}',      -- e.g. {"peanuts","soy"}
  spice int default 0,                 -- 0-5
  macros jsonb,                        -- {"kcal":520,"protein":32,"carbs":55,"fat":18}
  taste jsonb,                         -- {"sweet_savory":0.2,"herby_umami":0.8,"crunchy_soft":0.4}
  url text,                            -- external link for now
  image_url text,
  restaurant_id uuid references restaurants(id),
  platform text check (platform in ('doordash','ubereats','postmates','grubhub')),
  price_cents int
);

-- Create favorites table
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  dish_id uuid not null,
  created_at timestamptz default now()
);

-- NEW: platforms user linking (MVP)
create table if not exists linked_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  provider text not null check (provider in ('doordash','ubereats','postmates','grubhub')),
  external_user_id text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, provider)
);


-- OPTIONAL: lightweight reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id),
  stars int check (stars between 1 and 5),
  text text,
  created_at timestamptz default now()
);

-- Add foreign key constraints (skip if they already exist)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_user_id_fkey') then
    alter table profiles add constraint profiles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'favorites_user_id_fkey') then
    alter table favorites add constraint favorites_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'favorites_dish_id_fkey') then
    alter table favorites add constraint favorites_dish_id_fkey
      foreign key (dish_id) references dishes(id) on delete cascade;
  end if;
end $$;

-- Helpful indexes for FKs
create index if not exists idx_dishes_restaurant_id on dishes(restaurant_id);
create index if not exists idx_reviews_restaurant_id on reviews(restaurant_id);

-- Add unique constraint for user favorites (skip if exists)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'favorites_user_dish_unique') then
    alter table favorites add constraint favorites_user_dish_unique
      unique (user_id, dish_id);
  end if;
end $$;

-- Enable Row Level Security
alter table profiles enable row level security;
alter table dishes enable row level security;
alter table favorites enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = user_id);

-- RLS Policies for dishes (public read)
create policy "Anyone can view dishes" on dishes
  for select using (true);

-- RLS Policies for favorites
create policy "Users can view own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on favorites
  for delete using (auth.uid() = user_id);
`;

console.log('🗃️  FORQ Database Migration SQL');
console.log('📋 Copy and paste this into your Supabase SQL Editor:');
console.log('=' .repeat(60));
console.log(migration);
console.log('=' .repeat(60));
console.log('✅ After running this SQL, your database will be ready!');
