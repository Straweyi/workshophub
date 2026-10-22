-- =====================================================================
-- Straweyi Workshop Hub - QR Check-In Database Function
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- =====================================================================

create or replace function public.check_in_ticket(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.registrations;
  w public.workshops;
begin
  select * into r from public.registrations
  where lower(code) = lower(trim(p_code))
  limit 1;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into w from public.workshops where id = r.workshop_id;

  if r.status <> 'paid' then
    return jsonb_build_object(
      'status', 'unpaid',
      'name', r.name,
      'tickets', r.tickets,
      'code', r.code,
      'total', r.total,
      'workshop_title', coalesce(w.title, '')
    );
  end if;

  if r.checked_in then
    return jsonb_build_object(
      'status', 'already',
      'name', r.name,
      'tickets', r.tickets,
      'code', r.code,
      'total', r.total,
      'workshop_title', coalesce(w.title, '')
    );
  end if;

  update public.registrations set checked_in = true where id = r.id;

  return jsonb_build_object(
    'status', 'ok',
    'name', r.name,
    'tickets', r.tickets,
    'code', r.code,
    'total', r.total,
    'workshop_title', coalesce(w.title, '')
  );
end;
$$;

grant execute on function public.check_in_ticket(text) to anon, authenticated;
