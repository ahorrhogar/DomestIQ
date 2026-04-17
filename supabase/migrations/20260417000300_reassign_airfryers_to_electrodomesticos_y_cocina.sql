begin;

create temporary table tmp_airfryer_slugs (
  slug text primary key
) on commit drop;

insert into tmp_airfryer_slugs (slug)
values
  ('cecofry-fantastik-window-4000'),
  ('cecofry-supreme-8000'),
  ('cecofry-full-inoxblack-5500-pro'),
  ('cosori-air-fryer-real-metallic-interior-57l'),
  ('cecofry-grill-duoheat-6500-plus');

do $$
declare
  v_target_parent_id uuid;
  v_target_category_id uuid;
  v_previous_category_id uuid;
begin
  select c.id
  into v_target_parent_id
  from public.categories c
  where c.parent_id is null
    and (
      c.slug in ('electrodomsticos-y-cocina', 'electrodomesticos-y-cocina')
      or lower(c.name) in ('electrodomésticos y cocina', 'electrodomesticos y cocina')
    )
  order by
    case
      when c.slug = 'electrodomsticos-y-cocina' then 0
      when c.slug = 'electrodomesticos-y-cocina' then 1
      else 2
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_target_parent_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos y Cocina', 'electrodomesticos-y-cocina', null, true, 0)
    returning id into v_target_parent_id;
  else
    update public.categories c
    set is_active = true
    where c.id = v_target_parent_id;
  end if;

  select c.id
  into v_target_category_id
  from public.categories c
  where c.parent_id = v_target_parent_id
    and (
      c.slug in ('electrodomsticos-pequeos', 'electrodomesticos-pequenos', 'pequenos-electrodomesticos')
      or lower(c.name) in (
        'electrodomésticos pequeños',
        'electrodomesticos pequeños',
        'electrodomesticos pequenos',
        'pequeños electrodomésticos',
        'pequenos electrodomesticos'
      )
    )
  order by
    case
      when c.slug = 'electrodomsticos-pequeos' then 0
      when c.slug = 'electrodomesticos-pequenos' then 1
      when c.slug = 'pequenos-electrodomesticos' then 2
      else 3
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_target_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos Pequenos', 'electrodomesticos-pequenos', v_target_parent_id, true, 10)
    returning id into v_target_category_id;
  else
    update public.categories c
    set
      parent_id = v_target_parent_id,
      is_active = true
    where c.id = v_target_category_id;
  end if;

  select c.id
  into v_previous_category_id
  from public.categories c
  where c.slug = 'electrodomesticos-pequenos'
    and c.parent_id <> v_target_parent_id
  order by c.updated_at desc nulls last, c.id
  limit 1;

  update public.products p
  set
    category_id = v_target_category_id,
    is_active = true
  from tmp_airfryer_slugs s
  where p.slug = s.slug
    and p.category_id is distinct from v_target_category_id;

  update public.products p
  set is_active = true
  from tmp_airfryer_slugs s
  where p.slug = s.slug;

  if v_previous_category_id is not null and v_previous_category_id <> v_target_category_id then
    if not exists (
      select 1
      from public.products p
      where p.category_id = v_previous_category_id
    ) then
      delete from public.categories c
      where c.id = v_previous_category_id;
    end if;
  end if;
end;
$$;

commit;