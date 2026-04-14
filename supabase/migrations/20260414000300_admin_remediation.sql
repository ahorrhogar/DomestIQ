begin;

-- Persistent rate limit state for admin mutations.
create table if not exists public.admin_rate_limits (
  id bigserial primary key,
  scope text not null,
  subject_type text not null check (subject_type in ('user', 'ip')),
  subject_key text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  blocked_until timestamptz,
  last_request_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, subject_type, subject_key)
);

create table if not exists public.admin_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  reason text not null,
  subject_type text not null check (subject_type in ('user', 'ip')),
  subject_key text not null,
  user_id uuid,
  ip text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_rate_limits_scope_subject
  on public.admin_rate_limits(scope, subject_type, subject_key);

create index if not exists idx_admin_rate_limit_events_created
  on public.admin_rate_limit_events(created_at desc);

create index if not exists idx_admin_rate_limit_events_scope
  on public.admin_rate_limit_events(scope, created_at desc);

alter table public.admin_rate_limits enable row level security;
alter table public.admin_rate_limit_events enable row level security;

drop policy if exists admin_rate_limits_admin_read on public.admin_rate_limits;
create policy admin_rate_limits_admin_read on public.admin_rate_limits
  for select using (public.is_admin());

drop policy if exists admin_rate_limits_admin_write on public.admin_rate_limits;
create policy admin_rate_limits_admin_write on public.admin_rate_limits
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_rate_limit_events_admin_read on public.admin_rate_limit_events;
create policy admin_rate_limit_events_admin_read on public.admin_rate_limit_events
  for select using (public.is_admin());

drop policy if exists admin_rate_limit_events_admin_write on public.admin_rate_limit_events;
create policy admin_rate_limit_events_admin_write on public.admin_rate_limit_events
  for all using (public.is_admin()) with check (public.is_admin());

-- Reuse existing updated_at trigger helper.
drop trigger if exists trg_admin_rate_limits_updated_at on public.admin_rate_limits;
create trigger trg_admin_rate_limits_updated_at
before update on public.admin_rate_limits
for each row execute function public.set_updated_at();

create or replace function public.get_request_ip()
returns text
language plpgsql
stable
as $$
declare
  v_headers_text text;
  v_headers jsonb;
  v_forwarded text;
begin
  v_headers_text := nullif(current_setting('request.headers', true), '');

  if v_headers_text is null then
    return null;
  end if;

  v_headers := v_headers_text::jsonb;
  v_forwarded := coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip', '');

  if v_forwarded = '' then
    return null;
  end if;

  return btrim(split_part(v_forwarded, ',', 1));
exception
  when others then
    return null;
end;
$$;

