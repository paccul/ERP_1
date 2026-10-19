# Protokol Debugging — Garda ERP

Berisi standar prosedur penanganan bug dan debugging pada monolit Laravel + Inertia.js + React.

## 1. Analisis Lintas Batas (Backend-Frontend)
1. **Frontend (React/Inertia):** Cek tab Network di DevTools untuk melihat payload JSON dari Inertia. Pastikan tipe data `props` yang diterima dari server sesuai ekspektasi.
2. **Backend (Laravel):** Gunakan `dd()` atau `Log::info()` untuk menginspeksi data. Cek file log di `storage/logs/laravel.log`.
3. **Database:** Gunakan mode Strict Laravel untuk mendeteksi *N+1 query problem* atau *lazy loading* pelanggaran.

## 2. Penanganan Bug Spesifik
- **Ketidakseimbangan Jurnal:** Jika total Debit ≠ Kredit, tangkap `UnbalancedJournalException`. Periksa `JournalPostingService` yang mengirim entri.
- **Kesalahan Rendering UI:** Gunakan React Developer Tools untuk menginspeksi state komponen. Periksa konsol untuk peringatan elemen aksesibilitas (Aria) atau *Tailwind Preflight*.

## 3. Aturan Pelaporan Bug
Setiap laporan perbaikan wajib menyertakan:
- Langkah untuk mereproduksi (Steps to Reproduce).
- Bukti log server atau screenshot konsol browser.
- Deskripsi komponen/layanan yang diubah.
