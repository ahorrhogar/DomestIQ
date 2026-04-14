begin;

create or replace function public.get_home_click_signals(
  p_days integer default 120,
  p_limit integer default 5000
)
returns table(
  product_id uuid,
  clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.product_id,
    count(*)::bigint as clicks
  from public.clicks c
  where c.created_at >= now() - make_interval(days => greatest(p_days, 1))
  group by c.product_id
  order by clicks desc
  limit greatest(p_limit, 1);
$$;

grant execute on function public.get_home_click_signals(integer, integer) to anon, authenticated;

create or replace function public.get_home_favorite_signals(
  p_days integer default 365,
  p_limit integer default 5000
)
returns table(
  product_id uuid,
  favorites bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if to_regclass('public.product_favorites') is null then
    return;
  end if;

  return query execute format(
    'select f.product_id, count(*)::bigint as favorites
     from public.product_favorites f
     where f.created_at >= now() - make_interval(days => %s)
     group by f.product_id
     order by favorites desc
     limit %s',
    greatest(p_days, 1),
    greatest(p_limit, 1)
  );
end;
$$;

grant execute on function public.get_home_favorite_signals(integer, integer) to anon, authenticated;

commit;
