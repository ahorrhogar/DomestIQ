begin;

create temporary table tmp_terrace_table_slugs (
  slug text primary key
) on commit drop;

insert into tmp_terrace_table_slugs (slug)
values
  ('casaria-mesa-plegable-acacia-46x46'),
  ('ipae-saturnia-redonda-90cm'),
  ('casaria-mesa-auxiliar-acacia-45x45'),
  ('devoko-mesa-extensible-aluminio-80x80-160'),
  ('keter-quartet-95'),
  ('yoevu-mesa-plegable-180cm'),
  ('casaria-mesa-plegable-acacia-160x85'),
  ('hollyhome-mesa-auxiliar-redonda-metal'),
  ('phi-villa-mesa-plegable-cristal'),
  ('casaria-set-terraza-mesa-4-sillas');

create temporary table tmp_terrace_expected_urls (
  url text primary key
) on commit drop;

insert into tmp_terrace_expected_urls (url)
values
  ('https://amzn.to/3Oo5BT9'),
  ('https://amzn.to/3Qs29r5'),
  ('https://amzn.to/4tVWAQd'),
  ('https://amzn.to/4dQppc9'),
  ('https://amzn.to/4tdA3OQ'),
  ('https://amzn.to/4vH9d3q'),
  ('https://amzn.to/4chjjjN'),
  ('https://amzn.to/3QgdvP6'),
  ('https://amzn.to/42eiNx3'),
  ('https://amzn.to/4tl9qYs');

do $$
declare
  v_target_parent_id uuid;
  v_target_subcategory_id uuid;
begin
  -- Canonical parent: prefer existing category with exact accent in the name.
  select c.id
  into v_target_parent_id
  from public.categories c
  where c.parent_id is null
    and c.name = 'Jardín y Exterior'
  order by c.updated_at desc nulls last, c.id
  limit 1;

  if v_target_parent_id is null then
    select c.id
    into v_target_parent_id
    from public.categories c
    where c.parent_id is null
      and (
        c.slug in ('jardin-y-exterior', 'jardin-exterior', 'jardin')
        or translate(lower(c.name), 'áéíóú', 'aeiou') in ('jardin y exterior', 'jardin exterior', 'jardin')
      )
    order by
      case
        when c.slug = 'jardin-y-exterior' then 0
        when c.slug = 'jardin-exterior' then 1
        when translate(lower(c.name), 'áéíóú', 'aeiou') = 'jardin y exterior' then 2
        when c.slug = 'jardin' then 3
        else 4
      end,
      c.updated_at desc nulls last,
      c.id
    limit 1;
  end if;

  if v_target_parent_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Jardín y Exterior', 'jardin-y-exterior', null, true, 40)
    returning id into v_target_parent_id;
  else
    update public.categories c
    set
      name = 'Jardín y Exterior',
      slug = coalesce(nullif(c.slug, ''), 'jardin-y-exterior'),
      is_active = true
    where c.id = v_target_parent_id;
  end if;

  -- Canonical subcategory under the canonical parent.
  select c.id
  into v_target_subcategory_id
  from public.categories c
  where c.parent_id = v_target_parent_id
    and (
      c.slug = 'mesas-de-exterior'
      or translate(lower(c.name), 'áéíóú', 'aeiou') in ('mesas de exterior', 'mesas exterior')
    )
  order by
    case
      when c.slug = 'mesas-de-exterior' then 0
      when translate(lower(c.name), 'áéíóú', 'aeiou') = 'mesas de exterior' then 1
      else 2
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_target_subcategory_id is null then
    -- Reuse an existing mesas category from duplicate parents if possible.
    select c.id
    into v_target_subcategory_id
    from public.categories c
    where c.parent_id in (
      select cp.id
      from public.categories cp
      where cp.parent_id is null
        and (
          cp.id = v_target_parent_id
          or cp.slug in ('jardin-y-exterior', 'jardin-exterior', 'jardin')
          or translate(lower(cp.name), 'áéíóú', 'aeiou') in ('jardin y exterior', 'jardin exterior', 'jardin')
        )
    )
      and (
        c.slug = 'mesas-de-exterior'
        or translate(lower(c.name), 'áéíóú', 'aeiou') in ('mesas de exterior', 'mesas exterior')
      )
    order by
      case when c.parent_id = v_target_parent_id then 0 else 1 end,
      c.updated_at desc nulls last,
      c.id
    limit 1;

    if v_target_subcategory_id is null then
      insert into public.categories (name, slug, parent_id, is_active, sort_order)
      values ('Mesas de Exterior', 'mesas-de-exterior', v_target_parent_id, true, 20)
      returning id into v_target_subcategory_id;
    else
      update public.categories c
      set
        name = 'Mesas de Exterior',
        slug = coalesce(nullif(c.slug, ''), 'mesas-de-exterior'),
        parent_id = v_target_parent_id,
        is_active = true
      where c.id = v_target_subcategory_id;
    end if;
  else
    update public.categories c
    set
      name = 'Mesas de Exterior',
      slug = coalesce(nullif(c.slug, ''), 'mesas-de-exterior'),
      is_active = true
    where c.id = v_target_subcategory_id;
  end if;

  -- Force all terrace-table products into canonical subcategory.
  update public.products p
  set
    category_id = v_target_subcategory_id,
    is_active = true
  from tmp_terrace_table_slugs s
  where p.slug = s.slug
    and p.category_id is distinct from v_target_subcategory_id;

  update public.products p
  set is_active = true
  from tmp_terrace_table_slugs s
  where p.slug = s.slug;

  -- Keep expected offers active for this catalog block.
  update public.offers o
  set is_active = true
  from public.products p
  join tmp_terrace_table_slugs s on s.slug = p.slug
  join tmp_terrace_expected_urls eu on true
  where o.product_id = p.id
    and o.url = eu.url;

  -- Deactivate duplicate parent categories once terrace products are moved out.
  update public.categories c
  set is_active = false
  where c.parent_id is null
    and c.id <> v_target_parent_id
    and (
      c.slug in ('jardin-y-exterior', 'jardin-exterior', 'jardin')
      or translate(lower(c.name), 'áéíóú', 'aeiou') in ('jardin y exterior', 'jardin exterior', 'jardin')
    )
    and not exists (
      select 1
      from public.products p
      join public.categories sub on sub.id = p.category_id
      where sub.parent_id = c.id
    );
end;
$$;

commit;
