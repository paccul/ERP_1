# Garda ERP — Production Deployment Checklist & SOP
**Dokumen Standar Operasional Pelepasan Sistem ke Lingkungan Produksi (Vercel)**  
**Versi:** 1.0.0  
**Tanggal:** 19 Oktober 2026  
**Klasifikasi:** Internal Operasional BUJP  

---

## 1. Spesifikasi Lingkungan Produksi
- **Platform Host:** Vercel Pro / Production (`framework: nextjs`)
- **Region Serverless/Edge:** Singapore (`sin1`)
- **Runtime:** Node.js 20+ / Next.js 15 App Router
- **Database Backend:** Supabase Managed PostgreSQL
- **Konektivitas Auth:** `@supabase/ssr` Cookies Architecture

---

## 2. Variabel Lingkungan (Vercel Environment Variables)
Pastikan seluruh variabel berikut telah didaftarkan pada menu **Project Settings → Environment Variables** di Dashboard Vercel:

| Nama Variabel | Scope | Keterangan | Sensitivitas |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Endpoint REST & Auth Supabase | Publik |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Public API Client Key | Publik |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Private Server-Side Admin Key (Seed & Migration) | **Sangat Rahasia (Never Expose to Browser)** |
| `NEXT_PUBLIC_APP_URL` | Production | Base URL domain produksi (e.g. `https://garda.bujp.id`) | Publik |

> **Catatan Keamanan:** Kunci `SUPABASE_SERVICE_ROLE_KEY` tidak boleh memiliki awalan `NEXT_PUBLIC_` dan dilarang di-import pada komponen yang memiliki direktif `"use client"`.

---

## 3. Verifikasi Database & Keamanan RLS (Row Level Security)
- [x] **24 Tabel Master & Transaksional Terproteksi RLS:**
  - `accounts`, `applicants`, `bko_requests`, `checkpoints`, `clients`, `distribution_lines`, `distributions`, `institution_settings`, `invoice_lines`, `invoices`, `items`, `journal_entries`, `journal_lines`, `org_units`, `payroll_runs`, `payslips`, `personnel`, `profiles`, `role_permissions`, `roles`, `roster_assignments`, `shifts`, `sites`, `stock_movements`.
- [x] **RBAC Multi-Role Matriks Terverifikasi:**
  - `super_admin` (`admin@garda.bujp.id`): Akses penuh ke seluruh 8 modul operasional BUJP.
  - `hrd_admin` (`hrd@garda.bujp.id`): Modul Personel, Legalitas KTA/Gada, Roster Shift, dan Rekrutmen PSB.
  - `finance_admin` (`finance@garda.bujp.id`): Modul Invoicing, Penggajian Satpam, dan Jurnal Akuntansi SAK.
- [x] **Database Stored Procedures (RPC):**
  - `post_invoice_to_journal`: Penerbitan faktur tagihan otomatis mendebit Piutang dan mengkredit Pendapatan & PPN.
  - `post_payroll_to_journal`: Posting gaji bulanan mendebit Beban Gaji dan mengkredit Utang Gaji & BPJS.
  - `process_distribution_with_journal`: Distribusi kaporlap memotong kuantitas fisik dan mendebit Beban Perlengkapan.
  - `check_user_permission`: Validasi hak akses dinamis per-role pada level Postgres.

---

## 4. Akun Pengujian UAT (Ready for Acceptance Testing)
| Role Akun | Email Pengguna | Kata Sandi Default | Hak Akses Utama |
|---|---|---|---|
| **Super Admin** | `admin@garda.bujp.id` | `Password123!` | Seluruh 9 Modul + Pengaturan Sistem |
| **HRD Manager** | `hrd@garda.bujp.id` | `Password123!` | Personel, Klien, Roster, Rekrutmen |
| **Finance Manager**| `finance@garda.bujp.id` | `Password123!` | Invoicing, Payroll, Jurnal, Laporan SAK |

---

## 5. Protokol Verifikasi Pasca-Deployment (Smoke Testing SOP)
Lakukan pengujian cepat pada URL produksi (`https://<project-name>.vercel.app`):
1. **Autentikasi:** Login via `/login` menggunakan akun `admin@garda.bujp.id`, pastikan redirect sukses ke `/dashboard`.
2. **Dashboard Eksekutif:** Pastikan KPI Personel Aktif, Klien Mitra, Piutang Berjalan, dan Stok Kaporlap termuat tanpa error.
3. **Legalitas Personel Satpam (`/dashboard/personnel`):** Periksa filter masa berlaku KTA Mabes Polri (peringatan kuning/merah untuk KTA $\le$ 30 hari).
4. **Logistik Kaporlap (`/dashboard/logistics`):** Pastikan stok gudang terpotong saat form distribusi disubmit.
5. **Invoicing & Billing (`/dashboard/invoices`):** Uji pembuatan 1 faktur tagihan jasa satpam dan periksa kalkulasi PPN 11%.
6. **Penggajian Satpam (`/dashboard/payroll`):** Periksa kalkulasi take-home pay dan potongan BPJS 1% + 2%.
7. **Laporan Keuangan SAK (`/dashboard/accounting/reports`):**
   - Buka tab Neraca: Pastikan banner hijau **"Neraca Seimbang (Balanced) SAK"** dengan Variansi = Rp 0.
   - Buka tab Laba Rugi: Pastikan angka Laba Bersih sesuai dengan saldo penambah ekuitas di Neraca.
   - Buka tab Arus Kas: Pastikan rekonsiliasi kas operasional, investasi, dan pendanaan terhitung valid.

---

## 6. Prosedur Tanggap Darurat & Rollback (Incident Handling)
1. Jika terjadi kegagalan runtime atau hydration error pasca-rilis:
   - Akses **Vercel Dashboard → Deployments**.
   - Pilih deployment stabil sebelumnya, lalu klik **"Instant Rollback"**.
2. Jika terjadi anomali integritas data akuntansi:
   - Eksekusi pemeriksaan jurnal manual pada `/dashboard/accounting/journals`.
   - Periksa voucher jurnal status `posted` dan bandingkan dengan rincian sumber transaksinya (`source_type` & `source_id`).
