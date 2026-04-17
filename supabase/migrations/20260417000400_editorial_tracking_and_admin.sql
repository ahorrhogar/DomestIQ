begin;

create table if not exists public.editorial_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  path text not null,
  title text not null,
  excerpt text not null,
  cover_image text,
  cover_image_alt text,
  cover_tone text not null default 'fresh' check (cover_tone in ('warm', 'fresh', 'calm', 'contrast')),
  category_slug text not null,
  category_name text not null,
  intent text not null check (intent in ('comparativa', 'calidad-precio', 'ahorro', 'premium', 'guia-practica')),
  tags text[] not null default '{}',
  read_minutes integer not null default 8 check (read_minutes > 0 and read_minutes <= 240),
  average_budget numeric(10, 2),
  related_category_slugs text[] not null default '{}',
  related_product_slugs text[] not null default '{}',
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'inactive')),
  is_featured boolean not null default false,
  views_count integer not null default 0,
  sections jsonb not null default '[]'::jsonb,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editorial_articles_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint editorial_articles_title_not_empty check (char_length(trim(title)) > 0),
  constraint editorial_articles_excerpt_not_empty check (char_length(trim(excerpt)) > 0)
);

create unique index if not exists idx_editorial_articles_slug_unique on public.editorial_articles(lower(slug));
create unique index if not exists idx_editorial_articles_path_unique on public.editorial_articles(lower(path));
create index if not exists idx_editorial_articles_status_published on public.editorial_articles(status, published_at desc);
create index if not exists idx_editorial_articles_featured on public.editorial_articles(is_featured, published_at desc);
create index if not exists idx_editorial_articles_updated_at on public.editorial_articles(updated_at desc);

create table if not exists public.article_view_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.editorial_articles(id) on delete cascade,
  article_slug text not null,
  session_id text not null,
  path text,
  referrer text,
  ip_address text not null default 'unknown',
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_article_view_events_article_created_at
  on public.article_view_events(article_id, created_at desc);
create index if not exists idx_article_view_events_session_article_created_at
  on public.article_view_events(session_id, article_id, created_at desc);
create index if not exists idx_article_view_events_created_at
  on public.article_view_events(created_at desc);

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  term text not null,
  normalized_term text not null,
  result_count integer not null default 0,
  top_product_id uuid references public.products(id) on delete set null,
  path text,
  ip_address text not null default 'unknown',
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_events_term_created_at
  on public.search_events(normalized_term, created_at desc);
create index if not exists idx_search_events_session_term_created_at
  on public.search_events(session_id, normalized_term, created_at desc);
create index if not exists idx_search_events_created_at
  on public.search_events(created_at desc);

alter table public.editorial_articles enable row level security;
alter table public.article_view_events enable row level security;
alter table public.search_events enable row level security;

drop trigger if exists trg_editorial_articles_updated_at on public.editorial_articles;
create trigger trg_editorial_articles_updated_at
before update on public.editorial_articles
for each row execute function public.set_updated_at();

drop policy if exists editorial_articles_public_read on public.editorial_articles;
create policy editorial_articles_public_read on public.editorial_articles
  for select
  using (status = 'published');

drop policy if exists editorial_articles_admin_read on public.editorial_articles;
create policy editorial_articles_admin_read on public.editorial_articles
  for select
  using ((select public.is_admin()));

drop policy if exists editorial_articles_admin_write on public.editorial_articles;
create policy editorial_articles_admin_write on public.editorial_articles
  for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists article_view_events_admin_read on public.article_view_events;
create policy article_view_events_admin_read on public.article_view_events
  for select
  using ((select public.is_admin()));

drop policy if exists article_view_events_admin_write on public.article_view_events;
create policy article_view_events_admin_write on public.article_view_events
  for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists search_events_admin_read on public.search_events;
create policy search_events_admin_read on public.search_events
  for select
  using ((select public.is_admin()));

drop policy if exists search_events_admin_write on public.search_events;
create policy search_events_admin_write on public.search_events
  for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.normalize_search_term(p_term text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(trim(coalesce(p_term, ''))), '\\s+', ' ', 'g');
$$;

