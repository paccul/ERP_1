# Standar Pengujian — Garda ERP

Untuk menjaga mutu sebelum diluncurkan, pengujian bersifat wajib di frontend maupun backend.

## 1. Pengujian Backend (Pest PHP)
- **Unit Testing:** Lakukan test isolasi pada fungsi kalkulasi yang kompleks, seperti `PayrollService::calculate` dan `JournalPostingService::balanceCheck`.
- **Feature Testing:**
  - Harus menguji aturan Izin: Setiap Endpoint diuji sebagai Role yang sah (mengembalikan HTTP 200) dan Role yang tidak sah (mengembalikan HTTP 403).
  - Integrasi transaksi bisnis: Memastikan bahwa jika *Service A* sukses dieksekusi, *Record Database B* benar-benar tercipta.

## 2. Pengujian Frontend (Vitest & Testing Library)
- Uji pergerakan state UI lokal: Misalnya pengecekan render tombol "Disabled" ketika `loading = true`.
- Uji presentasi data tabel: Validasi pemotongan angka uang yang terformat (*tabular-nums*, IDR).

## 3. End-to-End & Accessibility (Playwright)
- Mengotomatisasi jalur pengguna utama (misal: Login -> Buat Jadwal Jaga -> Setujui BKO).
- Jalankan integrasi linting `@axe-core/playwright` per halaman untuk memvalidasi tidak ada pelanggaran WCAG 2.2 AA.
