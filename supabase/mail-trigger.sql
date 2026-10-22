-- Alternative to Dashboard "Database Webhooks": call the send-mail Edge Function
-- from a trigger on public.mail_log (INSERT) using pg_net.
-- Run in Supabase SQL Editor. Replace GANTI_WEBHOOK_SECRET with your WEBHOOK_SECRET value
-- (do NOT commit the real secret to Git).

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_send_mail()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := 'https://fyjsmytlvozoakujwmea.supabase.co/functions/v1/send-mail',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'GANTI_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists mail_log_send on public.mail_log;
create trigger mail_log_send
after insert on public.mail_log
for each row execute function public.notify_send_mail();
