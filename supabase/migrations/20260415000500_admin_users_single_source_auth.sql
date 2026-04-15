begin;

-- Strengthen admin_users as the single source of truth for admin authorization.
alter table public.admin_users
  add column if not exists role text not null default 'admin',
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_users_role_check'
      and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_role_check check (role in ('admin'));
  end if;
end;
$$;

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

-- One-time safe backfill from legacy metadata-based admins.
-- This preserves current access while moving runtime authorization to admin_users.
insert into public.admin_users (user_id, role)
select u.id, 'admin'
from auth.users u
where coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
on conflict (user_id) do update
set
  role = 'admin',
  updated_at = now();

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'service_role'
    or exists (
      select 1
      from public.admin_users au
      where au.user_id = p_user_id
        and au.role = 'admin'
    ),
    false
  );
$$;

-- Backward-compatible wrapper for existing SQL functions.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid());
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Core catalog admin policies.
drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists merchants_admin_write on public.merchants;
create policy merchants_admin_write on public.merchants
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists offers_admin_write on public.offers;
create policy offers_admin_write on public.offers
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists price_history_admin_write on public.price_history;
create policy price_history_admin_write on public.price_history
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists clicks_admin_read on public.clicks;
create policy clicks_admin_read on public.clicks
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists clicks_admin_write on public.clicks;
create policy clicks_admin_write on public.clicks
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

-- Admin control tables.
drop policy if exists admin_users_admin_read on public.admin_users;
create policy admin_users_admin_read on public.admin_users
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select
  using (auth.uid() = user_id);

drop policy if exists admin_users_admin_write on public.admin_users;
create policy admin_users_admin_write on public.admin_users
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists import_jobs_admin_read on public.import_jobs;
create policy import_jobs_admin_read on public.import_jobs
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists import_jobs_admin_write on public.import_jobs;
create policy import_jobs_admin_write on public.import_jobs
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists import_job_logs_admin_read on public.import_job_logs;
create policy import_job_logs_admin_read on public.import_job_logs
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists import_job_logs_admin_write on public.import_job_logs;
create policy import_job_logs_admin_write on public.import_job_logs
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists admin_actions_admin_read on public.admin_actions;
create policy admin_actions_admin_read on public.admin_actions
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists admin_actions_admin_insert on public.admin_actions;
create policy admin_actions_admin_insert on public.admin_actions
  for insert
  with check ((select public.is_admin(auth.uid())));

drop policy if exists search_terms_admin_read on public.search_terms;
create policy search_terms_admin_read on public.search_terms
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists search_terms_admin_write on public.search_terms;
create policy search_terms_admin_write on public.search_terms
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists sync_status_admin_read on public.sync_status;
create policy sync_status_admin_read on public.sync_status
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists sync_status_admin_write on public.sync_status;
create policy sync_status_admin_write on public.sync_status
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists admin_rate_limits_admin_read on public.admin_rate_limits;
create policy admin_rate_limits_admin_read on public.admin_rate_limits
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists admin_rate_limits_admin_write on public.admin_rate_limits;
create policy admin_rate_limits_admin_write on public.admin_rate_limits
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists admin_rate_limit_events_admin_read on public.admin_rate_limit_events;
create policy admin_rate_limit_events_admin_read on public.admin_rate_limit_events
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists admin_rate_limit_events_admin_write on public.admin_rate_limit_events;
create policy admin_rate_limit_events_admin_write on public.admin_rate_limit_events
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

-- Offer sync admin tables.
drop policy if exists offer_price_history_admin_read on public.offer_price_history;
create policy offer_price_history_admin_read on public.offer_price_history
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists offer_price_history_admin_write on public.offer_price_history;
create policy offer_price_history_admin_write on public.offer_price_history
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

drop policy if exists offer_sync_jobs_admin_read on public.offer_sync_jobs;
create policy offer_sync_jobs_admin_read on public.offer_sync_jobs
  for select
  using ((select public.is_admin(auth.uid())));

drop policy if exists offer_sync_jobs_admin_write on public.offer_sync_jobs;
create policy offer_sync_jobs_admin_write on public.offer_sync_jobs
  for all
  using ((select public.is_admin(auth.uid())))
  with check ((select public.is_admin(auth.uid())));

-- Storage admin policies.
drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin(auth.uid()))
    and name ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]+$'
  );

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update
  using (bucket_id = 'product-images' and (select public.is_admin(auth.uid())))
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin(auth.uid()))
    and name ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]+$'
  );

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'product-images' and (select public.is_admin(auth.uid())));

drop policy if exists brand_images_admin_insert on storage.objects;
create policy brand_images_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'brand-images' and (select public.is_admin(auth.uid())));

drop policy if exists brand_images_admin_update on storage.objects;
create policy brand_images_admin_update on storage.objects
  for update
  using (bucket_id = 'brand-images' and (select public.is_admin(auth.uid())))
  with check (bucket_id = 'brand-images' and (select public.is_admin(auth.uid())));

drop policy if exists brand_images_admin_delete on storage.objects;
create policy brand_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'brand-images' and (select public.is_admin(auth.uid())));

drop policy if exists category_images_admin_insert on storage.objects;
create policy category_images_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'category-images' and (select public.is_admin(auth.uid())));

drop policy if exists category_images_admin_update on storage.objects;
create policy category_images_admin_update on storage.objects
  for update
  using (bucket_id = 'category-images' and (select public.is_admin(auth.uid())))
  with check (bucket_id = 'category-images' and (select public.is_admin(auth.uid())));

drop policy if exists category_images_admin_delete on storage.objects;
create policy category_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'category-images' and (select public.is_admin(auth.uid())));

drop policy if exists merchant_logos_admin_insert on storage.objects;
create policy merchant_logos_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'merchant-logos' and (select public.is_admin(auth.uid())));

drop policy if exists merchant_logos_admin_update on storage.objects;
create policy merchant_logos_admin_update on storage.objects
  for update
  using (bucket_id = 'merchant-logos' and (select public.is_admin(auth.uid())))
  with check (bucket_id = 'merchant-logos' and (select public.is_admin(auth.uid())));

drop policy if exists merchant_logos_admin_delete on storage.objects;
create policy merchant_logos_admin_delete on storage.objects
  for delete
  using (bucket_id = 'merchant-logos' and (select public.is_admin(auth.uid())));

commit;
