-- Relax product-images storage write checks to avoid false negatives from metadata at insert time.
-- Keep admin-only writes and scoped path format <product_uuid>/<filename>.

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and name ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]+$'
  );

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and name ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]+$'
  );
