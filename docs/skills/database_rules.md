# Aturan Basis Data — Garda ERP

Panduan standar skema dan relasi basis data PostgreSQL untuk menjamin integritas data (khususnya akuntansi).

## 1. Tipe Data Kritis
- **Uang (Monetary):** WAJIB menggunakan `numeric(18,2)`. DILARANG menggunakan `float` atau `double`.
- **Kuantitas Barang:** Menggunakan `numeric(12,2)` untuk mengakomodasi nilai pecahan jika ada unit logistik khusus.
- **ID Utama:** Menggunakan `bigint` (bigIncrements).

## 2. Integritas Skema
- **Relasi (Foreign Keys):** Selalu terapkan `ON DELETE RESTRICT` pada tabel master (seperti Akun COA, Item Logistik, Personel) jika sudah terhubung dengan transaksi.
- **Database Level Constraints:**
  - `CHECK (guards_per_shift >= 1)` pada `sites`.
  - `CHECK (debit >= 0 AND credit >= 0 AND (debit = 0) <> (credit = 0))` pada `journal_lines` (sebuah baris tidak bisa menjadi debit DAN kredit sekaligus).
- **Soft Deletes:** Tabel master operasional (`personnel`, `sites`, `clients`, `items`) WAJIB mengimplementasikan `deleted_at` untuk riwayat dan tidak memutus rekaman lama.

## 3. Transaksi
- Proses bisnis multihalaman (Misalnya: Pembuatan Tagihan/Payroll -> Pembuatan Jurnal) WAJIB dieksekusi di dalam `DB::transaction()`.
