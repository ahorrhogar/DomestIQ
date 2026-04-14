begin;

insert into public.sync_status (source, status, last_success_at, message)
values
  ('catalog_import', 'healthy', now(), 'Catalog initialized'),
  ('offers_sync', 'healthy', now(), 'Offers updated recently')
on conflict (source) do update
set
  status = excluded.status,
  last_success_at = excluded.last_success_at,
  message = excluded.message;

insert into public.search_terms (term, normalized_term, count)
values
  ('sofa nordico', 'sofa nordico', 120),
  ('lavadora 9kg', 'lavadora 9kg', 95),
  ('freidora aire', 'freidora aire', 88)
on conflict (normalized_term) do update
set
  count = excluded.count,
  updated_at = now();

-- Example to grant admin access:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'admin@tu-dominio.com'
-- on conflict (user_id) do nothing;

commit;
