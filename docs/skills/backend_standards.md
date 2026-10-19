# Standar Backend (Laravel) — Garda ERP

Arsitektur aplikasi menggunakan pola *Service Repository* yang longgar. 

## 1. Pembagian Tanggung Jawab
- **Routing:** Jangan masukkan logika apapun di `routes/web.php`. Hanya memetakan ke Controller dan menetapkan middleware izin (`permission:modul.aksi`).
- **FormRequests:** `app/Http/Requests`. Semua validasi input WAJIB berada di FormRequest. Jangan gunakan `$request->validate()` di dalam Controller.
- **Controllers:** Tipis dan bersih. Menginisialisasi panggilan ke Services dan me-return response Inertia (`Inertia::render`).
- **Domain Services:** `app/Services/`. Seluruh logika *business rules* dan operasi tulis DB ada di sini (contoh: `InvoiceService`, `JournalPostingService`). Services tidak boleh tahu apapun tentang *HTTP Request/Response*.
- **Models:** Hanya deklarasi relasi (`belongsTo`, `hasMany`), konfigurasi cast, dan scope pencarian. 

## 2. Pengecualian dan Logging
- Selalu lempar Exception khusus dari Services (misal: `InsufficientStockException`, `OverlappingShiftException`) yang nantinya ditangkap oleh Controller dan diubah menjadi *flash message* untuk Inertia.
- Seluruh perubahan data *write* harus terekam oleh paket `spatie/laravel-activitylog` tanpa kecuali.
