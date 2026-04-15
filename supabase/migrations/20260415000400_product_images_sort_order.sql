begin;

alter table public.product_images
  add column if not exists sort_order integer not null default 0;

with ordered_images as (
  select
    id,
    row_number() over (
      partition by product_id
      order by is_primary desc, id asc
    ) - 1 as next_sort_order
  from public.product_images
)
update public.product_images as pi
set sort_order = ordered_images.next_sort_order
from ordered_images
where ordered_images.id = pi.id;

create index if not exists idx_product_images_product_sort
  on public.product_images(product_id, sort_order, id);

commit;
