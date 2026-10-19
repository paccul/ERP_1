# Alur Autentikasi — Garda ERP

Alur logika autentikasi dan manajemen sesi bagi pengguna.

## 1. Proses Login
1. Pengguna membuka `/login`.
2. Sistem mengecek *Rate Limiter* (maksimal 5 percobaan). Jika tercapai, kembalikan `HTTP 429 Too Many Requests` (kunci selama 60 detik).
3. Pengguna memasukkan Email/Username dan Sandi.
4. Jika salah, tampilkan pesan generik "Email atau kata sandi salah" (Jangan beri detail mana yang salah).
5. Jika berhasil, *Laravel Auth* memvalidasi status pengguna (`is_active`). Jika tidak aktif, tolak masuk.
6. Arahkan pengguna ke halaman `/dashboard`.

## 2. Penegakan Sesi
- Usia sesi (`SESSION_LIFETIME`) adalah 120 menit tanpa aktivitas.
- Setelah *timeout*, *Inertia Middleware* akan menerima *HTTP 401* pada permintaan XHR berikutnya, yang memicu redirect re-autentikasi oleh komponen klien.
- Pengguna yang masuk dapat memiliki mode "Ingat Saya" (Remember Me) untuk menjaga token login selama berhari-hari.

## 3. Cek Otorisasi (RBAC)
- Autentikasi disusul Otorisasi. Setiap interaksi API memiliki Middleware `permission:` (Spatie Laravel-Permission). 
- Jika pengguna mencoba mengakses route logistik padahal tidak punya izin `logistics.view`, server langsung mengembalikan layar *HTTP 403 Forbidden*.