create or replace function public.track_search_term_secure(
  p_term text,
  p_session_id text default null,
  p_result_count integer default 0,
  p_top_product_id uuid default null,
  p_path text default null,
  p_ip_override text default null,
  p_user_agent_override text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_term text := left(coalesce(nullif(trim(p_term), ''), ''), 160);
  v_normalized_term text;
  v_result_count integer := greatest(coalesce(p_result_count, 0), 0);
  v_ip text := left(coalesce(nullif(trim(p_ip_override), ''), public.get_request_ip(), 'unknown'), 120);
  v_user_agent text := left(coalesce(nullif(trim(p_user_agent_override), ''), public.get_request_user_agent(), ''), 255);
  v_session_id text := left(coalesce(nullif(trim(p_session_id), ''), 'anon:' || v_ip), 120);
  v_is_bot_like boolean := false;
  v_duplicate_exists boolean := false;
  v_top_product_exists boolean := false;
begin
  if v_term = '' then
    return jsonb_build_object('accepted', false, 'reason', 'invalid_term');
  end if;

  v_normalized_term := public.normalize_search_term(v_term);

  if char_length(v_normalized_term) < 2 then
    return jsonb_build_object('accepted', false, 'reason', 'term_too_short');
  end if;

  v_is_bot_like := v_user_agent = ''
    or v_user_agent ~* '(bot|crawler|spider|curl|wget|python-requests|httpclient|scrapy|headless|phantom|selenium)';

  if v_is_bot_like then
    return jsonb_build_object('accepted', false, 'reason', 'blocked_user_agent');
  end if;

  select exists(
    select 1
    from public.search_events se
    where se.session_id = v_session_id
      and se.normalized_term = v_normalized_term
      and se.created_at >= v_now - interval '90 seconds'
  )
  into v_duplicate_exists;

  if v_duplicate_exists then
    return jsonb_build_object('accepted', false, 'reason', 'duplicate_search');
  end if;

  if p_top_product_id is not null then
    select exists(select 1 from public.products p where p.id = p_top_product_id)
    into v_top_product_exists;
  end if;

  insert into public.search_events (
    session_id,
    term,
    normalized_term,
    result_count,
    top_product_id,
    path,
    ip_address,
    user_agent
  )
  values (
    v_session_id,
    v_term,
    v_normalized_term,
    v_result_count,
    case when v_top_product_exists then p_top_product_id else null end,
    case when p_path is null then null else left(trim(p_path), 250) end,
    v_ip,
    nullif(v_user_agent, '')
  );

  insert into public.search_terms (
    term,
    normalized_term,
    product_id,
    count
  )
  values (
    v_term,
    v_normalized_term,
    case when v_top_product_exists then p_top_product_id else null end,
    1
  )
  on conflict (normalized_term)
  do update set
    term = excluded.term,
    product_id = case
      when excluded.product_id is not null then excluded.product_id
      else public.search_terms.product_id
    end,
    count = public.search_terms.count + 1,
    updated_at = now();

  if v_top_product_exists then
    update public.products
    set
      search_count = greatest(coalesce(search_count, 0), 0) + 1,
      updated_at = now()
    where id = p_top_product_id;
  end if;

  return jsonb_build_object('accepted', true, 'reason', 'accepted');
exception
  when others then
    return jsonb_build_object('accepted', false, 'reason', 'tracking_error');
end;
$$;

create or replace function public.track_article_view_secure(
  p_article_slug text,
  p_session_id text default null,
  p_path text default null,
  p_referrer text default null,
  p_ip_override text default null,
  p_user_agent_override text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_slug text := left(coalesce(nullif(trim(p_article_slug), ''), ''), 120);
  v_ip text := left(coalesce(nullif(trim(p_ip_override), ''), public.get_request_ip(), 'unknown'), 120);
  v_user_agent text := left(coalesce(nullif(trim(p_user_agent_override), ''), public.get_request_user_agent(), ''), 255);
  v_session_id text := left(coalesce(nullif(trim(p_session_id), ''), 'anon:' || v_ip), 120);
  v_article_id uuid;
  v_duplicate_exists boolean := false;
  v_is_bot_like boolean := false;
begin
  if v_slug = '' then
    return jsonb_build_object('accepted', false, 'reason', 'invalid_slug');
  end if;

  v_is_bot_like := v_user_agent = ''
    or v_user_agent ~* '(bot|crawler|spider|curl|wget|python-requests|httpclient|scrapy|headless|phantom|selenium)';

  if v_is_bot_like then
    return jsonb_build_object('accepted', false, 'reason', 'blocked_user_agent');
  end if;

  select ea.id
  into v_article_id
  from public.editorial_articles ea
  where lower(ea.slug) = lower(v_slug)
    and ea.status = 'published'
  limit 1;

  if v_article_id is null then
    return jsonb_build_object('accepted', false, 'reason', 'article_not_found');
  end if;

  select exists(
    select 1
    from public.article_view_events ave
    where ave.article_id = v_article_id
      and ave.session_id = v_session_id
      and ave.created_at >= v_now - interval '30 minutes'
  )
  into v_duplicate_exists;

  if v_duplicate_exists then
    return jsonb_build_object('accepted', false, 'reason', 'duplicate_view');
  end if;

  insert into public.article_view_events (
    article_id,
    article_slug,
    session_id,
    path,
    referrer,
    ip_address,
    user_agent
  )
  values (
    v_article_id,
    v_slug,
    v_session_id,
    case when p_path is null then null else left(trim(p_path), 250) end,
    case when p_referrer is null then null else left(trim(p_referrer), 500) end,
    v_ip,
    nullif(v_user_agent, '')
  );

  update public.editorial_articles
  set
    views_count = greatest(coalesce(views_count, 0), 0) + 1,
    updated_at = now()
  where id = v_article_id;

  return jsonb_build_object('accepted', true, 'reason', 'accepted', 'articleId', v_article_id);
exception
  when others then
    return jsonb_build_object('accepted', false, 'reason', 'tracking_error');
end;
$$;

create or replace function public.get_admin_editorial_snapshot(
  p_days integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(p_days, 1);
  v_total_articles bigint := 0;
  v_published_articles bigint := 0;
  v_draft_articles bigint := 0;
  v_inactive_articles bigint := 0;
  v_featured_articles bigint := 0;
  v_views_last_window bigint := 0;
  v_unique_sessions_last_window bigint := 0;
  v_searches_leading_to_blog_views bigint := 0;

  v_top_viewed_articles jsonb := '[]'::jsonb;
  v_daily_article_views jsonb := '[]'::jsonb;
  v_top_blog_search_terms jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para consultar analitica editorial';
  end if;

  select count(*)::bigint into v_total_articles from public.editorial_articles;
  select count(*)::bigint into v_published_articles from public.editorial_articles where status = 'published';
  select count(*)::bigint into v_draft_articles from public.editorial_articles where status = 'draft';
  select count(*)::bigint into v_inactive_articles from public.editorial_articles where status = 'inactive';
  select count(*)::bigint into v_featured_articles from public.editorial_articles where is_featured = true and status = 'published';

  select count(*)::bigint
  into v_views_last_window
  from public.article_view_events ave
  where ave.created_at >= now() - make_interval(days => least(v_days, 365));

  select count(distinct ave.session_id)::bigint
  into v_unique_sessions_last_window
  from public.article_view_events ave
  where ave.created_at >= now() - make_interval(days => least(v_days, 365));

  select count(distinct se.id)::bigint
  into v_searches_leading_to_blog_views
  from public.search_events se
  where se.created_at >= now() - make_interval(days => least(v_days, 365))
    and exists (
      select 1
      from public.article_view_events ave
      where ave.session_id = se.session_id
        and ave.created_at >= se.created_at
        and ave.created_at <= se.created_at + interval '2 hours'
    );

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'articleId', t.article_id,
        'slug', t.slug,
        'title', t.title,
        'views', t.views
      )
      order by t.views desc
    ),
    '[]'::jsonb
  )
  into v_top_viewed_articles
  from (
    select
      ave.article_id,
      ea.slug,
      ea.title,
      count(*)::bigint as views
    from public.article_view_events ave
    join public.editorial_articles ea on ea.id = ave.article_id
    where ave.created_at >= now() - make_interval(days => least(v_days, 365))
    group by ave.article_id, ea.slug, ea.title
    order by views desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'day', to_char(t.day, 'YYYY-MM-DD'),
        'views', t.views
      )
      order by t.day asc
    ),
    '[]'::jsonb
  )
  into v_daily_article_views
  from (
    select
      date_trunc('day', ave.created_at)::date as day,
      count(*)::bigint as views
    from public.article_view_events ave
    where ave.created_at >= now() - make_interval(days => least(v_days, 365))
    group by date_trunc('day', ave.created_at)::date
    order by day desc
    limit 30
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'term', t.term,
        'count', t.count
      )
      order by t.count desc
    ),
    '[]'::jsonb
  )
  into v_top_blog_search_terms
  from (
    select
      se.term,
      count(*)::bigint as count
    from public.search_events se
    where se.created_at >= now() - make_interval(days => least(v_days, 365))
      and exists (
        select 1
        from public.article_view_events ave
        where ave.session_id = se.session_id
          and ave.created_at >= se.created_at
          and ave.created_at <= se.created_at + interval '2 hours'
      )
    group by se.term
    order by count desc
    limit 10
  ) t;

  return jsonb_build_object(
    'totalArticles', v_total_articles,
    'publishedArticles', v_published_articles,
    'draftArticles', v_draft_articles,
    'inactiveArticles', v_inactive_articles,
    'featuredArticles', v_featured_articles,
    'viewsLastWindow', v_views_last_window,
    'uniqueSessionsLastWindow', v_unique_sessions_last_window,
    'searchesLeadingToBlogViews', v_searches_leading_to_blog_views,
    'topViewedArticles', v_top_viewed_articles,
    'dailyArticleViews', v_daily_article_views,
    'topBlogSearchTerms', v_top_blog_search_terms
  );
