# Implementation Plan
## Garda ERP — Step-by-Step Development Roadmap

| Atribut | Nilai |
|---|---|
| Produk | Garda ERP — Sistem ERP Khusus BUJP (Badan Usaha Jasa Pengamanan) |
| Source of Truth | `docs/prd.md` & `docs/architecture.md` (42 Layar Garda Reference) |
| Total Estimasi Waktu | 8 - 10 Minggu (Terbagi ke dalam 8 Fase Berurutan) |
| Standar Kualitas | TDD (Red-Green-Refactor), Zero Any Type, WCAG 2.2 AA, No AI Slop |

---

## TDD & Standar Review Kode Wajib

Setiap tugas implementasi wajib mematuhi protokol:
1. **RED**: Tulis unit/integration test terlebih dahulu sebelum menulis kode fungsional.
2. **GREEN**: Implementasikan kode minimal yang bersih dan memenuhi kriteria uji.
3. **REFACTOR**: Rapikan kode, pastikan performa tinggi dan kepatuhan terhadap token desain UI.
4. **MANDATORY CHECKLIST**:
   - [ ] **Type Safety**: Bebas dari tipe `any` (eksplisit maupun implisit).
   - [ ] **RLS & Permissions**: Terlindungi oleh policy RLS Supabase dan guard middleware RBAC.
   - [ ] **UI States**: Komponen mengimplementasikan 7 state interaksi (default, hover, focus-visible, active, disabled, loading, error).
   - [ ] **Aksesibilitas**: Kontras teks memenuhi WCAG 2.2 AA dan navigasi keyboard penuh.
   - [ ] **Atomic Transaction**: Mutasi multi-tabel (invoice, payroll, logistik) diproses melalui Supabase RPC.

---

## Roadmap Pengembangan 8 Fase

### Fase 1: Fondasi Proyek, Database & Autentikasi (Minggu 1)
**Tujuan**: Menyiapkan struktur proyek Next.js 15, konfigurasi Supabase, skema 20 tabel BUJP, RLS, dan sistem autentikasi RBAC.

- [x] **Task 1.1: Inisialisasi Proyek & SDK Setup**
  - Setup Next.js 15 App Router dengan TypeScript, Tailwind CSS v4, Lucide React, Zod, React Hook Form.
  - Setup `@supabase/ssr` dan konfigurasi environment Supabase (`.env.local`).
- [x] **Task 1.2: Migrasi Skema Basis Data 20 Tabel BUJP**
  - Buat migration `001_initial_bujp_schema.sql` memuat seluruh tabel: `institution_settings`, `org_units`, `roles`, `role_permissions`, `profiles`, `clients`, `sites`, `personnel`, `checkpoints`, `shifts`, `roster_assignments`, `bko_requests`, `applicants`, `items`, `stock_movements`, `distributions`, `distribution_lines`, `invoices`, `invoice_lines`, `payroll_runs`, `payslips`, `accounts`, `journal_entries`, `journal_lines`.
  - Pasang constraint `CHECK` (saldo debit/kredit non-negatif, status enum, kuantitas stok $\ge 0$).
  - Eksekusi migrasi dan jalankan `generate_typescript_types` untuk menghasilkan `database.types.ts`.
- [x] **Task 1.3: Migrasi RLS Policies & Helper Function**
  - Buat migration `002_rls_and_permissions.sql`.
  - Implementasikan fungsi `check_user_permission(p_module, p_action)`.
  - Aktifkan RLS dan pasang kebijakan SELECT / ALL pada 20 tabel sesuai matriks izin 8 modul.
- [x] **Task 1.4: Database Seeder Dasar**
  - Buat seeder peran sistem: Administrator Sistem, Manajer Operasional, Staf Rekrutmen, Staf Logistik, Staf Keuangan, Akuntan, Direksi.
  - Buat seeder hak akses (16 izin granular).
  - Buat seeder akun COA standar BUJP (`11100` Kas, `11200` Piutang Usaha, `21100` Utang Gaji, `21400` PPN Keluaran, `41100` Pendapatan Jasa Satpam, `51100` Beban Gaji, dll).
  - Buat seeder shift default (Pagi: 07.00-15.00, Siang: 15.00-23.00, Malam: 23.00-07.00).

---

### Fase 2: Sistem Desain, Token Gelap & Primitif UI (Minggu 2)
**Tujuan**: Menyediakan pustaka komponen aksesibel bertema gelap yang identik dengan token referensi Garda.

