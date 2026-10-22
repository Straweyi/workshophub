-- =====================================================================
-- Auto-Purge Expired Workshops Migration for Straweyi Workshop Hub
-- Run this query once in: Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

-- 1. Create function to delete workshops whose date < current_date
-- Foreign key references (registrations, page_views) have ON DELETE CASCADE,
-- so all associated tickets and records are safely and cleanly purged as well.
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

-- 2. Allow API callers (visitors and admin) to trigger the cleanup
grant execute on function public.purge_expired_workshops() to anon, authenticated;

-- 3. Optional: If pg_cron extension is enabled in Supabase, you can schedule it daily at midnight UTC:
-- create extension if not exists pg_cron;
-- select cron.schedule('daily-purge-expired-workshops', '0 0 * * *', 'select public.purge_expired_workshops()');