end;
$$;

grant execute on function public.track_search_term_secure(text, text, integer, uuid, text, text, text) to anon, authenticated;
grant execute on function public.track_article_view_secure(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_admin_editorial_snapshot(integer) to authenticated;

grant select on public.editorial_articles to anon, authenticated;
grant insert, update, delete on public.editorial_articles to authenticated;
grant select on public.article_view_events, public.search_events to authenticated;

insert into public.editorial_articles (
  slug,
  path,
  title,
  excerpt,
  cover_image,
  cover_image_alt,
  cover_tone,
  category_slug,
  category_name,
  intent,
  tags,
  read_minutes,
  average_budget,
  related_category_slugs,
  related_product_slugs,
  published_at,
  status,
  is_featured,
  views_count,
  sections
)
values
  (
    'los-7-mejores-ventiladores-amazon-calor-verano-2026',
    '/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026',
    'Los 7 mejores ventiladores de Amazon para sobrevivir al calor este verano (2026)',
    'Comparativa real de 7 ventiladores de Amazon con estrellas, valoraciones, precio visto y recomendacion editorial para decidir rapido.',
    'https://m.media-amazon.com/images/I/71G7qy9UDpL._AC_SX522_.jpg',
    'Ventilador de torre Dreo para verano',
    'fresh',
    'electrodomesticos',
    'Electrodomesticos',
    'comparativa',
    array['ventilador', 'amazon', 'verano', 'comparativa', 'calor'],
    12,
    54,
    array['electrodomesticos', 'hogar'],
    array['orbegozo-sf-0149-ventilador-de-pie'],
    '2026-04-17T16:00:00.000Z'::timestamptz,
    'published',
    true,
    920,
    jsonb_build_array(
      jsonb_build_object('heading', 'Como se ha construido este top 7', 'body', 'La comparativa cruza valoraciones, rango de precio y utilidad real por tipo de espacio: dormitorio, salon o zona de trabajo.'),
      jsonb_build_object('heading', 'Que mirar antes de comprar', 'body', 'Define si priorizas silencio o potencia, y despues revisa formato, velocidades y condiciones de compra para minimizar riesgo.'),
      jsonb_build_object('heading', 'Resumen editorial', 'body', 'Para presupuesto ajustado destacan Orbegozo y Cecotec basicos. Para confort nocturno y ajuste fino, Dreo se posiciona mejor.')
    )
  ),
  (
    'mejores-ventiladores-de-pie-para-este-verano-2026',
    '/blog/mejores-ventiladores-de-pie-para-este-verano-2026',
    'Los mejores ventiladores de pie para este verano: top 10 de 2026',
    'Comparativa de 10 ventiladores con precio visible, rating, valoraciones y recomendacion editorial para comprar mejor en verano.',
    'https://m.media-amazon.com/images/I/71G7qy9UDpL._AC_SY550_.jpg',
    'Ventilador de pie de torre para verano',
    'fresh',
    'electrodomesticos',
    'Electrodomesticos',
    'comparativa',
    array['ventilador de pie', 'ventilador torre', 'amazon', 'verano', 'guia de compra'],
    16,
    52,
    array['electrodomesticos', 'hogar'],
    array['set-ollas-wmf-premium'],
    '2026-04-19T09:00:00.000Z'::timestamptz,
    'published',
    true,
    1980,
    jsonb_build_array(
      jsonb_build_object('heading', 'Como se ha construido este top 10', 'body', 'La seleccion cruza precio visible, volumen de valoraciones, nota media y utilidad real por tipo de estancia.'),
      jsonb_build_object('heading', 'Que mirar antes de decidir', 'body', 'Define primero si priorizas silencio o potencia y valida tipo, velocidades y politica de devolucion.'),
      jsonb_build_object('heading', 'Resumen editorial', 'body', 'En presupuesto bajo, Orbegozo funciona bien; para control fino y confort nocturno, los modelos DC de Dreo destacan.')
    )
  ),
  (
    'mejores-sofas-calidad-precio-2026',
    '/blog/mejores-sofas-calidad-precio-2026',
    'Los 10 mejores sofas calidad precio de 2026',
    'Ranking de sofas calidad precio para 2026 con foco en medidas, formato, utilidad real y coste total antes de comprar.',
    'https://m.media-amazon.com/images/I/61MNGyTX5FL._AC_SX425_.jpg',
    'Sofa moderno de salon',
    'calm',
    'salon',
    'Salon',
    'calidad-precio',
    array['sofa', 'amazon', 'calidad precio', 'guia de compra'],
    14,
    260,
    array['salon', 'muebles'],
    array['set-ollas-wmf-premium'],
    '2026-04-17T09:00:00.000Z'::timestamptz,
    'published',
    true,
    2450,
    jsonb_build_array(
      jsonb_build_object('heading', 'Como se ha construido este top 10', 'body', 'La comparativa combina precio visible, formato de uso y encaje por tamano de salon.'),
      jsonb_build_object('heading', 'Que mirar antes de decidir', 'body', 'Mide hueco real, revisa funcion cama y valida coste de envio y devolucion.'),
      jsonb_build_object('heading', 'Resumen editorial', 'body', 'Para piso pequeno convienen modelos compactos; para uso mixto, los convertibles suelen aportar mas valor.')
    )
  ),
  (
    'mejores-freidoras-aire-amazon-2026-menos-100-euros',
    '/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros',
    'Las 5 mejores freidoras de aire por menos de 100 EUR en 2026',
    'Comparativa directa para elegir freidora de aire por menos de 100 EUR segun capacidad, potencia, valoraciones y coste real.',
    'https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX425_.jpg',
    'Freidora de aire en cocina moderna',
    'warm',
    'cocina',
    'Cocina',
    'ahorro',
    array['freidora de aire', 'amazon', 'menos de 100 eur', 'comparativa'],
    11,
    72,
    array['cocina', 'electrodomesticos'],
    array['set-ollas-wmf-premium'],
    '2026-04-18T09:00:00.000Z'::timestamptz,
    'published',
    true,
    5820,
    jsonb_build_array(
      jsonb_build_object('heading', 'Que mirar antes de comprar', 'body', 'Capacidad real, potencia sostenida y limpieza pesan mas que el numero de programas.'),
      jsonb_build_object('heading', 'Modelos recomendados', 'body', 'La seleccion combina opciones de entrada y modelos de mayor capacidad dentro del mismo techo de precio.'),
      jsonb_build_object('heading', 'Conclusiones rapidas', 'body', 'Elegir capacidad correcta evita recocinar por tandas y reduce tiempo total de preparacion.')
    )
  )
on conflict do nothing;

commit;