- [x] **Task 2.1: Konfigurasi Token CSS Tema Gelap**
  - Konfigurasi `src/styles/tokens.css` dengan kanvas `#000000`, permukaan `#030712` / `#111827`, aksen amber `#f59e0b` / `#d97706`, border `#374151`, dan teks `#f9fafb`.
  - Pasang ring fokus keyboard `focus-visible:ring-2 focus-visible:ring-[#f59e0b]`.
- [x] **Task 2.2: Komponen Primitif Aksesibel (7 States)**
  - Implementasikan `Button` dengan 7 state interaktif (default, hover, focus, active, disabled, loading, error).
  - Implementasikan komponen form: `TextField`, `NumberField`, `CurrencyField` (format Rp id-ID), `Select`, `Checkbox`, `DatePicker`.
  - Komponen overlay: `ModalDialog`, `ConfirmDialog`, `Toast` (Sonner).
- [x] **Task 2.3: Reusable DataTable & Status Badges**
  - Bangun komponen `DataTable` berbasis `@tanstack/react-table` dengan pencarian live, sortir kolom, pagination, skeleton loading, dan empty state.
  - Bangun `Badge` status operasional (Aktif, Nonaktif, Draf, Terbit, Lunas, Menunggu, Disetujui).
- [x] **Task 2.4: Layout Global Dashboard & Sidebar 42 Routes**
  - Bangun `AppLayout` dengan sidebar responsif yang menampilkan navigasi 42 route sesuai matriks hak akses pengguna.
  - Bangun drawer navigasi mobile (tanpa horizontal scroll pada layar 375px+).

---

### Fase 3: Modul Pengaturan Institusi & Organisasi (SET) (Minggu 3)
**Tujuan**: Menyelesaikan seluruh modul `/settings/*` (8 layar).

- [x] **Task 3.1: Identitas & Organisasi (`SET-01`)**
  - Halaman `/settings/institution`: form 22 input profil BUJP, nomor izin Mabes Polri, NPWP, alamat, logo, konfigurasi tarif PPN & persentase BPJS.
- [x] **Task 3.2: Visual Struktur Organisasi (`SET-02`)**
  - Halaman `/settings/org-chart`: visualisasi pohon hierarki unit organisasi dan jabatan BUJP menggunakan rendering SVG berbasis `d3-hierarchy`. Fitur zoom in, zoom out, reset view.
- [x] **Task 3.3: Manajemen Pengguna & Tambah Pengguna (`SET-03`, `SET-04`)**
  - Halaman `/settings/users` dan `/settings/users/new`: tabel daftar staf, status aktif, penugasan role, tambah pengguna baru dengan Supabase Auth invite.
- [x] **Task 3.4: Manajemen Role & Izin (`SET-05`, `SET-06`, `SET-07`)**
  - Halaman `/settings/roles`, `/settings/roles/new`, dan `/settings/roles/edit/[id]`: matriks 18 input mencakup 16 checkbox izin modul (8 modul x {view, manage}).
- [x] **Task 3.5: Manajemen Data & Backup (`SET-08`)**
  - Halaman `/settings/backup`: riwayat backup snapshot, tombol trigger backup, dan dialog pemulihan data dengan validasi konfirmasi ketik ulang nama institusi.

---

### Fase 4: Modul Operasional Pengamanan & Rekrutmen (SEC & PSB) (Minggu 4-5)
**Tujuan**: Menyelesaikan 10 layar SEC dan 2 layar PSB untuk pengelolaan satpam, klien, pos jaga, jadwal shift, dan rekrutmen.

- [x] **Task 4.1: Data Personil Security & Input/Edit Personil (`SEC-01`, `SEC-02`)**
  - Halaman `/security/personnel`: tabel satpam, filter status/unit/sertifikasi Gada, penanda KTA kedaluwarsa $\le 30$ hari.
  - Halaman `/security/personnel/new` & `/security/personnel/edit/[id]`: form 19 field lengkap (NIK, KTA, Gada Pratama/Madya/Utama, penempatan site, foto, rekening bank).
- [x] **Task 4.2: Data Klien Mitra & Registrasi Klien (`SEC-03`, `SEC-04`)**
  - Halaman `/security/clients` dan `/security/clients/new`: pendaftaran klien perusahaan mitra, NPWP, alamat penagihan, kontak PIC, masa kontrak.
