begin;

-- Keep RPC argument name aligned with client call: { user_id: <uuid> }.
create or replace function public.is_admin(user_id text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return public.is_admin(user_id::uuid);
exception
  when others then
    return false;
end;
$$;

grant execute on function public.is_admin(text) to anon, authenticated;

commit;
