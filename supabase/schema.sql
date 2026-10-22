-- =====================================================================
-- Straweyi Workshop Hub - database schema (Supabase / PostgreSQL)
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- BEFORE running, replace GANTI_DENGAN_EMAIL_ADMIN below with your admin email.
-- =====================================================================

-- ---------- 1. Admin allow-list ----------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- no policies on purpose: nobody can read/write it via the API (only is_admin() below uses it)

insert into public.admins (email) values (lower('lintangas21@gmail.com'))
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- 2. Tables ----------
create table if not exists public.workshops (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  category    text not null check (category in ('Crochet','Knitting','Amigurumi','Macrame')),
  level       text not null check (level in ('Beginner','Intermediate','Advanced')),
  date        date not null,
  time        text not null,
  duration    text not null default '',
  location    text not null,
  city        text not null,
  price       integer not null check (price >= 0),
  capacity    integer not null check (capacity > 0),
  image       text not null default '',
  summary     text not null default '',
  description text not null default '',
  includes    text[] not null default '{}',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  phone       text not null default '',
  tickets     integer not null check (tickets between 1 and 20),
  total       integer not null default 0 check (total >= 0),
  status      text not null check (status in ('pending','paid','waitlist','offered','cancelled')),
  source      text not null default 'direct',
  checked_in  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists registrations_workshop_idx on public.registrations (workshop_id);

create table if not exists public.follows (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) between 3 and 200),
  category   text not null check (category in ('All','Crochet','Knitting','Amigurumi','Macrame')),
  created_at timestamptz not null default now(),
  unique (email, category)
);

create table if not exists public.page_views (
  id          bigserial primary key,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  source      text not null default 'direct',
  created_at  timestamptz not null default now()
);

create table if not exists public.mail_log (
  id         uuid primary key default gen_random_uuid(),
  to_email   text not null,
  subject    text not null,
  created_at timestamptz not null default now()
);

-- ---------- 3. Row Level Security ----------
alter table public.workshops     enable row level security;
alter table public.registrations enable row level security;
alter table public.follows       enable row level security;
alter table public.page_views    enable row level security;
alter table public.mail_log      enable row level security;

-- workshops: public reads published ones; admin does everything
create policy "workshops public read"  on public.workshops for select using (published or public.is_admin());
create policy "workshops admin insert" on public.workshops for insert with check (public.is_admin());
create policy "workshops admin update" on public.workshops for update using (public.is_admin()) with check (public.is_admin());
create policy "workshops admin delete" on public.workshops for delete using (public.is_admin());

-- registrations: contain personal data -> admin only (public uses RPCs below)
create policy "registrations admin all" on public.registrations for all using (public.is_admin()) with check (public.is_admin());

-- follows: anyone may subscribe (insert only); only admin can read/delete
create policy "follows public insert" on public.follows for insert with check (true);
create policy "follows admin read"    on public.follows for select using (public.is_admin());
create policy "follows admin delete"  on public.follows for delete using (public.is_admin());

-- page views: anyone may log a view (insert only); only admin can read
create policy "views public insert" on public.page_views for insert with check (true);
create policy "views admin read"    on public.page_views for select using (public.is_admin());

-- mail log: admin only
create policy "mail admin all" on public.mail_log for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 4. Public RPCs (safe, server-side logic) ----------

-- Seats taken per published workshop (no personal data exposed)
create or replace function public.workshop_seats()
returns table (workshop_id uuid, taken integer, waitlist integer)
language sql
stable
security definer
set search_path = public
as $$
  select w.id,
         coalesce(sum(r.tickets) filter (where r.status in ('paid','pending','offered')), 0)::int,
         coalesce(count(*)       filter (where r.status = 'waitlist'), 0)::int
  from public.workshops w
  left join public.registrations r on r.workshop_id = w.id
  where w.published
  group by w.id;
$$;

-- Create a booking. Price, status and capacity are decided on the server.
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

  select * into w from public.workshops where id = p_workshop_id and published for update;  -- lock row: prevents overbooking
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

  insert into public.mail_log (to_email, subject) values (
    reg.email,
    case when is_waitlist then 'You''re on the waitlist for ' || w.title
         else 'Booking confirmed: ' || w.title || ' (' || reg.code || ')' end
  );

  return reg;
