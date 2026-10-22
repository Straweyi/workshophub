# Setup email (Resend + Supabase)

1. **Akun Resend**: daftar di https://resend.com → API Keys → *Create API Key* (salin `re_...`).
   - Tanpa domain sendiri, pakai `MAIL_FROM="Straweyi <onboarding@resend.dev>"`. Mode ini **hanya bisa kirim ke email akun Resend Anda** (untuk testing).
   - Untuk kirim ke semua orang: Resend → Domains → Add Domain, lalu isi DNS. Setelah itu `MAIL_FROM="Straweyi <hello@domainanda.com>"`.
2. **SQL**: jalankan `supabase/email.sql` di Supabase SQL Editor.
3. **Deploy function** (butuh Supabase CLI):
   ```
   npx supabase login
   npx supabase link --project-ref fyjsmytlvozoakujwmea
   npx supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="Straweyi <onboarding@resend.dev>" SITE_URL=https://domain-anda WEBHOOK_SECRET=isi-string-acak
   npx supabase functions deploy send-mail --no-verify-jwt
   ```
4. **Database Webhook**: Dashboard → Database → Webhooks → Create:
   - Table `mail_log`, event **Insert**, type *Supabase Edge Functions* → `send-mail`
   - HTTP header tambahan: `x-webhook-secret` = nilai `WEBHOOK_SECRET` tadi.
5. Tes: buat booking di situs, lalu cek tabel `mail_log` (kolom `sent_at` terisi atau `error`).
