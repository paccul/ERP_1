# Skema Database Inti — Garda ERP

Rangkuman struktural tabel dan modul basis data dari Spesifikasi Teknis.

## 1. Hierarki & Identitas
- **`institution_settings`:** Penyimpan profil perusahaan dan parameter global (tarif PPN, persentase BPJS, dll).
- **`org_units`:** Tabel unit organisasi berbentuk *self-referencing tree* (CTEs).
- **`users` & `roles`:** Pengguna yang dipetakan ke berbagai modul izin.

## 2. Operasional Pengamanan
- **`clients`** & **`sites`:** Data klien mitra dan relasi 1-to-many ke titik penempatan (lokasi jaga).
- **`personnel`:** Data satpam, dengan relasi ke *site* saat ini.
- **`roster_assignments`:** Tabel jadwal jaga yang menghubungkan `personnel_id`, `site_id`, `shift_id`, dan tanggal.

## 3. Logistik
- **`items`:** Master barang logistik/perlengkapan.
- **`stock_movements`:** Pencatatan *immutable* aliran barang (masuk, keluar, rusak).
- **`distributions`** & **`distribution_lines`:** Data pemberian perlengkapan ke entitas satpam atau ke titik lokasi.

## 4. Keuangan & Akuntansi (Inti ERP)
- **`invoices`:** Data penagihan ke klien berdasarkan tarif lokasi dan jumlah satpam aktif.
- **`payroll_runs`:** Siklus perhitungan honor satpam berdasarkan presensi/jadwal.
- **`accounts`:** Pohon Akun Keuangan (Chart of Accounts).
- **`journal_entries`** & **`journal_lines`:** Buku Catatan Jurnal Utama berprinsip entri ganda (*Double-Entry Bookkeeping*). Beban penggajian, piutang invoice, dan beban perlengkapan bermuara di sini secara atomik.