- [x] **Task 4.3: Data Lokasi Jaga (Sites) & Tambah Site (`SEC-05`, `SEC-06`)**
  - Halaman `/security/sites` dan `/security/sites/new`: pendaftaran titik pos jaga, koordinat GPS lat/lng, kuota personel per shift, tarif penagihan bulanan per personel.
- [x] **Task 4.4: Master Checkpoint Patroli & Kode QR (`SEC-07`)**
  - Halaman `/security/checkpoints`: manajemen titik rute patroli per site, pembuatan hash unik, dan pencetakan lembar kode QR untuk ditempel di pos jaga.
- [x] **Task 4.5: Grid Jadwal Jaga & Plotting Shift (`SEC-08`, `SEC-09`)**
  - Halaman `/security/roster`: kalender/grid interaktif penugasan satpam (Pagi, Siang, Malam, Off) per site.
  - Halaman `/security/roster/new`: form plotting shift dengan validasi deteksi bentrok jadwal tumpang tindih.
- [x] **Task 4.6: Persetujuan BKO Request (`SEC-10`)**
  - Halaman `/security/bko-requests`: daftar permohonan bantuan kendali operasi, tombol setujui/tolak dengan eksekusi RPC `approve_bko_request` yang atomik memutakhirkan roster tujuan.
- [x] **Task 4.7: Modul Rekrutmen PSB (`PSB-01`, `PSB-02`)**
  - Halaman `/psb/admin/applicants`: daftar pelamar dan filter status seleksi.
  - Halaman `/psb/admin/applicant-detail`: verifikasi berkas, penilaian tes kesamaptaan, dan tombol aksi konversi pelamar diterima menjadi personel aktif via RPC `convert_applicant_to_personnel`.

---

### Fase 5: Akuntansi Inti & Bagan Akun (ACC) (Minggu 6)
**Tujuan**: Membangun engine akuntansi double-entry yang presisi dan tidak dapat dicurangi (*tamper-proof*).

- [x] **Task 5.1: Chart of Accounts & Tambah Akun (`ACC-01`, `ACC-02`)**
  - Halaman `/finance/accounting/coa`: pohon bagan akun hierarkis dengan badge saldo normal dan sistem proteksi akun bawaan.
  - Halaman `/finance/accounting/coa/new`: form penambahan akun baru dengan validasi kode unik dan relasi akun induk.
- [x] **Task 5.2: Jurnal Umum & Input Jurnal Double-Entry (`ACC-03`, `ACC-04`)**
  - Halaman `/finance/accounting/journals`: riwayat entri jurnal dengan filter sumber transaksi (Invoice, Payroll, Distribusi, Manual).
  - Halaman `/finance/accounting/journals/new`: tabel baris multi-debit/kredit dengan validasi live balance $(\sum \text{Debit} = \sum \text{Kredit})$ dan eksekusi via RPC `validate_and_save_journal_entry`.
- [x] **Task 5.3: Buku Besar & Buku Pembantu Piutang (`RPT-01`, `RPT-02`)**
  - Halaman `/finance/accounting/reports/ledger`: mutasi transaksi per akun COA, saldo awal, dan saldo berjalan.
  - Halaman `/finance/accounting/reports/receivables`: buku pembantu piutang per klien mitra dengan rincian invoice dan aging piutang.

---

### Fase 6: Logistik & Perlengkapan Jaga (LOG) (Minggu 7)
**Tujuan**: Menyelesaikan 5 layar logistik seragam dan perlengkapan satpam terintegrasi ke akuntansi.

- [x] **Task 6.1: Gudang Logistik Pusat & Detail Item (`LOG-01`, `LOG-03`)**
  - Halaman `/logistics/warehouse`: inventaris barang, kartu ringkasan stok kritis, dan filter kategori perlengkapan.
  - Halaman `/logistics/items/detail/[id]`: informasi detail barang dan tabel Kartu Stok kronologis (*running balance*).
- [x] **Task 6.2: Registrasi & Edit Item Barang (`LOG-02`, `LOG-04`)**
  - Halaman `/logistics/items/new` dan `/logistics/items/edit/[id]`: form 9 input spesifikasi barang, ukuran seragam, batas stok minimum, dan harga perolehan.
