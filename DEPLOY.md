# Deploy ke Vercel (gratis)

## 1. Push ke GitHub
Folder ini belum berupa repo Git. Di folder proyek:
```
git init
git add .
git commit -m "Straweyi Workshop Hub"
```
Buat repo kosong di github.com (Private), lalu:
```
git remote add origin https://github.com/USERNAME/straweyi-workshop-hub.git
git branch -M main
git push -u origin main
```
`.env` sudah di-ignore, jadi kunci Anda tidak ikut ter-upload.

## 2. Import di Vercel
1. Login di vercel.com dengan GitHub → **Add New → Project** → pilih repo.
2. Framework otomatis terdeteksi **Vite** (pengaturan diambil dari `vercel.json`).
3. Buka **Environment Variables**, isi sama seperti `.env` lokal:

| Nama | Isi |
|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `VITE_ADMIN_EMAIL` | email admin |
| `VITE_ADMIN_PATH` | path rahasia admin (sama dengan lokal) |
| `VITE_WA_NUMBER` | mis. `6281234567890` |

4. Klik **Deploy**. Hasilnya `https://nama-proyek.vercel.app`.

## 3. Setelah deploy
- **Supabase → Authentication → URL Configuration**: isi *Site URL* dengan alamat Vercel, dan tambahkan ke *Redirect URLs* (supaya login admin berfungsi).
- **Supabase → Edge Functions → Secrets**: ubah `SITE_URL` ke alamat Vercel (link tiket di email).
- Cek: buka `/studio-...` (path admin) → login → tab **Check-in** → kamera harus bisa menyala (HTTPS).
- Halaman `/ticket/KODE` harus tetap terbuka saat di-refresh.

## 4. Domain sendiri (opsional)
Vercel → Project → **Settings → Domains → Add**, ikuti petunjuk DNS. Setelah itu perbarui lagi Site URL di Supabase dan `SITE_URL` di secrets, lalu verifikasi domain di Resend untuk email ke peserta.

## Update berikutnya
Setiap `git push` ke `main` otomatis di-deploy ulang.
Bila mengubah env variable, lakukan **Redeploy** karena variabel `VITE_*` dibaca saat build.
