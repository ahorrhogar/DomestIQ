begin;

alter table public.offers
  add column if not exists source_type text not null default 'manual',
  add column if not exists update_mode text not null default 'manual',
  add column if not exists sync_status text not null default 'ok',
  add column if not exists current_price numeric(12, 2),
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_updated_by uuid references auth.users(id) on delete set null,
  add column if not exists last_sync_error text,
  add column if not exists next_check_at timestamptz,
  add column if not exists priority_score numeric(10, 2) not null default 0,
  add column if not exists freshness_score numeric(6, 2) not null default 100;

update public.offers
set
  current_price = coalesce(current_price, price),
  source_type = coalesce(nullif(source_type, ''), 'manual'),
  update_mode = coalesce(nullif(update_mode, ''), 'manual'),
  sync_status = coalesce(nullif(sync_status, ''), 'ok'),
  last_checked_at = coalesce(last_checked_at, updated_at, now()),
  next_check_at = coalesce(next_check_at, now() + interval '24 hours'),
  freshness_score = greatest(0, least(100, coalesce(freshness_score, 100))),
  priority_score = coalesce(priority_score, 0)
where true;

alter table public.offers
  alter column current_price set not null,
  alter column last_checked_at set not null;

create table if not exists public.offer_price_history (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  price numeric(12, 2) not null check (price > 0),
  old_price numeric(12, 2),
  source_type text not null default 'manual',
  update_mode text not null default 'manual',
  sync_status text not null default 'ok',
  changed_by uuid references auth.users(id) on delete set null,
  change_reason text,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.offer_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  run_after timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.offer_price_history enable row level security;
alter table public.offer_sync_jobs enable row level security;

create index if not exists idx_offers_source_type on public.offers(source_type);
create index if not exists idx_offers_update_mode on public.offers(update_mode);
create index if not exists idx_offers_sync_status on public.offers(sync_status);
create index if not exists idx_offers_next_check_at on public.offers(next_check_at asc);
create index if not exists idx_offers_priority_score on public.offers(priority_score desc);
create index if not exists idx_offers_last_checked_at on public.offers(last_checked_at desc);
create index if not exists idx_offer_price_history_offer_created on public.offer_price_history(offer_id, created_at desc);
create index if not exists idx_offer_price_history_product_created on public.offer_price_history(product_id, created_at desc);
create index if not exists idx_offer_sync_jobs_status_run_after on public.offer_sync_jobs(status, run_after asc);
create unique index if not exists idx_offer_sync_jobs_open_offer on public.offer_sync_jobs(offer_id) where status in ('pending', 'running');

-- Keep compatibility with existing consumers while exposing current_price explicitly.
create or replace function public.normalize_offer_sync_fields()
returns trigger
language plpgsql
as $$
begin
  if new.current_price is null and new.price is not null then
    new.current_price := new.price;
  end if;

  if new.price is null and new.current_price is not null then
    new.price := new.current_price;
  end if;

  if new.current_price is distinct from new.price then
    if tg_op = 'UPDATE' and old.current_price is distinct from new.current_price then
      new.price := new.current_price;
    else
      new.current_price := new.price;
    end if;
  end if;

  if tg_op = 'INSERT' then
    new.source_type := coalesce(new.source_type, 'manual');
    new.update_mode := coalesce(new.update_mode, 'manual');
    new.sync_status := coalesce(new.sync_status, 'ok');
    new.last_checked_at := coalesce(new.last_checked_at, now());
    new.next_check_at := coalesce(new.next_check_at, now() + interval '24 hours');
    new.freshness_score := coalesce(new.freshness_score, 100);
    new.priority_score := coalesce(new.priority_score, 0);
  else
    if new.current_price is distinct from old.current_price and (new.old_price is null or new.old_price = old.old_price) then
      new.old_price := old.current_price;
    end if;

    if new.last_checked_at is null then
      new.last_checked_at := old.last_checked_at;
    end if;

    if new.next_check_at is null then
      new.next_check_at := old.next_check_at;
    end if;

    if new.sync_status = 'stale' and new.last_checked_at is distinct from old.last_checked_at then
      new.sync_status := 'ok';
    end if;

    new.freshness_score := coalesce(new.freshness_score, old.freshness_score, 100);
    new.priority_score := coalesce(new.priority_score, old.priority_score, 0);
  end if;

  if new.last_updated_by is null then
    new.last_updated_by := auth.uid();
  end if;

  return new;
end;
$$;

create or replace function public.record_offer_price_history()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT'
     or new.current_price is distinct from old.current_price
     or new.old_price is distinct from old.old_price
     or new.sync_status is distinct from old.sync_status
     or new.last_checked_at is distinct from old.last_checked_at then
    insert into public.offer_price_history (
      offer_id,
      product_id,
      merchant_id,
      price,
      old_price,
      source_type,
      update_mode,
      sync_status,
      changed_by,
      checked_at,
      change_reason,
      metadata
    ) values (
      new.id,
      new.product_id,
      new.merchant_id,
      new.current_price,
      new.old_price,
      new.source_type,
      new.update_mode,
      new.sync_status,
      coalesce(new.last_updated_by, auth.uid()),
      coalesce(new.last_checked_at, now()),
      case
        when tg_op = 'INSERT' then 'offer_created'
        when new.current_price is distinct from old.current_price then 'price_changed'
        when new.sync_status is distinct from old.sync_status then 'status_changed'
        else 'offer_reviewed'
      end,
      jsonb_build_object(
        'stock', new.stock,
        'is_active', new.is_active,
        'is_featured', new.is_featured,
        'url', new.url
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_offers_normalize_sync_fields on public.offers;
create trigger trg_offers_normalize_sync_fields
before insert or update on public.offers
for each row execute function public.normalize_offer_sync_fields();

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

drop trigger if exists trg_offers_price_history on public.offers;
create trigger trg_offers_price_history
after insert or update on public.offers
for each row execute function public.record_offer_price_history();

create or replace function public.recalculate_offer_priority_scores(p_stale_hours integer default 72)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer := 0;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para recalcular prioridad de ofertas';
  end if;

  with click_rollup as (
    select
      o.id as offer_id,
      count(c.id)::numeric as click_count
    from public.offers o
    left join public.clicks c
      on c.product_id = o.product_id
      and c.merchant_id = o.merchant_id
      and c.created_at >= now() - interval '30 days'
    group by o.id
  ),
  merchant_rollup as (
    select
      merchant_id,
      count(*)::numeric as active_offer_count
    from public.offers
    where is_active = true
    group by merchant_id
  ),
  metrics as (
    select
      o.id,
      coalesce(cr.click_count, 0) as click_count,
      greatest(coalesce(p.search_count, 0), 0)::numeric as view_count,
      coalesce(mr.active_offer_count, 0) as merchant_weight,
      extract(epoch from (now() - coalesce(o.last_checked_at, o.updated_at, now()))) / 3600.0 as hours_since_check,
      o.sync_status,
      o.is_featured
    from public.offers o
    join public.products p on p.id = o.product_id
    left join click_rollup cr on cr.offer_id = o.id
    left join merchant_rollup mr on mr.merchant_id = o.merchant_id
  )
  update public.offers o
  set
    freshness_score = round(
      greatest(
        0,
        least(
          100,
          100 - ((m.hours_since_check / greatest(p_stale_hours, 1)::numeric) * 100)
        )
      ),
      2
    ),
    priority_score = round(
      (
        case when m.sync_status = 'stale' then 55 else 0 end
        + least(m.click_count * 3, 180)
        + least(m.view_count * 0.12, 90)
        + least(m.merchant_weight * 1.5, 35)
        + case when m.is_featured then 10 else 0 end
      ),
      2
    ),
    sync_status = case
      when o.sync_status = 'error' then 'error'
      when o.sync_status = 'pending' then 'pending'
      when coalesce(o.last_checked_at, o.updated_at, now()) < now() - make_interval(hours => greatest(p_stale_hours, 1)) then 'stale'
      else 'ok'
    end,
    next_check_at = case
      when coalesce(o.last_checked_at, o.updated_at, now()) < now() - make_interval(hours => greatest(p_stale_hours, 1)) then now()
      else coalesce(o.next_check_at, now() + interval '24 hours')
    end
  from metrics m
  where m.id = o.id;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create or replace function public.mark_offer_stale(p_offer_id uuid, p_reason text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean := false;
  v_rows integer := 0;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para marcar oferta stale';
  end if;

  update public.offers
  set
    sync_status = 'stale',
    freshness_score = least(freshness_score, 30),
    last_sync_error = coalesce(nullif(p_reason, ''), last_sync_error),
    next_check_at = now()
  where id = p_offer_id;

  get diagnostics v_rows = row_count;
  v_found := v_rows > 0;
  return v_found;
end;
$$;

create or replace function public.mark_offer_fresh(p_offer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean := false;
  v_rows integer := 0;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para marcar oferta fresh';
  end if;

  update public.offers
  set
    sync_status = 'ok',
    last_checked_at = now(),
    freshness_score = 100,
    last_sync_error = null,
    next_check_at = now() + interval '24 hours'
  where id = p_offer_id;

  get diagnostics v_rows = row_count;
  v_found := v_rows > 0;
  return v_found;
end;
$$;

create or replace function public.update_price_history_on_change(
  p_offer_id uuid,
  p_reason text default 'manual_review',
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer record;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para registrar historial de precio';
  end if;

  select *
  into v_offer
  from public.offers o
  where o.id = p_offer_id;

  if not found then
    return false;
  end if;

  insert into public.offer_price_history (
    offer_id,
    product_id,
    merchant_id,
    price,
    old_price,
    source_type,
    update_mode,
    sync_status,
    changed_by,
    checked_at,
    change_reason,
    metadata
  ) values (
    v_offer.id,
    v_offer.product_id,
    v_offer.merchant_id,
    v_offer.current_price,
    v_offer.old_price,
    v_offer.source_type,
    v_offer.update_mode,
    v_offer.sync_status,
    coalesce(v_offer.last_updated_by, auth.uid()),
    coalesce(v_offer.last_checked_at, now()),
    coalesce(nullif(p_reason, ''), 'manual_review'),
    coalesce(p_metadata, '{}'::jsonb)
  );

  return true;
end;
$$;

create or replace function public.sync_price_for_offer(p_offer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean := false;
  v_rows integer := 0;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para sincronizar oferta';
  end if;

  insert into public.offer_sync_jobs (offer_id, status, run_after, payload, created_by)
  values (p_offer_id, 'pending', now(), jsonb_build_object('trigger', 'manual_sync_request'), auth.uid())
  on conflict (offer_id) where status in ('pending', 'running')
  do update set
    run_after = excluded.run_after,
    payload = public.offer_sync_jobs.payload || excluded.payload,
    updated_at = now();

  update public.offers
  set
    sync_status = 'pending',
    next_check_at = now(),
    last_sync_error = null
  where id = p_offer_id;

  get diagnostics v_rows = row_count;
  v_found := v_rows > 0;
  return v_found;
end;
$$;

create or replace function public.sync_offers_batch(p_limit integer default 50)
returns table(offer_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado para sincronizar lote de ofertas';
  end if;

  return query
  with due as (
    select o.id
    from public.offers o
    where o.is_active = true
      and (
        o.next_check_at is null
        or o.next_check_at <= now()
        or o.sync_status in ('stale', 'error')
      )
    order by
      case when o.sync_status = 'stale' then 0 when o.sync_status = 'error' then 1 else 2 end,
      o.priority_score desc,
      o.updated_at asc
    limit greatest(p_limit, 1)
  ), enqueued as (
    insert into public.offer_sync_jobs (offer_id, status, run_after, payload, created_by)
    select
      d.id,
      'pending',
      now(),
      jsonb_build_object('trigger', 'batch_sync_request'),
      auth.uid()
    from due d
    on conflict (offer_id) where status in ('pending', 'running')
    do update set
      run_after = excluded.run_after,
      payload = public.offer_sync_jobs.payload || excluded.payload,
      updated_at = now()
    returning offer_id
  )
  update public.offers o
  set
    sync_status = 'pending',
    next_check_at = now()
  from enqueued e
  where e.offer_id = o.id
  returning o.id;
end;
$$;

create or replace function public.queue_offer_sync_jobs(p_limit integer default 50)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para encolar jobs de ofertas';
  end if;

  with due as (
    select o.id
    from public.offers o
    where o.is_active = true
      and (
        o.next_check_at is null
        or o.next_check_at <= now()
        or o.sync_status in ('stale', 'error')
      )
    order by
      case when o.sync_status = 'stale' then 0 when o.sync_status = 'error' then 1 else 2 end,
      o.priority_score desc,
      o.updated_at asc
    limit greatest(p_limit, 1)
  )
  insert into public.offer_sync_jobs (offer_id, status, run_after, payload, created_by)
  select d.id, 'pending', now(), jsonb_build_object('trigger', 'queue_only'), auth.uid()
  from due d
  on conflict (offer_id) where status in ('pending', 'running')
  do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Policies for new tables follow existing admin-only pattern.
drop policy if exists offer_price_history_admin_read on public.offer_price_history;
create policy offer_price_history_admin_read on public.offer_price_history
  for select using (public.is_admin());

drop policy if exists offer_price_history_admin_write on public.offer_price_history;
create policy offer_price_history_admin_write on public.offer_price_history
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists offer_sync_jobs_admin_read on public.offer_sync_jobs;
create policy offer_sync_jobs_admin_read on public.offer_sync_jobs
  for select using (public.is_admin());

drop policy if exists offer_sync_jobs_admin_write on public.offer_sync_jobs;
create policy offer_sync_jobs_admin_write on public.offer_sync_jobs
  for all using (public.is_admin()) with check (public.is_admin());

grant execute on function public.recalculate_offer_priority_scores(integer) to authenticated;
grant execute on function public.mark_offer_stale(uuid, text) to authenticated;
grant execute on function public.mark_offer_fresh(uuid) to authenticated;
grant execute on function public.update_price_history_on_change(uuid, text, jsonb) to authenticated;
grant execute on function public.sync_price_for_offer(uuid) to authenticated;
grant execute on function public.sync_offers_batch(integer) to authenticated;
grant execute on function public.queue_offer_sync_jobs(integer) to authenticated;

commit;