- [x] **Task 6.3: Distribusi Perlengkapan Satpam (`LOG-05`)**
  - Halaman `/logistics/distribution`: formulir pengeluaran barang ke personel/site. Validasi stok fisik dan eksekusi RPC `process_distribution_with_journal` yang atomik memotong stok serta memposting jurnal Beban Perlengkapan.

---

### Fase 7: Keuangan Operasional — Invoicing & Payroll (FIN) (Minggu 8)
**Tujuan**: Menyelesaikan 3 layar keuangan penagihan klien dan penggajian personel terintegrasi jurnal umum.

- [x] **Task 7.1: Tagihan Klien (Invoicing) & Cetak PDF (`FIN-01`)**
  - Halaman `/finance/invoices`: daftar faktur tagihan jasa pengamanan, filter status (`draft`, `issued`, `paid`, `cancelled`), dan ekspor faktur tagihan berformat PDF resmi.
- [x] **Task 7.2: Buat Invoice Baru Terintegrasi Site (`FIN-02`)**
  - Halaman `/finance/invoice/new`: form pembuatan invoice bulanan. Memilih klien otomatis menarik seluruh site aktif dan menghitung:
    $$\text{Subtotal} = \sum (\text{Personel Aktif} \times \text{Tarif Site}) + \text{PPN}$$
  - Aksi "Terbitkan Faktur" memanggil RPC `post_invoice_to_journal` yang mengunci draf dan memposting jurnal Piutang vs Pendapatan & PPN Keluaran.
- [x] **Task 7.3: Penggajian Personel Satpam (Payroll) (`FIN-03`)**
  - Halaman `/finance/payroll`: pemrosesan gaji bulanan berdasarkan kehadiran shift jadwal jaga.
  - Komponen kalkulasi: Gaji Pokok, Tunjangan Jabatan, Lembur, Potongan BPJS Ketenagakerjaan/Kesehatan, dan PPh 21.
  - Aksi "Posting Gaji" memanggil RPC `post_payroll_to_journal` untuk mencatat kewajiban utang gaji dan beban pada jurnal umum. Unduh slip gaji PDF per satpam.

---

### Fase 8: Laporan Keuangan, Analisa Manajemen, BSC & Dashboard (Minggu 9-10)
**Tujuan**: Menyelesaikan 6 layar laporan akuntansi/analisa, 1 layar Balanced Scorecard, dan Dashboard utama.

- [x] **Task 8.1: Laporan Keuangan SAK (`RPT-03`, `RPT-04`, `RPT-05`, `RPT-06`)**
  - Laporan Posisi Keuangan (Neraca): validasi seimbang $\text{Aset} = \text{Liabilitas} + \text{Ekuitas}$.
  - Laporan Laba Rugi: pendapatan jasa dikurangi beban operasional satpam menghasilkan laba bersih.
  - Laporan Perubahan Ekuitas & Laporan Arus Kas (metode tidak langsung).
  - Ekspor seluruh laporan keuangan ke format PDF dan Cetak resmi.
- [x] **Task 8.2: Analisa Akuntansi Manajemen per Lokasi Jaga (`RPT-07`)**
  - Halaman `/finance/accounting/reports/management-analysis`: tabel profitabilitas margin per site jaga (Pendapatan Invoice Site - Beban Gaji Personel Site - Alokasi Logistik Site).
- [x] **Task 8.3: Balanced Scorecard BUJP (`RPT-08`)**
  - Halaman `/finance/accounting/reports/balanced-scorecard`: dashboard 4 perspektif performa BUJP (Keuangan, Klien Mitra, Proses Bisnis Internal SLA Satpam, Pembelajaran & Kualifikasi Gada/KTA).
- [x] **Task 8.4: Dashboard Eksekutif BUJP & Global Search (`DASH-01`)**
  - Halaman `/dashboard`: metrik live personel aktif, alert KTA kedaluwarsa $\le 30$ hari, piutang jatuh tempo, status BKO, dan stok kritis logistik.
  - Input pencarian global yang dapat menemukan personel, klien, site, dan perlengkapan logistik dalam satu query terpadu.
- [x] **Task 8.5: Audit Kepatuhan Aksesibilitas WCAG 2.2 AA & E2E Testing**
  - Seluruh 42 rute dan halaman telah terverifikasi via Next.js Production Build (`next build` keluar dengan kode 0) dan audit live browser DevTools.
  - Verifikasi seluruh kriteria penerimaan `AC-G-1` s.d. `AC-G-11` dan seluruh integrasi akuntansi double-entry terbukti seimbang.
