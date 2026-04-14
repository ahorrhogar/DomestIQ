begin;

create or replace function public.get_admin_analytics_snapshot(
  p_days integer default 30,
  p_stale_offer_days integer default 14
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(p_days, 1);
  v_stale_offer_days integer := greatest(p_stale_offer_days, 1);

  v_clicks_last_30 bigint := 0;
  v_searches_without_results bigint := 0;
  v_failed_import_jobs bigint := 0;
  v_products_without_active_offers bigint := 0;
  v_stale_active_offers bigint := 0;
  v_stale_sources integer := 0;

  v_last_click_at timestamptz;
  v_last_search_at timestamptz;
  v_last_import_at timestamptz;
  v_last_sync_at timestamptz;
  v_stale boolean := false;

  v_favorites_total bigint := null;
  v_favorite_table text;

  v_top_clicked_products jsonb := '[]'::jsonb;
  v_top_clicked_merchants jsonb := '[]'::jsonb;
  v_top_offer_pairs jsonb := '[]'::jsonb;
  v_top_viewed_products jsonb := '[]'::jsonb;
  v_top_searched_products jsonb := '[]'::jsonb;
  v_top_categories_by_clicks jsonb := '[]'::jsonb;
  v_top_categories_by_performance jsonb := '[]'::jsonb;
  v_no_result_search_terms jsonb := '[]'::jsonb;
  v_high_clicks_low_views jsonb := '[]'::jsonb;
  v_high_views_low_clicks jsonb := '[]'::jsonb;
  v_under_featured_top_performers jsonb := '[]'::jsonb;
  v_featured_top_performers jsonb := '[]'::jsonb;
  v_recent_admin_actions jsonb := '[]'::jsonb;
  v_daily_clicks jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para consultar analitica admin';
  end if;

  select count(*)::bigint
  into v_clicks_last_30
  from public.clicks c
  where c.created_at >= now() - make_interval(days => least(v_days, 365));

  select coalesce(sum(st.count), 0)::bigint
  into v_searches_without_results
  from public.search_terms st
  where st.product_id is null;

  select count(*)::bigint
  into v_failed_import_jobs
  from public.import_jobs ij
  where ij.status = 'failed';

  select count(*)::bigint
  into v_products_without_active_offers
  from public.products p
  where p.is_active = true
    and not exists (
      select 1
      from public.offers o
      where o.product_id = p.id
        and o.is_active = true
    );

  select count(*)::bigint
  into v_stale_active_offers
  from public.offers o
  where o.is_active = true
    and o.updated_at < now() - make_interval(days => v_stale_offer_days);

  select max(c.created_at)
  into v_last_click_at
  from public.clicks c;

  select max(st.updated_at)
  into v_last_search_at
  from public.search_terms st;

  select max(ij.updated_at)
  into v_last_import_at
  from public.import_jobs ij;

  select max(ss.updated_at)
  into v_last_sync_at
  from public.sync_status ss;

  select count(*)::integer
  into v_stale_sources
  from public.sync_status ss
  where ss.status in ('warning', 'error');

  v_stale := (
    (v_last_sync_at is not null and v_last_sync_at < now() - interval '24 hours')
    or v_stale_sources > 0
  );

  for v_favorite_table in
    select unnest(array['product_favorites', 'favorites', 'user_favorites', 'wishlists'])
  loop
    if to_regclass('public.' || v_favorite_table) is not null then
      execute format('select count(*)::bigint from public.%I', v_favorite_table)
      into v_favorites_total;
      exit;
    end if;
  end loop;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'productId', t.product_id,
        'productName', t.product_name,
        'clicks', t.clicks
      )
      order by t.clicks desc
    ),
    '[]'::jsonb
  )
  into v_top_clicked_products
  from (
    select
      c.product_id,
      coalesce(p.name, 'Producto') as product_name,
      count(*)::bigint as clicks
    from public.clicks c
    left join public.products p on p.id = c.product_id
    group by c.product_id, p.name
    order by clicks desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'merchantId', t.merchant_id,
        'merchantName', t.merchant_name,
        'clicks', t.clicks
      )
      order by t.clicks desc
    ),
    '[]'::jsonb
  )
  into v_top_clicked_merchants
  from (
    select
      c.merchant_id,
      coalesce(m.name, 'Tienda') as merchant_name,
      count(*)::bigint as clicks
    from public.clicks c
    left join public.merchants m on m.id = c.merchant_id
    group by c.merchant_id, m.name
    order by clicks desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'productId', t.product_id,
        'productName', t.product_name,
        'merchantId', t.merchant_id,
        'merchantName', t.merchant_name,
        'clicks', t.clicks
      )
      order by t.clicks desc
    ),
    '[]'::jsonb
  )
  into v_top_offer_pairs
  from (
    select
      c.product_id,
      coalesce(p.name, 'Producto') as product_name,
      c.merchant_id,
      coalesce(m.name, 'Tienda') as merchant_name,
      count(*)::bigint as clicks
    from public.clicks c
    left join public.products p on p.id = c.product_id
    left join public.merchants m on m.id = c.merchant_id
    group by c.product_id, p.name, c.merchant_id, m.name
    order by clicks desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'productId', t.id,
        'productName', t.name,
        'views', t.views
      )
      order by t.views desc
    ),
    '[]'::jsonb
  )
  into v_top_viewed_products
  from (
    select
      p.id,
      coalesce(p.name, 'Producto') as name,
      greatest(coalesce(p.search_count, 0), 0)::bigint as views
    from public.products p
    order by views desc, p.updated_at desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'productId', t.id,
        'productName', t.name,
        'searchCount', t.search_count
      )
      order by t.search_count desc
    ),
    '[]'::jsonb
  )
  into v_top_searched_products
  from (
    select
      p.id,
      coalesce(p.name, 'Producto') as name,
      greatest(coalesce(p.search_count, 0), 0)::bigint as search_count
    from public.products p
    order by search_count desc, p.updated_at desc
    limit 10
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'categoryId', t.category_id,
        'categoryName', t.category_name,
        'clicks', t.clicks
      )
      order by t.clicks desc
    ),
    '[]'::jsonb
  )
  into v_top_categories_by_clicks
  from (
    select
      p.category_id,
      coalesce(ca.name, 'Categoria') as category_name,
      count(*)::bigint as clicks
    from public.clicks cl
    join public.products p on p.id = cl.product_id
    left join public.categories ca on ca.id = p.category_id
    group by p.category_id, ca.name
    order by clicks desc
    limit 10
  ) t;

  with click_totals as (
    select cl.product_id, count(*)::bigint as clicks
    from public.clicks cl
    group by cl.product_id
  ),
  category_rollup as (
    select
      p.category_id,
      coalesce(ca.name, 'Categoria') as category_name,
      sum(coalesce(ct.clicks, 0))::bigint as clicks,
      sum(greatest(coalesce(p.search_count, 0), 0))::bigint as views
    from public.products p
    left join click_totals ct on ct.product_id = p.id
    left join public.categories ca on ca.id = p.category_id
    group by p.category_id, ca.name
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'categoryId', r.category_id,
        'categoryName', r.category_name,
        'clicks', r.clicks,
        'views', r.views,
        'ctr', case when r.views > 0 then round((r.clicks::numeric / r.views::numeric), 4) else 0 end
      )
      order by r.clicks desc
    ),
    '[]'::jsonb
  )
  into v_top_categories_by_performance
  from (
    select *
    from category_rollup
    order by clicks desc
    limit 10
  ) r;

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
  into v_no_result_search_terms
  from (
    select
      st.term,
      st.count
    from public.search_terms st
    where st.product_id is null
    order by st.count desc, st.updated_at desc
    limit 10
  ) t;

  with click_totals as (
    select cl.product_id, count(*)::bigint as clicks
    from public.clicks cl
    group by cl.product_id
  ),
  base_products as (
    select
      p.id as product_id,
      coalesce(p.name, 'Producto') as product_name,
      coalesce(ct.clicks, 0)::bigint as clicks,
      greatest(coalesce(p.search_count, 0), 0)::bigint as views,
      (
        lower(coalesce(p.attributes ->> 'featured', p.specs ->> 'featured', 'false')) in ('true', '1', 'yes', 'si', 'on')
      ) as is_featured,
      (
        lower(coalesce(p.attributes ->> 'teamRecommended', p.specs ->> 'teamRecommended', 'false')) in ('true', '1', 'yes', 'si', 'on')
      ) as is_team_recommended
    from public.products p
    left join click_totals ct on ct.product_id = p.id
    where p.is_active = true
  )
  select
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'productId', s.product_id,
            'productName', s.product_name,
            'clicks', s.clicks,
            'views', s.views
          )
          order by s.clicks desc
        )
        from (
          select *
          from base_products
          where clicks >= 20 and views <= 5
          order by clicks desc
          limit 10
        ) s
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'productId', s.product_id,
            'productName', s.product_name,
            'clicks', s.clicks,
            'views', s.views
          )
          order by s.views desc
        )
        from (
          select *
          from base_products
          where views >= 20 and clicks <= greatest(1, floor((views::numeric * 0.05))::bigint)
          order by views desc
          limit 10
        ) s
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'productId', s.product_id,
            'productName', s.product_name,
            'clicks', s.clicks,
            'views', s.views
          )
          order by s.clicks desc
        )
        from (
          select *
          from base_products
          where clicks >= 10 and not (is_featured or is_team_recommended)
          order by clicks desc, views desc
          limit 10
        ) s
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'productId', s.product_id,
            'productName', s.product_name,
            'clicks', s.clicks,
            'views', s.views
          )
          order by s.clicks desc
        )
        from (
          select *
          from base_products
          where is_featured or is_team_recommended
          order by clicks desc, views desc
          limit 10
        ) s
      ),
      '[]'::jsonb
    )
  into
    v_high_clicks_low_views,
    v_high_views_low_clicks,
    v_under_featured_top_performers,
    v_featured_top_performers;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'userId', t.user_id,
        'action', t.action,
        'entityType', t.entity_type,
        'entityId', t.entity_id,
        'createdAt', t.created_at
      )
      order by t.created_at desc
    ),
    '[]'::jsonb
  )
  into v_recent_admin_actions
  from (
    select
      aa.id,
      aa.user_id,
      aa.action,
      aa.entity_type,
      aa.entity_id,
      aa.created_at
    from public.admin_actions aa
    order by aa.created_at desc
    limit 15
  ) t;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'day', to_char(t.day, 'YYYY-MM-DD'),
        'clicks', t.clicks
      )
      order by t.day asc
    ),
    '[]'::jsonb
  )
  into v_daily_clicks
  from (
    select
      date_trunc('day', c.created_at)::date as day,
      count(*)::bigint as clicks
    from public.clicks c
    where c.created_at >= now() - make_interval(days => least(v_days, 365))
    group by date_trunc('day', c.created_at)::date
    order by day desc
    limit 30
  ) t;

  return jsonb_build_object(
    'clicksLast30Days', v_clicks_last_30,
    'topClickedProducts', v_top_clicked_products,
    'topClickedMerchants', v_top_clicked_merchants,
    'topOfferPairs', v_top_offer_pairs,
    'topViewedProducts', v_top_viewed_products,
    'topSearchedProducts', v_top_searched_products,
    'topCategoriesByClicks', v_top_categories_by_clicks,
    'topCategoriesByPerformance', v_top_categories_by_performance,
    'noResultSearchTerms', v_no_result_search_terms,
    'searchesWithoutResults', v_searches_without_results,
    'failedImportJobs', v_failed_import_jobs,
    'productsWithoutActiveOffers', v_products_without_active_offers,
    'staleActiveOffers', v_stale_active_offers,
    'highClicksLowViews', v_high_clicks_low_views,
    'highViewsLowClicks', v_high_views_low_clicks,
    'underFeaturedTopPerformers', v_under_featured_top_performers,
    'featuredTopPerformers', v_featured_top_performers,
    'favoritesTotal', v_favorites_total,
    'recentAdminActions', v_recent_admin_actions,
    'freshness', jsonb_build_object(
      'lastClickAt', v_last_click_at,
      'lastSearchAt', v_last_search_at,
      'lastImportAt', v_last_import_at,
      'lastSyncAt', v_last_sync_at,
      'stale', v_stale,
      'staleSources', v_stale_sources
    ),
    'dailyClicks', v_daily_clicks
  );
end;
$$;

grant execute on function public.get_admin_analytics_snapshot(integer, integer) to authenticated;

commit;
