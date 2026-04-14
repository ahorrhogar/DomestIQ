begin;

create or replace function public.normalize_domain(p_value text)
returns text
language sql
immutable
as $$
  select
    trim(
      both '.' from
      lower(
        regexp_replace(
          split_part(split_part(regexp_replace(coalesce(p_value, ''), '^https?://', '', 'i'), '/', 1), ':', 1),
          '^www\.',
          '',
          'i'
        )
      )
    );
$$;

create or replace function public.extract_url_hostname(p_url text)
returns text
language sql
immutable
as $$
  select public.normalize_domain(
    split_part(split_part(regexp_replace(coalesce(p_url, ''), '^https?://', '', 'i'), '/', 1), '@', array_length(string_to_array(split_part(regexp_replace(coalesce(p_url, ''), '^https?://', '', 'i'), '/', 1), '@'), 1))
  );
$$;

create or replace function public.is_public_hostname(p_host text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_host text := public.normalize_domain(p_host);
  v_ip inet;
begin
  if v_host = '' then
    return false;
  end if;

  if v_host in ('localhost', '127.0.0.1', '0.0.0.0', '::1') then
    return false;
  end if;

  if v_host like '%.local' or v_host like '%.internal' or v_host like '%.localhost' then
    return false;
  end if;

  if v_host ~ '^[0-9]{1,3}(\.[0-9]{1,3}){3}$' then
    begin
      v_ip := v_host::inet;
    exception
      when others then
        return false;
    end;

    if v_ip << '10.0.0.0/8'::cidr
      or v_ip << '127.0.0.0/8'::cidr
      or v_ip << '169.254.0.0/16'::cidr
      or v_ip << '172.16.0.0/12'::cidr
      or v_ip << '192.168.0.0/16'::cidr
      or v_ip << '0.0.0.0/8'::cidr
    then
      return false;
    end if;

    return true;
  end if;

  if v_host !~ '^[a-z0-9.-]+$' then
    return false;
  end if;

  if position('.' in v_host) = 0 then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.domain_matches_or_is_subdomain(p_host text, p_domain text)
returns boolean
language sql
immutable
as $$
  select
    case
      when public.normalize_domain(p_host) = '' or public.normalize_domain(p_domain) = '' then false
      when public.normalize_domain(p_host) = public.normalize_domain(p_domain) then true
      else public.normalize_domain(p_host) like ('%.' || public.normalize_domain(p_domain))
    end;
$$;

create or replace function public.validate_offer_affiliate_url()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_host text;
  v_host_port text;
  v_port text;
  v_merchant_domain text;
begin
  v_url := trim(coalesce(new.url, ''));

  if v_url = '' then
    raise exception 'La URL de la oferta es obligatoria';
  end if;

  if length(v_url) > 2048 then
    raise exception 'La URL de la oferta supera el limite permitido';
  end if;

  if v_url !~* '^https://[^\s]+$' then
    raise exception 'La URL de la oferta debe usar HTTPS';
  end if;

  if v_url ~* '^https://[^/]*@' then
    raise exception 'La URL de la oferta no puede incluir credenciales';
  end if;

  v_host_port := split_part(regexp_replace(v_url, '^https://', '', 'i'), '/', 1);
  v_host := public.normalize_domain(split_part(v_host_port, ':', 1));
  v_port := nullif(split_part(v_host_port, ':', 2), '');

  if v_port is not null and v_port <> '' and v_port <> '443' then
    raise exception 'La URL de la oferta usa un puerto no permitido';
  end if;

  if not public.is_public_hostname(v_host) then
    raise exception 'La URL de la oferta apunta a un host no permitido';
  end if;

  select public.normalize_domain(m.domain)
  into v_merchant_domain
  from public.merchants m
  where m.id = new.merchant_id
  for update;

  if not found then
    raise exception 'No existe la tienda asociada a la oferta';
  end if;

  if coalesce(v_merchant_domain, '') = '' then
    update public.merchants
    set domain = v_host
    where id = new.merchant_id
      and (domain is null or btrim(domain) = '');

    v_merchant_domain := v_host;
  end if;

  if not public.domain_matches_or_is_subdomain(v_host, v_merchant_domain) then
    raise exception 'La URL de la oferta no coincide con el dominio permitido de la tienda';
  end if;

  new.url := v_url;
  return new;
end;
$$;

drop trigger if exists trg_offers_validate_affiliate_url on public.offers;
create trigger trg_offers_validate_affiliate_url
before insert or update of url, merchant_id on public.offers
for each row execute function public.validate_offer_affiliate_url();

with merchant_offer_domain as (
  select
    o.merchant_id,
    min(public.extract_url_hostname(o.url)) as inferred_domain
  from public.offers o
  where o.url ~* '^https://'
  group by o.merchant_id
)
update public.merchants m
set domain = mod.inferred_domain
from merchant_offer_domain mod
where m.id = mod.merchant_id
  and (m.domain is null or btrim(m.domain) = '')
  and mod.inferred_domain is not null
  and mod.inferred_domain <> '';

commit;
