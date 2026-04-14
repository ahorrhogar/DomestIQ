begin;

-- Extend catalog entities for admin operations.
alter table public.brands
  add column if not exists logo_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.categories
  add column if not exists slug text,
  add column if not exists icon text,
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.products
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists long_description text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists is_active boolean not null default true,
  add column if not exists sku text,
  add column if not exists ean text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists search_count integer not null default 0;

alter table public.merchants
  add column if not exists domain text,
  add column if not exists country text not null default 'ES',
  add column if not exists is_active boolean not null default true,
  add column if not exists brand_color text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.offers
  add column if not exists is_active boolean not null default true,
  add column if not exists is_featured boolean not null default false;

-- Admin and operations tables.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source text not null default 'csv',
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  row_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  error_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.import_jobs(id) on delete cascade,
  level text not null check (level in ('info', 'warning', 'error')),
  message text not null,
  row_index integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.search_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  normalized_term text not null,
  product_id uuid references public.products(id) on delete set null,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_status (
  id uuid primary key default gen_random_uuid(),
  source text not null unique,
  status text not null check (status in ('healthy', 'warning', 'error')),
  last_success_at timestamptz,
  last_error_at timestamptz,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.import_jobs alter column user_id set default auth.uid();
alter table public.admin_actions alter column user_id set default auth.uid();

-- Indexes and constraints for admin workflows.
create unique index if not exists idx_products_slug_unique on public.products(slug) where slug is not null;
create unique index if not exists idx_categories_slug_parent_unique on public.categories(slug, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));
create unique index if not exists idx_merchants_name_unique on public.merchants(lower(name));
create unique index if not exists idx_brands_name_unique_lower on public.brands(lower(name));
create unique index if not exists idx_search_terms_normalized_unique on public.search_terms(normalized_term);

create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_offers_is_active on public.offers(is_active);
create index if not exists idx_categories_parent_sort on public.categories(parent_id, sort_order);
create index if not exists idx_import_jobs_status_created on public.import_jobs(status, created_at desc);
create index if not exists idx_import_job_logs_job_created on public.import_job_logs(job_id, created_at desc);
create index if not exists idx_admin_actions_created on public.admin_actions(created_at desc);
create index if not exists idx_admin_actions_entity on public.admin_actions(entity_type, entity_id);
create index if not exists idx_clicks_merchant_id on public.clicks(merchant_id);
create index if not exists idx_clicks_created_at on public.clicks(created_at desc);

-- Automatic updated_at maintenance.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_merchants_updated_at on public.merchants;
create trigger trg_merchants_updated_at
before update on public.merchants
for each row execute function public.set_updated_at();

drop trigger if exists trg_import_jobs_updated_at on public.import_jobs;
create trigger trg_import_jobs_updated_at
before update on public.import_jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_search_terms_updated_at on public.search_terms;
create trigger trg_search_terms_updated_at
before update on public.search_terms
for each row execute function public.set_updated_at();

drop trigger if exists trg_sync_status_updated_at on public.sync_status;
create trigger trg_sync_status_updated_at
before update on public.sync_status
for each row execute function public.set_updated_at();

-- Re-define admin check to support admin_users table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    ),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Enable RLS for admin tables.
alter table public.admin_users enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_job_logs enable row level security;
alter table public.admin_actions enable row level security;
alter table public.search_terms enable row level security;
alter table public.sync_status enable row level security;

-- Admin users management (admin only).
drop policy if exists admin_users_admin_read on public.admin_users;
create policy admin_users_admin_read on public.admin_users
  for select using (public.is_admin());

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select using (auth.uid() = user_id);

drop policy if exists admin_users_admin_write on public.admin_users;
create policy admin_users_admin_write on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- Imports.
drop policy if exists import_jobs_admin_read on public.import_jobs;
create policy import_jobs_admin_read on public.import_jobs
  for select using (public.is_admin());

drop policy if exists import_jobs_admin_write on public.import_jobs;
create policy import_jobs_admin_write on public.import_jobs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists import_job_logs_admin_read on public.import_job_logs;
create policy import_job_logs_admin_read on public.import_job_logs
  for select using (public.is_admin());

drop policy if exists import_job_logs_admin_write on public.import_job_logs;
create policy import_job_logs_admin_write on public.import_job_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- Audit logs.
drop policy if exists admin_actions_admin_read on public.admin_actions;
create policy admin_actions_admin_read on public.admin_actions
  for select using (public.is_admin());

drop policy if exists admin_actions_admin_insert on public.admin_actions;
create policy admin_actions_admin_insert on public.admin_actions
  for insert with check (public.is_admin());

-- Search terms and sync status admin-only.
drop policy if exists search_terms_admin_read on public.search_terms;
create policy search_terms_admin_read on public.search_terms
  for select using (public.is_admin());

drop policy if exists search_terms_admin_write on public.search_terms;
create policy search_terms_admin_write on public.search_terms
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists sync_status_admin_read on public.sync_status;
create policy sync_status_admin_read on public.sync_status
  for select using (public.is_admin());

drop policy if exists sync_status_admin_write on public.sync_status;
create policy sync_status_admin_write on public.sync_status
  for all using (public.is_admin()) with check (public.is_admin());

-- Ensure public read still applies after schema extension.
drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands
  for select using (true);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists merchants_public_read on public.merchants;
create policy merchants_public_read on public.merchants
  for select using (true);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (true);

drop policy if exists offers_public_read on public.offers;
create policy offers_public_read on public.offers
  for select using (true);

-- Recreate admin writes for extended tables.
drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists merchants_admin_write on public.merchants;
create policy merchants_admin_write on public.merchants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists offers_admin_write on public.offers;
create policy offers_admin_write on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

-- Keep clicks behavior.
drop policy if exists clicks_public_insert on public.clicks;
create policy clicks_public_insert on public.clicks
  for insert with check (true);

drop policy if exists clicks_admin_read on public.clicks;
create policy clicks_admin_read on public.clicks
  for select using (public.is_admin());

drop policy if exists clicks_admin_write on public.clicks;
create policy clicks_admin_write on public.clicks
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.admin_users, public.import_jobs, public.import_job_logs, public.admin_actions, public.search_terms, public.sync_status to authenticated;
grant insert, update, delete on public.import_jobs, public.import_job_logs, public.admin_actions, public.search_terms, public.sync_status to authenticated;

grant select, insert, update, delete on public.brands, public.categories, public.products, public.product_images, public.merchants, public.offers, public.price_history, public.clicks to authenticated;

commit;