end;
$$;

-- Look up ONE booking by its code (for the ticket page). Cannot list others.
create or replace function public.get_registration(p_code text)
returns public.registrations
language sql
stable
security definer
set search_path = public
as $$
  select * from public.registrations where lower(code) = lower(trim(p_code)) limit 1;
$$;

-- Check in a ticket securely by code (atomic, safe from race conditions)
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

create or replace function public.purge_expired_workshops()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.workshops
  where date < current_date;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.workshop_seats()                               to anon, authenticated;
grant execute on function public.create_registration(uuid,text,text,text,integer,text) to anon, authenticated;
grant execute on function public.get_registration(text)                         to anon, authenticated;
grant execute on function public.check_in_ticket(text)                          to anon, authenticated;
grant execute on function public.purge_expired_workshops()                     to anon, authenticated;
revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to anon, authenticated;

-- ---------- 5. Seed workshops (same as the demo data) ----------
insert into public.workshops (slug, title, category, level, date, time, duration, location, city, price, capacity, image, summary, description, includes) values
('make-your-own-crochet-bag','Make Your Own Crochet Bag','Crochet','Beginner','2026-11-07','10:00 – 14:00','4 hours','Kafe Bumi, Dago','Bandung',175000,16,'/img/crochet-bag.jpg','Learn the basic stitches and walk home with your very own striped tote.','No experience needed. In four relaxed hours you will learn the foundation chain, single crochet and how to shape a sturdy tote. Our instructors guide you stitch by stitch while you sip something warm.', array['All cotton yarn & hooks','Pattern card to keep','Drink & light snack','Finished tote bag']),
('amigurumi-bunny-and-bear','Amigurumi: Bunny & Bear','Amigurumi','Intermediate','2026-11-14','13:00 – 17:00','4 hours','Studio Straweyi','Bandung',225000,12,'/img/amigurumi.jpg','Crochet a tiny friend from scratch, from magic ring to stitched-on smile.','Magic ring, increases and decreases, stuffing and assembly. Choose bunny or bear and personalise it with a scarf or bow.', array['Yarn, safety eyes & stuffing','Step-by-step pattern','Tea & cookies']),
('knit-your-first-scarf','Knit Your First Scarf','Knitting','Beginner','2026-11-21','10:00 – 13:00','3 hours','Ruang Kolektif','Jakarta',150000,14,'/img/knitting.jpg','Cast on, knit, purl and bind off in a friendly café session.','A slow, social introduction to knitting. You will start a soft scarf and leave knowing everything needed to finish it at home.', array['Needles & merino blend yarn','Tutorial booklet','Coffee or tea']),
('macrame-wall-hanging','Macramé Wall Hanging','Macrame','Beginner','2026-11-28','14:00 – 17:00','3 hours','Kafe Bumi, Dago','Bandung',195000,10,'/img/macrame.jpg','Tie square knots and spirals into a boho wall piece for your home.','Learn five foundational macramé knots and combine them into a hanging with fringe. Perfect for gifting or decorating your space.', array['Cotton rope & wooden dowel','Knot guide','Snacks']),
('advanced-granny-square-cardigan','Granny Square Cardigan Lab','Crochet','Advanced','2026-12-05','10:00 – 16:00','6 hours','Studio Straweyi','Bandung',350000,8,'/img/crochet-bag.jpg','Join motifs, size your pattern and start a wearable cardigan.','For crocheters comfortable with granny squares. We cover colour planning, joining techniques and customizing size.', array['Premium yarn bundle','Pattern workbook','Lunch']),
('cozy-knit-hat-evening','Cozy Knit Hat Evening','Knitting','Intermediate','2026-12-12','18:30 – 21:30','3 hours','Ruang Kolektif','Jakarta',165000,12,'/img/knitting.jpg','An after-work evening knitting in the round.','Learn circular needles, decreasing for the crown and adding a pom-pom.', array['Circular needles & yarn','Pom-pom maker','Dinner snacks'])
on conflict (slug) do nothing;
