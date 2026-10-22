-- =====================================================================
-- Email support. Run once in Supabase SQL Editor (after schema.sql).
-- Then create a Database Webhook (see supabase/README-email.md).
-- =====================================================================

alter table public.mail_log add column if not exists code text;
alter table public.mail_log add column if not exists sent_at timestamptz;
alter table public.mail_log add column if not exists error text;

-- Same as before, but also stores the booking code so the email can link to the ticket.
create or replace function public.create_registration(
  p_workshop_id uuid, p_name text, p_email text, p_phone text, p_tickets integer, p_source text
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.workshops;
  taken integer;
  is_waitlist boolean;
  reg public.registrations;
begin
  if p_tickets is null or p_tickets < 1 or p_tickets > 20 then raise exception 'invalid tickets'; end if;
  if coalesce(trim(p_name), '') = '' or position('@' in coalesce(p_email, '')) = 0 then raise exception 'invalid contact'; end if;

  select * into w from public.workshops where id = p_workshop_id and published for update;
  if not found then raise exception 'workshop not found'; end if;

  select coalesce(sum(tickets), 0) into taken
  from public.registrations
  where workshop_id = w.id and status in ('paid','pending','offered');

  is_waitlist := (w.capacity - taken) < p_tickets;

  insert into public.registrations (code, workshop_id, name, email, phone, tickets, total, status, source)
  values (
    'SW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    w.id, trim(p_name), lower(trim(p_email)), coalesce(trim(p_phone), ''), p_tickets,
    case when is_waitlist then 0 else p_tickets * w.price end,
    case when is_waitlist then 'waitlist' when w.price = 0 then 'paid' else 'pending' end,
    left(coalesce(nullif(trim(lower(p_source)), ''), 'direct'), 60)
  )
  returning * into reg;

  insert into public.mail_log (to_email, subject, code) values (
    reg.email,
    case when is_waitlist then 'You''re on the waitlist for ' || w.title
         else 'Booking confirmed: ' || w.title || ' (' || reg.code || ')' end,
    reg.code
  );

  return reg;
end;
$$;
