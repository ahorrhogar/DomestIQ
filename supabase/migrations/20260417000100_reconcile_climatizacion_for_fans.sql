begin;

create temporary table tmp_fan_slugs (
  slug text primary key
) on commit drop;

insert into tmp_fan_slugs (slug)
values
  ('orbegozo-sf-0147-ventilador-de-pie'),
  ('cecotec-energysilence-890-skyline'),
  ('amazon-basics-ventilador-pie-40cm-dc'),
  ('orbegozo-sf-0149-ventilador-de-pie'),
  ('dreo-quiet-standing-fan-upgraded'),
  ('dreo-nomad-one-20db'),
  ('cecotec-energysilence-5000-pro'),
  ('cecotec-energysilence-510'),
  ('cecotec-energysilence-1020-extremeconnected'),
  ('orbegozo-pw-1240-power-fan');

create temporary table tmp_expected_urls (
  url text primary key
) on commit drop;

insert into tmp_expected_urls (url)
values
  ('https://amzn.to/4mEnAS3'),
  ('https://amzn.to/4erjkmy'),
  ('https://amzn.to/4cngH2s'),
  ('https://amzn.to/4cPz3KW'),
  ('https://amzn.to/4sZQAoV'),
  ('https://amzn.to/484czU2'),
  ('https://amzn.to/4sCdodR'),
  ('https://amzn.to/4cV5SFt'),
  ('https://amzn.to/4vCEVie'),
  ('https://amzn.to/4myFl50');

do $$
declare
  v_target_category_id uuid;
  v_source_category_id uuid;
begin
  -- Prefer the category currently used by admin filters: top-level "Climatizacion/Climatizacion".
  select c.id
  into v_target_category_id
  from public.categories c
  where c.slug = 'climatizacin'
     or lower(c.name) = 'climatizacion'
  order by
    case when c.slug = 'climatizacin' then 0 else 1 end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_target_category_id is null then
    select c.id
    into v_target_category_id
    from public.categories c
    where c.slug = 'climatizacion'
      and c.parent_id is null
    order by c.updated_at desc nulls last, c.id
    limit 1;
  end if;

  if v_target_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Climatizacion', 'climatizacin', null, true, 0)
    returning id into v_target_category_id;
  else
    update public.categories c
    set is_active = true
    where c.id = v_target_category_id;
  end if;

  -- Source category created by fan ingestion migration.
  select c.id
  into v_source_category_id
  from public.categories c
  where c.slug = 'climatizacion'
    and lower(c.name) = 'climatizacion'
    and c.parent_id is not null
  order by c.updated_at desc nulls last, c.id
  limit 1;

  -- Move fan products into target category and ensure they remain active.
  update public.products p
  set
    category_id = v_target_category_id,
    is_active = true
  from tmp_fan_slugs s
  where p.slug = s.slug
    and p.category_id is distinct from v_target_category_id;

  update public.products p
  set is_active = true
  from tmp_fan_slugs s
  where p.slug = s.slug;

  -- Keep the expected short-link offers active for these products.
  update public.offers o
  set is_active = true
  from public.products p
  join tmp_fan_slugs s on s.slug = p.slug
  join tmp_expected_urls eu on true
  where o.product_id = p.id
    and o.url = eu.url;

  -- If the source category is now empty, remove it to avoid duplicate filter confusion.
  if v_source_category_id is not null and v_source_category_id <> v_target_category_id then
    if not exists (
      select 1
      from public.products p
      where p.category_id = v_source_category_id
    ) then
      delete from public.categories c
      where c.id = v_source_category_id;
    end if;
  end if;
end;
$$;

commit;