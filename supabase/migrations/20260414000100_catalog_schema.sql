begin;

create extension if not exists pgcrypto;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid null references public.categories(id) on delete set null
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_id uuid not null references public.brands(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text not null,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text null
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  price numeric(12, 2) not null check (price > 0),
  old_price numeric(12, 2) null,
  url text not null,
  stock boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric(12, 2) not null check (price > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_offers_product_id on public.offers(product_id);
create index if not exists idx_offers_merchant_id on public.offers(merchant_id);
create index if not exists idx_price_history_product_id on public.price_history(product_id);
create index if not exists idx_clicks_product_id on public.clicks(product_id);

create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_price_history_product_created_at on public.price_history(product_id, created_at desc);
create index if not exists idx_clicks_product_created_at on public.clicks(product_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'service_role',
    false
  );
$$;

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.merchants enable row level security;
alter table public.offers enable row level security;
alter table public.price_history enable row level security;
alter table public.clicks enable row level security;

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands
  for select
  using (true);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select
  using (true);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select
  using (true);

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select
  using (true);

drop policy if exists merchants_public_read on public.merchants;
create policy merchants_public_read on public.merchants
  for select
  using (true);

drop policy if exists offers_public_read on public.offers;
create policy offers_public_read on public.offers
  for select
  using (true);

drop policy if exists price_history_public_read on public.price_history;
create policy price_history_public_read on public.price_history
  for select
  using (true);

-- Admin writes on all tables.
drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists merchants_admin_write on public.merchants;
create policy merchants_admin_write on public.merchants
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists offers_admin_write on public.offers;
create policy offers_admin_write on public.offers
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists price_history_admin_write on public.price_history;
create policy price_history_admin_write on public.price_history
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Clicks: public insert allowed, read/write otherwise admin-only.
drop policy if exists clicks_public_insert on public.clicks;
create policy clicks_public_insert on public.clicks
  for insert
  with check (true);

drop policy if exists clicks_admin_read on public.clicks;
create policy clicks_admin_read on public.clicks
  for select
  using (public.is_admin());

drop policy if exists clicks_admin_write on public.clicks;
create policy clicks_admin_write on public.clicks
  for all
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to anon, authenticated;

grant select on table public.products to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.brands to anon, authenticated;
grant select on table public.offers to anon, authenticated;
grant select on table public.merchants to anon, authenticated;
grant select on table public.product_images to anon, authenticated;
grant select on table public.price_history to anon, authenticated;

grant insert on table public.clicks to anon, authenticated;

commit;
