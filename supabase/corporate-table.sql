-- =====================================================================
-- B2B & Corporate Requests Table Migration for Straweyi Workshop Hub
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- =====================================================================

create table if not exists public.corporate_requests (
  id              uuid primary key default gen_random_uuid(),
  company_name    text not null,
  pic_name        text not null,
  email           text not null default '',
  phone           text not null,
  event_type      text not null,
  craft_category  text not null,
  participants    integer not null check (participants >= 5),
  location_type   text not null default '',
  location_city   text not null default '',
  target_date     text not null default '',
  addons          text[] not null default '{}',
  estimated_total integer not null default 0 check (estimated_total >= 0),
  cost_per_pax    integer not null default 0 check (cost_per_pax >= 0),
  notes           text not null default '',
  status          text not null check (status in ('new','contacted','quoted','deal','completed')) default 'new',
  created_at      timestamptz not null default now()
);

alter table public.corporate_requests enable row level security;

-- Public can submit corporate booking requests (insert only)
create policy "corporate_requests public insert" on public.corporate_requests
  for insert with check (true);

-- Admin can read and update all corporate requests
create policy "corporate_requests admin all" on public.corporate_requests
  for all using (public.is_admin()) with check (public.is_admin());