create or replace function public.check_admin_rate_limit(
  p_scope text,
  p_max_requests integer default 30,
  p_window_seconds integer default 60,
  p_block_seconds integer default 300,
  p_ip_override text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_scope text := left(coalesce(nullif(trim(p_scope), ''), 'admin:generic'), 120);
  v_limit integer := greatest(p_max_requests, 1);
  v_window interval := make_interval(secs => greatest(p_window_seconds, 1));
  v_block interval := make_interval(secs => greatest(p_block_seconds, 10));
  v_user_key text := coalesce(auth.uid()::text, 'anonymous');
  v_ip text := coalesce(nullif(p_ip_override, ''), public.get_request_ip(), 'unknown');

  v_user_row public.admin_rate_limits%rowtype;
  v_ip_row public.admin_rate_limits%rowtype;

  v_user_allowed boolean := true;
  v_ip_allowed boolean := true;

  v_reason text := 'ok';
  v_user_remaining integer := v_limit;
  v_ip_remaining integer := v_limit;
  v_user_reset_at timestamptz := v_now + v_window;
  v_ip_reset_at timestamptz := v_now + v_window;
  v_blocked_until timestamptz := null;
begin
  select *
  into v_user_row
  from public.admin_rate_limits
  where scope = v_scope and subject_type = 'user' and subject_key = v_user_key
  for update;

  if not found then
    insert into public.admin_rate_limits (
      scope,
      subject_type,
      subject_key,
      window_started_at,
      request_count,
      blocked_until,
      last_request_at
    )
    values (v_scope, 'user', v_user_key, v_now, 1, null, v_now)
    returning * into v_user_row;
  else
    if v_user_row.blocked_until is not null and v_user_row.blocked_until > v_now then
      v_user_allowed := false;
      v_reason := 'user_blocked';
    else
      if v_user_row.window_started_at + v_window <= v_now then
        update public.admin_rate_limits
        set
          window_started_at = v_now,
          request_count = 1,
          blocked_until = null,
          last_request_at = v_now
        where id = v_user_row.id
        returning * into v_user_row;
      else
        update public.admin_rate_limits
        set
          request_count = v_user_row.request_count + 1,
          last_request_at = v_now
        where id = v_user_row.id
        returning * into v_user_row;

        if v_user_row.request_count > v_limit then
          update public.admin_rate_limits
          set blocked_until = v_now + v_block
          where id = v_user_row.id
          returning * into v_user_row;

          v_user_allowed := false;
          v_reason := 'user_limit';
        end if;
      end if;
    end if;
  end if;

  v_user_remaining := greatest(v_limit - coalesce(v_user_row.request_count, 0), 0);
  v_user_reset_at := coalesce(v_user_row.window_started_at, v_now) + v_window;
  if v_user_row.blocked_until is not null then
    v_user_reset_at := greatest(v_user_reset_at, v_user_row.blocked_until);
  end if;

  select *
  into v_ip_row
  from public.admin_rate_limits
  where scope = v_scope and subject_type = 'ip' and subject_key = v_ip
  for update;

  if not found then
    insert into public.admin_rate_limits (
      scope,
      subject_type,
      subject_key,
      window_started_at,
      request_count,
      blocked_until,
      last_request_at
    )
    values (v_scope, 'ip', v_ip, v_now, 1, null, v_now)
    returning * into v_ip_row;
  else
    if v_ip_row.blocked_until is not null and v_ip_row.blocked_until > v_now then
      v_ip_allowed := false;
      if v_reason = 'ok' then
        v_reason := 'ip_blocked';
      end if;
    else
      if v_ip_row.window_started_at + v_window <= v_now then
        update public.admin_rate_limits
        set
          window_started_at = v_now,
          request_count = 1,
          blocked_until = null,
          last_request_at = v_now
        where id = v_ip_row.id
        returning * into v_ip_row;
      else
        update public.admin_rate_limits
        set
          request_count = v_ip_row.request_count + 1,
          last_request_at = v_now
        where id = v_ip_row.id
        returning * into v_ip_row;

        if v_ip_row.request_count > v_limit then
          update public.admin_rate_limits
          set blocked_until = v_now + v_block
          where id = v_ip_row.id
          returning * into v_ip_row;

          v_ip_allowed := false;
          if v_reason = 'ok' then
            v_reason := 'ip_limit';
          end if;
        end if;
      end if;
    end if;
  end if;

  v_ip_remaining := greatest(v_limit - coalesce(v_ip_row.request_count, 0), 0);
  v_ip_reset_at := coalesce(v_ip_row.window_started_at, v_now) + v_window;
  if v_ip_row.blocked_until is not null then
    v_ip_reset_at := greatest(v_ip_reset_at, v_ip_row.blocked_until);
  end if;

  if not v_user_allowed or not v_ip_allowed then
    v_blocked_until := greatest(coalesce(v_user_row.blocked_until, v_now), coalesce(v_ip_row.blocked_until, v_now));

    insert into public.admin_rate_limit_events (
      scope,
      reason,
      subject_type,
      subject_key,
      user_id,
      ip,
      metadata
    )
    values (
      v_scope,
      v_reason,
      case
        when v_reason in ('user_limit', 'user_blocked') then 'user'
        else 'ip'
      end,
      case
        when v_reason in ('user_limit', 'user_blocked') then v_user_key
        else v_ip
      end,
      auth.uid(),
      v_ip,
      jsonb_build_object(
        'maxRequests', v_limit,
        'windowSeconds', p_window_seconds,
        'blockSeconds', p_block_seconds,
        'userRemaining', v_user_remaining,
        'ipRemaining', v_ip_remaining
      )
    );
  end if;

  return jsonb_build_object(
    'allowed', v_user_allowed and v_ip_allowed,
    'scope', v_scope,
    'reason', v_reason,
    'remaining', least(v_user_remaining, v_ip_remaining),
    'resetAt', least(v_user_reset_at, v_ip_reset_at),
    'blockedUntil', v_blocked_until,
    'userRemaining', v_user_remaining,
    'ipRemaining', v_ip_remaining,
    'userKey', v_user_key,
    'ip', v_ip
  );
end;
$$;

grant execute on function public.check_admin_rate_limit(text, integer, integer, integer, text) to authenticated;

-- Category cycle guard.
create or replace function public.category_parent_would_create_cycle(
  p_category_id uuid,
  p_parent_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  with recursive parent_chain as (
    select c.id, c.parent_id, array[c.id] as visited
    from public.categories c
    where c.id = p_parent_id

    union all

    select c.id, c.parent_id, parent_chain.visited || c.id
    from public.categories c
    join parent_chain on c.id = parent_chain.parent_id
    where not c.id = any(parent_chain.visited)
  )
  select exists (
    select 1
    from parent_chain
    where id = p_category_id
  );
$$;

create or replace function public.validate_category_parent_cycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'Una categoria no puede ser su propio padre';
  end if;

  if public.category_parent_would_create_cycle(new.id, new.parent_id) then
    raise exception 'No se puede guardar la categoria porque genera un ciclo en la jerarquia';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_categories_prevent_cycle on public.categories;
create trigger trg_categories_prevent_cycle
before insert or update of parent_id on public.categories
for each row execute function public.validate_category_parent_cycle();

-- Storage hardening for product images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_valid_product_image_object(
  p_name text,
  p_metadata jsonb
)
returns boolean
language plpgsql
stable
as $$
declare
  v_size bigint;
  v_mimetype text;
  v_ext text;
begin
  if p_name is null or p_name = '' then
    return false;
  end if;

  if p_name like '%..%' then
    return false;
  end if;

  if p_name !~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]+$' then
    return false;
  end if;

  v_mimetype := lower(coalesce(p_metadata ->> 'mimetype', ''));
  if v_mimetype not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif') then
    return false;
  end if;

  v_ext := lower(split_part(p_name, '.', array_length(string_to_array(p_name, '.'), 1)));
  if v_ext not in ('jpg', 'jpeg', 'png', 'webp', 'gif') then
    return false;
  end if;

  begin
    v_size := nullif(regexp_replace(coalesce(p_metadata ->> 'size', ''), '[^0-9]', '', 'g'), '')::bigint;
  exception
    when others then
      v_size := null;
  end;

  if v_size is null or v_size <= 0 or v_size > 10485760 then
    return false;
  end if;

  return true;
end;
$$;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select
  using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and public.is_valid_product_image_object(name, metadata)
  );

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and public.is_valid_product_image_object(name, metadata)
  );

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- SQL import with transactional semantics and batched processing.
create or replace function public.normalize_slug(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(regexp_replace(lower(coalesce(value, '')), '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g'));
$$;

create or replace function public.import_products_batch(
  p_job_id uuid,
  p_data jsonb,
  p_batch_size integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_index integer := 0;
  v_total integer := 0;
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_error_count integer := 0;
  v_warning_count integer := 0;
  v_row_errors jsonb := '[]'::jsonb;

  v_batch_size integer := greatest(1, least(p_batch_size, 500));
  v_batch_offset integer := 0;
  v_batch_end integer := 0;

  v_product_name text;
  v_brand_name text;
  v_category_name text;
  v_subcategory_name text;
  v_short_description text;
  v_long_description text;
  v_merchant_name text;
  v_offer_url text;
  v_image_url text;
  v_price numeric;
  v_old_price numeric;
  v_stock boolean;
  v_sku text;
  v_ean text;
  v_tags text[];

  v_brand_id uuid;
  v_merchant_id uuid;
  v_parent_category_id uuid;
  v_category_id uuid;
  v_product_id uuid;
  v_offer_id uuid;
  v_slug text;
  v_is_product_new boolean;
  v_is_offer_new boolean;
  v_has_primary_image boolean;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para ejecutar importaciones';
  end if;

  if p_data is null or jsonb_typeof(p_data) <> 'array' then
    raise exception 'El payload de importacion debe ser un array JSON';
  end if;

  v_total := jsonb_array_length(p_data);

  if v_total = 0 then
    return jsonb_build_object(
      'createdCount', 0,
      'updatedCount', 0,
      'errorCount', 0,
      'warningCount', 0,
      'totalRows', 0,
      'batchSize', v_batch_size
    );
  end if;

  if v_total > 10000 then
    raise exception 'El payload supera el limite permitido de 10000 filas';
  end if;

  while v_batch_offset < v_total loop
    v_batch_end := least(v_batch_offset + v_batch_size - 1, v_total - 1);

    for v_row in
      select value
      from jsonb_array_elements(p_data) with ordinality as rows(value, ord)
      where (ord - 1) between v_batch_offset and v_batch_end
      order by ord
    loop
      v_index := v_index + 1;

      v_product_name := left(trim(coalesce(v_row ->> 'product_name', '')), 180);
      v_brand_name := left(trim(coalesce(v_row ->> 'brand_name', 'Sin marca')), 120);
      v_category_name := left(trim(coalesce(v_row ->> 'category_name', 'General')), 120);
      v_subcategory_name := left(trim(coalesce(v_row ->> 'subcategory_name', '')), 120);
      v_short_description := left(trim(coalesce(v_row ->> 'description', '')), 400);
      v_long_description := left(trim(coalesce(v_row ->> 'long_description', '')), 2000);
      v_merchant_name := left(trim(coalesce(v_row ->> 'merchant_name', '')), 120);
      v_offer_url := trim(coalesce(v_row ->> 'offer_url', ''));
      v_image_url := trim(coalesce(v_row ->> 'image_url', ''));
      v_sku := left(trim(coalesce(v_row ->> 'sku', '')), 80);
      v_ean := left(trim(coalesce(v_row ->> 'ean', '')), 80);

      begin
        v_price := coalesce((v_row ->> 'price')::numeric, 0);
      exception
        when others then
          v_price := 0;
      end;

      begin
        v_old_price := nullif(v_row ->> 'old_price', '')::numeric;
      exception
        when others then
          v_old_price := null;
      end;

      v_stock := coalesce((v_row ->> 'stock')::boolean, false);

      if jsonb_typeof(coalesce(v_row -> 'tags', '[]'::jsonb)) = 'array' then
        select array_agg(left(trim(value::text), 50))
        into v_tags
        from jsonb_array_elements_text(v_row -> 'tags');
      else
        v_tags := array[]::text[];
      end if;

      if v_product_name = '' or v_merchant_name = '' or v_offer_url = '' or v_price <= 0 then
        v_error_count := v_error_count + 1;
        v_row_errors := v_row_errors || jsonb_build_array(
          jsonb_build_object(
            'rowIndex', v_index - 1,
            'message', 'Fila invalida: faltan campos obligatorios o el precio es invalido'
          )
        );
        continue;
      end if;

      if v_offer_url !~* '^https?://' then
        v_error_count := v_error_count + 1;
        v_row_errors := v_row_errors || jsonb_build_array(
          jsonb_build_object(
            'rowIndex', v_index - 1,
            'message', 'Fila invalida: offer_url debe usar http o https'
          )
        );
        continue;
      end if;

      begin
        -- Brand.
        select id into v_brand_id
        from public.brands
        where lower(name) = lower(v_brand_name)
        limit 1;

        if v_brand_id is null then
          insert into public.brands (name, is_active)
          values (v_brand_name, true)
          returning id into v_brand_id;
        end if;

        -- Merchant.
        select id into v_merchant_id
        from public.merchants
        where lower(name) = lower(v_merchant_name)
        limit 1;

        if v_merchant_id is null then
          insert into public.merchants (name, country, is_active)
          values (v_merchant_name, 'ES', true)
          returning id into v_merchant_id;
        end if;

        -- Category and optional subcategory.
        select id into v_parent_category_id
        from public.categories
        where lower(name) = lower(v_category_name)
          and parent_id is null
        limit 1;

        if v_parent_category_id is null then
          insert into public.categories (name, slug, parent_id, is_active)
          values (v_category_name, public.normalize_slug(v_category_name), null, true)
          returning id into v_parent_category_id;
        end if;

        v_category_id := v_parent_category_id;
        if v_subcategory_name <> '' then
          select id into v_category_id
          from public.categories
          where lower(name) = lower(v_subcategory_name)
            and parent_id = v_parent_category_id
          limit 1;

          if v_category_id is null then
            insert into public.categories (name, slug, parent_id, is_active)
            values (v_subcategory_name, public.normalize_slug(v_subcategory_name), v_parent_category_id, true)
            returning id into v_category_id;
          end if;
        end if;

        -- Product.
        v_slug := public.normalize_slug(v_product_name);
        if v_slug = '' then
          v_slug := public.normalize_slug(v_product_name || '-' || substr(gen_random_uuid()::text, 1, 8));
        end if;

        select id into v_product_id
        from public.products
        where slug = v_slug
        limit 1;

        v_is_product_new := v_product_id is null;

        if v_is_product_new then
          insert into public.products (
            name,
            slug,
            brand_id,
            category_id,
            description,
            short_description,
            long_description,
            specs,
            tags,
            attributes,
            is_active,
            sku,
            ean
          )
          values (
            v_product_name,
            v_slug,
            v_brand_id,
            v_category_id,
            coalesce(nullif(v_short_description, ''), nullif(v_long_description, ''), ''),
            v_short_description,
            v_long_description,
            jsonb_build_object(
              'longDescription', v_long_description,
              'attributes', '{}'::jsonb,
              'tags', coalesce(to_jsonb(v_tags), '[]'::jsonb),
              'sku', nullif(v_sku, ''),
              'ean', nullif(v_ean, ''),
              'isActive', true
            ),
            coalesce(v_tags, array[]::text[]),
            '{}'::jsonb,
            true,
            nullif(v_sku, ''),
            nullif(v_ean, '')
          )
          returning id into v_product_id;

          v_created_count := v_created_count + 1;
        else
          update public.products
          set
            name = v_product_name,
            brand_id = v_brand_id,
            category_id = v_category_id,
            description = coalesce(nullif(v_short_description, ''), nullif(v_long_description, ''), description),
            short_description = coalesce(nullif(v_short_description, ''), short_description),
            long_description = coalesce(nullif(v_long_description, ''), long_description),
            specs = jsonb_set(
              jsonb_set(
                jsonb_set(
                  coalesce(specs, '{}'::jsonb),
                  '{longDescription}',
                  to_jsonb(coalesce(nullif(v_long_description, ''), '')),
                  true
                ),
                '{tags}',
                coalesce(to_jsonb(v_tags), '[]'::jsonb),
                true
              ),
              '{isActive}',
              'true'::jsonb,
              true
            ),
            tags = coalesce(v_tags, array[]::text[]),
            is_active = true,
            sku = nullif(v_sku, ''),
            ean = nullif(v_ean, '')
          where id = v_product_id;

          v_updated_count := v_updated_count + 1;
        end if;

        -- Offer.
        select id into v_offer_id
        from public.offers
        where product_id = v_product_id
          and merchant_id = v_merchant_id
          and url = v_offer_url
        limit 1;

        v_is_offer_new := v_offer_id is null;

        if v_is_offer_new then
          insert into public.offers (
            product_id,
            merchant_id,
            price,
            old_price,
            url,
            stock,
            is_active,
            is_featured
          )
          values (
            v_product_id,
            v_merchant_id,
            v_price,
            case when v_old_price is not null and v_old_price > 0 then v_old_price else null end,
            v_offer_url,
            v_stock,
            true,
            false
          )
          returning id into v_offer_id;

          v_created_count := v_created_count + 1;
        else
          update public.offers
          set
            price = v_price,
            old_price = case when v_old_price is not null and v_old_price > 0 then v_old_price else null end,
            url = v_offer_url,
            stock = v_stock,
            is_active = true,
            is_featured = false
          where id = v_offer_id;

          v_updated_count := v_updated_count + 1;
        end if;

        -- Optional image URL.
        if v_image_url <> '' then
          if v_image_url ~* '^https?://' then
            if not exists (
              select 1
              from public.product_images pi
              where pi.product_id = v_product_id and pi.url = v_image_url
            ) then
              select exists (
                select 1
                from public.product_images pi
                where pi.product_id = v_product_id and pi.is_primary = true
              ) into v_has_primary_image;

              insert into public.product_images (product_id, url, is_primary)
              values (v_product_id, v_image_url, not v_has_primary_image);
            end if;
          else
            v_warning_count := v_warning_count + 1;
          end if;
        end if;

      exception
        when others then
          v_error_count := v_error_count + 1;
          v_row_errors := v_row_errors || jsonb_build_array(
            jsonb_build_object(
              'rowIndex', v_index - 1,
              'message', coalesce(sqlerrm, 'Error desconocido al procesar la fila')
            )
          );
      end;
    end loop;

    v_batch_offset := v_batch_offset + v_batch_size;
  end loop;

  if v_error_count > 0 then
    raise exception using
      message = 'IMPORT_BATCH_FAILED',
      detail = v_row_errors::text;
  end if;

  if p_job_id is not null then
    insert into public.import_job_logs (job_id, level, message, payload)
    values (
      p_job_id,
      'info',
      'Bloques importados correctamente',
      jsonb_build_object('batchSize', v_batch_size, 'totalRows', v_total, 'warningCount', v_warning_count)
    );
  end if;

  return jsonb_build_object(
    'createdCount', v_created_count,
    'updatedCount', v_updated_count,
    'errorCount', v_error_count,
    'warningCount', v_warning_count,
    'totalRows', v_total,
    'batchSize', v_batch_size
  );
end;
$$;

grant execute on function public.import_products_batch(uuid, jsonb, integer) to authenticated;

grant select on public.admin_rate_limits, public.admin_rate_limit_events to authenticated;

grant insert, update, delete on public.admin_rate_limits, public.admin_rate_limit_events to authenticated;

commit;
