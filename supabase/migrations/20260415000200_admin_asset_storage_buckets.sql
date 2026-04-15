-- Admin storage buckets for non-product catalog assets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-images',
    'product-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'brand-images',
    'brand-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'category-images',
    'category-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'merchant-logos',
    'merchant-logos',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Brand images bucket policies.
drop policy if exists brand_images_public_read on storage.objects;
create policy brand_images_public_read on storage.objects
  for select
  using (bucket_id = 'brand-images');

drop policy if exists brand_images_admin_insert on storage.objects;
create policy brand_images_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'brand-images' and public.is_admin());

drop policy if exists brand_images_admin_update on storage.objects;
create policy brand_images_admin_update on storage.objects
  for update
  using (bucket_id = 'brand-images' and public.is_admin())
  with check (bucket_id = 'brand-images' and public.is_admin());

drop policy if exists brand_images_admin_delete on storage.objects;
create policy brand_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'brand-images' and public.is_admin());

-- Category images bucket policies.
drop policy if exists category_images_public_read on storage.objects;
create policy category_images_public_read on storage.objects
  for select
  using (bucket_id = 'category-images');

drop policy if exists category_images_admin_insert on storage.objects;
create policy category_images_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'category-images' and public.is_admin());

drop policy if exists category_images_admin_update on storage.objects;
create policy category_images_admin_update on storage.objects
  for update
  using (bucket_id = 'category-images' and public.is_admin())
  with check (bucket_id = 'category-images' and public.is_admin());

drop policy if exists category_images_admin_delete on storage.objects;
create policy category_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'category-images' and public.is_admin());

-- Merchant logos bucket policies.
drop policy if exists merchant_logos_public_read on storage.objects;
create policy merchant_logos_public_read on storage.objects
  for select
  using (bucket_id = 'merchant-logos');

drop policy if exists merchant_logos_admin_insert on storage.objects;
create policy merchant_logos_admin_insert on storage.objects
  for insert
  with check (bucket_id = 'merchant-logos' and public.is_admin());

drop policy if exists merchant_logos_admin_update on storage.objects;
create policy merchant_logos_admin_update on storage.objects
  for update
  using (bucket_id = 'merchant-logos' and public.is_admin())
  with check (bucket_id = 'merchant-logos' and public.is_admin());

drop policy if exists merchant_logos_admin_delete on storage.objects;
create policy merchant_logos_admin_delete on storage.objects
  for delete
  using (bucket_id = 'merchant-logos' and public.is_admin());
