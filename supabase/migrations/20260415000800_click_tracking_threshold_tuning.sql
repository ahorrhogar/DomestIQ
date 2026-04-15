begin;

create or replace function public.track_click_secure(
  p_product_id uuid,
  p_merchant_id uuid,
  p_offer_id uuid default null,
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
  v_ip text := left(coalesce(nullif(trim(p_ip_override), ''), public.get_request_ip(), 'unknown'), 120);
  v_user_agent text := left(coalesce(nullif(trim(p_user_agent_override), ''), public.get_request_user_agent(), ''), 255);

  v_window interval := interval '1 minute';
  v_dedupe_window interval := interval '30 seconds';
  v_max_requests integer := 30;
  v_block_window interval := interval '1 minute';

  v_rate_row public.click_tracking_rate_limits%rowtype;
  v_product_exists boolean := false;
  v_merchant_exists boolean := false;
  v_offer_valid boolean := false;
  v_is_bot_like boolean := false;
  v_duplicate_exists boolean := false;
begin
  if p_product_id is null or p_merchant_id is null then
    perform public.log_click_tracking_event(
      p_reason => 'invalid_payload',
      p_ip_address => v_ip,
      p_product_id => p_product_id,
      p_merchant_id => p_merchant_id,
      p_offer_id => p_offer_id,
      p_user_agent => v_user_agent,
      p_metadata => jsonb_build_object('detail', 'missing_identifiers')
    );

    return jsonb_build_object('accepted', false, 'reason', 'invalid_payload');
  end if;

  v_is_bot_like := v_user_agent = ''
    or v_user_agent ~* '(bot|crawler|spider|curl|wget|python-requests|httpclient|scrapy|headless|phantom|selenium)';

  if v_is_bot_like then
    perform public.log_click_tracking_event(
      p_reason => 'blocked_user_agent',
      p_ip_address => v_ip,
      p_product_id => p_product_id,
      p_merchant_id => p_merchant_id,
      p_offer_id => p_offer_id,
      p_user_agent => v_user_agent,
      p_metadata => jsonb_build_object('mode', 'basic_bot_filter')
    );

    return jsonb_build_object('accepted', false, 'reason', 'blocked_user_agent');
  end if;

  select exists(select 1 from public.products p where p.id = p_product_id)
  into v_product_exists;

  select exists(select 1 from public.merchants m where m.id = p_merchant_id)
  into v_merchant_exists;

  if not v_product_exists or not v_merchant_exists then
    perform public.log_click_tracking_event(
      p_reason => 'invalid_reference',
      p_ip_address => v_ip,
      p_product_id => p_product_id,
      p_merchant_id => p_merchant_id,
      p_offer_id => p_offer_id,
      p_user_agent => v_user_agent,
      p_metadata => jsonb_build_object(
        'productExists', v_product_exists,
        'merchantExists', v_merchant_exists
      )
    );

    return jsonb_build_object('accepted', false, 'reason', 'invalid_reference');
  end if;

  if p_offer_id is not null then
    select exists(
      select 1
      from public.offers o
      where o.id = p_offer_id
        and o.product_id = p_product_id
        and o.merchant_id = p_merchant_id
    )
    into v_offer_valid;

    if not v_offer_valid then
      perform public.log_click_tracking_event(
        p_reason => 'invalid_offer',
        p_ip_address => v_ip,
        p_product_id => p_product_id,
        p_merchant_id => p_merchant_id,
        p_offer_id => p_offer_id,
        p_user_agent => v_user_agent,
        p_metadata => jsonb_build_object('detail', 'offer_product_merchant_mismatch')
      );

      return jsonb_build_object('accepted', false, 'reason', 'invalid_offer');
    end if;
  end if;

  select *
  into v_rate_row
  from public.click_tracking_rate_limits
  where ip_address = v_ip
  for update;

  if not found then
    insert into public.click_tracking_rate_limits (
      ip_address,
      window_started_at,
      request_count,
      blocked_until,
      last_request_at
    )
    values (v_ip, v_now, 1, null, v_now)
    returning * into v_rate_row;
  else
    if v_rate_row.blocked_until is not null and v_rate_row.blocked_until > v_now then
      perform public.log_click_tracking_event(
        p_reason => 'rate_limited',
        p_ip_address => v_ip,
        p_product_id => p_product_id,
        p_merchant_id => p_merchant_id,
        p_offer_id => p_offer_id,
        p_user_agent => v_user_agent,
        p_metadata => jsonb_build_object(
          'blockedUntil', v_rate_row.blocked_until,
          'requestCount', v_rate_row.request_count,
          'maxRequests', v_max_requests,
          'windowSeconds', 60
        )
      );

      return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
    end if;

    if v_rate_row.window_started_at + v_window <= v_now then
      update public.click_tracking_rate_limits
      set
        window_started_at = v_now,
        request_count = 1,
        blocked_until = null,
        last_request_at = v_now
      where ip_address = v_ip
      returning * into v_rate_row;
    else
      update public.click_tracking_rate_limits
      set
        request_count = v_rate_row.request_count + 1,
        last_request_at = v_now
      where ip_address = v_ip
      returning * into v_rate_row;

      if v_rate_row.request_count > v_max_requests then
        update public.click_tracking_rate_limits
        set blocked_until = v_now + v_block_window
        where ip_address = v_ip
        returning * into v_rate_row;

        perform public.log_click_tracking_event(
          p_reason => 'rate_limited',
          p_ip_address => v_ip,
          p_product_id => p_product_id,
          p_merchant_id => p_merchant_id,
          p_offer_id => p_offer_id,
          p_user_agent => v_user_agent,
          p_metadata => jsonb_build_object(
            'blockedUntil', v_rate_row.blocked_until,
            'requestCount', v_rate_row.request_count,
            'maxRequests', v_max_requests,
            'windowSeconds', 60
          )
        );

        return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
      end if;
    end if;
  end if;

  select exists(
    select 1
    from public.clicks c
    where c.product_id = p_product_id
      and c.merchant_id = p_merchant_id
      and c.ip_address = v_ip
      and c.created_at >= v_now - v_dedupe_window
  )
  into v_duplicate_exists;

  if v_duplicate_exists then
    perform public.log_click_tracking_event(
      p_reason => 'duplicate_click',
      p_ip_address => v_ip,
      p_product_id => p_product_id,
      p_merchant_id => p_merchant_id,
      p_offer_id => p_offer_id,
      p_user_agent => v_user_agent,
      p_metadata => jsonb_build_object('dedupeWindowSeconds', 30)
    );

    return jsonb_build_object('accepted', false, 'reason', 'duplicate_click');
  end if;

  insert into public.clicks (
    product_id,
    merchant_id,
    offer_id,
    ip_address,
    user_agent
  )
  values (
    p_product_id,
    p_merchant_id,
    p_offer_id,
    v_ip,
    nullif(v_user_agent, '')
  );

  return jsonb_build_object('accepted', true, 'reason', 'accepted');
exception
  when others then
    perform public.log_click_tracking_event(
      p_reason => 'tracking_error',
      p_ip_address => coalesce(v_ip, 'unknown'),
      p_product_id => p_product_id,
      p_merchant_id => p_merchant_id,
      p_offer_id => p_offer_id,
      p_user_agent => coalesce(v_user_agent, ''),
      p_metadata => jsonb_build_object('error', left(sqlerrm, 200))
    );

    return jsonb_build_object('accepted', false, 'reason', 'tracking_error');
end;
$$;

grant execute on function public.track_click_secure(uuid, uuid, uuid, text, text) to anon, authenticated;

commit;
