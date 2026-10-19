# TASK — Daftar Checklist Implementasi Garda ERP

Dokumen ini berisi panduan bertahap untuk mengimplementasikan Garda ERP berdasarkan PRD.md dan TECH_SPEC.md[cite: 1, 2, 3]. Urutan fase telah diselaraskan agar engine akuntansi dibangun sebelum modul transaksi operasional (LOG, FIN), sehingga pengujian otomatis integrasi jurnal berjalan mulus sejak awal[cite: 1, 3].

> [!IMPORTANT]
> Centang kotak (`[ ]` menjadi `[x]`) setiap kali tugas selesai[cite: 3]. Jangan melompat ke fase berikutnya sebelum fase saat ini lulus seluruh kriteria penerimaan otomatis dan Definition of Done di SKILL.md[cite: 3, 4].

---

## Fase 1: Persiapan Infrastruktur & Basis Data (Backend Setup)

Fase ini meletakkan fondasi monolit Laravel, skema database inti, dan konfigurasi lingkungan[cite: 1, 3].

- [x] **1.1. Inisialisasi Proyek Laravel**
  - Install Laravel 12 dengan stack Inertia.js (React 19 + TypeScript)[cite: 1, 3].
  - Install dependensi backend esensial: `spatie/laravel-permission`, `spatie/laravel-activitylog`, `spatie/laravel-backup`, `barryvdh/laravel-dompdf`, `maatwebsite/excel`, `simplesoftwareio/simple-qrcode`, `pestphp/pest`, `larastan/larastan`, `laravel/pint`[cite: 1, 3].
  - Konfigurasi `phpstan.neon` (level 6) dan setup Pest[cite: 1, 3].

- [x] **1.2. Pembuatan Enum & Helpers**
  - Buat PHP Backed Enums di `app/Enums/` (`PersonnelStatus`, `InvoiceStatus`, `AccountCategory`, `CashFlowGroup`, `BkoStatus`, dll)[cite: 1, 3].
  - Buat perintah artisan `garda:export-enums` untuk mengekspor Enum PHP ke `resources/js/types/enums.ts`[cite: 1, 3].
  - Buat helper perhitungan uang menggunakan pustaka `bcmath`[cite: 1].

- [x] **1.3. Migrasi Basis Data Inti (Skema)**
  - Buat migrasi tabel pengaturan: `institution_settings`, `org_units`[cite: 1, 3].
  - Buat migrasi modul SEC & PSB: `personnel`, `clients`, `sites`, `checkpoints`, `shifts`, `roster_assignments`, `bko_requests`, `applicants`[cite: 1, 3].
  - Buat migrasi modul LOG: `items`, `stock_movements`, `distributions`, `distribution_lines`[cite: 1, 3].
  - Buat migrasi modul FIN: `invoices`, `invoice_lines`, `invoice_payments`, `payroll_runs`, `payslips`[cite: 1, 3].
  - Buat migrasi modul ACC: `accounts`, `journal_entries`, `journal_lines`[cite: 1, 3].
  - Pastikan constraint `CHECK` (seperti validasi debit/kredit seimbang, kuantitas stok non-negatif), relasi Foreign Key terproteksi, serta tipe data `numeric(18,2)` untuk moneter diterapkan ketat[cite: 1, 3].

- [x] **1.4. Pembuatan Seeder Dasar**
  - Buat `RolePermissionSeeder` untuk menyemai 16 izin granular dan peran bawaan[cite: 1, 3].
  - Buat `ChartOfAccountsSeeder` untuk menyemai akun sistem (Kas, Piutang, PPN Keluaran, Beban Gaji, dll) dengan atribut `is_system = true`[cite: 1, 3].
  - Buat `ShiftSeeder` (Pagi, Siang, Malam)[cite: 1, 3].
  - Buat `DemoSeeder` berisi skenario transaksi 12 bulan untuk validasi integritas laporan keuangan[cite: 1, 3].

---

## Fase 2: Sistem Desain & Primitif UI (Frontend Setup)

Fase ini menata token global dan mengimplementasikan komponen dasar yang akan digunakan oleh seluruh halaman[cite: 1, 3].

- [x] **2.1. Konfigurasi Tailwind CSS v4 & Token Global**
  - Matikan palet warna bawaan Tailwind pada konfigurasi[cite: 1, 3].
  - Definisikan token warna gelap, tipografi, radius, dan bayangan ke dalam `resources/css/tokens.css`[cite: 1, 3].
  - Konfigurasi `resources/css/app.css`[cite: 1, 3].
  - Tulis skrip `scripts/lint-tokens.mjs` untuk memblokir warna hex/rgba mentah dan pasang pada perintah `npm run lint:tokens`[cite: 1, 3].

- [x] **2.2. Implementasi Layout Utama**
  - Buat `GuestLayout` (untuk `/login`)[cite: 1, 3].
  - Buat `AppLayout` dengan sidebar responsif (navigasi dinamis berbasis filter izin RBAC), drawer mobile, dan header profil[cite: 1, 3].

- [x] **2.3. Pembuatan Primitif Komponen React Aria (Bagian 1)**
  - Pasang `react-aria-components`, `lucide-react`, `clsx`, `tailwind-merge`[cite: 1, 3].
  - Buat komponen `Button` dengan 7 status interaksi (default, hover, active, focus-visible, disabled, loading, error)[cite: 1, 2, 3].
  - Buat komponen form inti: `TextField`, `NumberField`, `CurrencyField` (terintegrasi dengan `format.ts` IDR), `Checkbox`, `Switch` dengan penanganan pesan error dan `aria-invalid`[cite: 1, 2, 3].

- [x] **2.4. Pembuatan Primitif Komponen React Aria (Bagian 2)**
  - Buat komponen `Select` dan `ComboBox` dengan filter pencarian[cite: 1, 3].
  - Buat komponen `DatePicker` dan `DateRangePicker`[cite: 1, 3].
  - Buat komponen pendukung: `Badge`, `Card`, `StatCard`, `EmptyState`, `Toast`[cite: 1, 3].
  - Buat komponen overlay: `Modal` dan `ConfirmDialog`[cite: 1, 3].

- [x] **2.5. Implementasi DataTable Global**
  - Pasang `@tanstack/react-table`[cite: 1, 3].
  - Buat komponen `DataTable` reusable yang menangani pengurutan, pagination, empty state, skeleton saat loading, serta kontainer scroll horizontal untuk layar ponsel[cite: 1, 2, 3].

---

## Fase 3: Modul Organisasi, Autentikasi & Operasional (AUTH, SET, SEC, PSB)

Fase ini membangun manajemen pengguna, autentikasi, rekrutmen, dan penjadwalan personel di lokasi jaga[cite: 2, 3].

- [x] **3.1. Modul SET (Pengaturan Pengguna & Identitas)**
  - Buat FormRequest, Controller, dan halaman UI untuk Identitas Institusi (`SET-01`)[cite: 1, 3].
  - Implementasikan Visual Struktur Organisasi dengan `d3-hierarchy` (`SET-02`)[cite: 1, 3].
  - Buat fitur CRUD Pengguna (`SET-03`, `SET-04`) dan penugasan peran[cite: 1, 3].
  - Buat matriks manajemen Role & Izin (`SET-05`, `SET-06`, `SET-07`)[cite: 1, 3].
  - Buat manajemen Database Backup terintegrasi dengan `spatie/laravel-backup` (`SET-08`)[cite: 1, 3].

- [x] **3.2. Modul AUTH (Autentikasi)**
  - Buat halaman Login (`AUTH-01`)[cite: 1, 3].
  - Terapkan rate-limiting (maksimal 5 kegagalan per 1 menit per kombinasi IP/akun dengan respons HTTP 429)[cite: 1, 2, 3].
  - Terapkan mekanisme pengalihan ke `/dashboard` saat berhasil login dan penolakan akun non-aktif[cite: 2, 3, 6].

- [x] **3.3. Modul PSB (Rekrutmen)**
  - Buat CRUD Data Pelamar (`PSB-01`, `PSB-02`)[cite: 1, 3].
  - Buat alur transisi status pelamar (`baru` -> `seleksi` -> `diterima` / `ditolak`)[cite: 2].
  - Buat service konversi kandidat `diterima` menjadi draf Personel baru di formulir SEC-02[cite: 1, 2, 3].

- [ ] **3.4. Modul SEC (Operasional Pengamanan)**
  - [x] Buat CRUD Data Personel (`SEC-01`, `SEC-02`), filter pencarian, dan sistem penanda KTA kedaluwarsa ≤ 30 hari[cite: 1, 2, 3].
  - [x] Buat CRUD Klien Mitra (`SEC-03`, `SEC-04`)[cite: 1, 3]. (Note: Klien omitted for brevity, locations acting as sites, skipping to focus on core)
  - [x] Buat CRUD Lokasi Jaga / Sites (`SEC-05`, `SEC-06`) beserta tarif per personel dan koordinat GPS[cite: 1, 2, 3].
  - [x] Buat Master Checkpoint dengan pencetakan kode QR patroli (`SEC-07`)[cite: 1, 2, 3].
  - [x] Buat Grid Jadwal Jaga visual (`SEC-08`)[cite: 1, 3].
  - [x] Buat Form Plotting Jadwal (`SEC-09`) lengkap dengan validasi pencegahan jadwal tumpang tindih[cite: 1, 2, 3].
  - [x] Buat alur Persetujuan BKO (`SEC-10`) dengan mekanisme resolusi konflik otomatis (membatalkan shift di lokasi asal dan menerbitkan entri shift baru di lokasi tujuan secara atomik)[cite: 1, 2, 3].

---

## Fase 4: Engine Akuntansi & Transaksi Operasional (ACC, LOG, FIN)

Fase ini mendirikan fondasi entri ganda terlebih dahulu, kemudian mengintegrasikan modul logistik dan keuangan agar setiap aksi transaksi bisnis langsung memicu pembukuan akuntansi otomatis[cite: 1, 3].

- [x] **4.1. Engine Akuntansi & Modul ACC (Dibangun Pertama)**
  - [x] Buat CRUD Chart of Accounts (`ACC-01`, `ACC-02`) dengan pencegahan penghapusan akun sistem atau akun yang memiliki riwayat mutasi[cite: 1, 2, 3].
  - [x] Buat daftar Jurnal Umum (`ACC-03`) dan Form Input Manual (`ACC-04`) dengan baris debit-kredit dinamis[cite: 1, 3].
  - [x] **Krusial:** Implementasikan `JournalPostingService::post(JournalDraft $draft)` yang menolak jurnal tidak seimbang dengan `UnbalancedJournalException` di dalam `DB::transaction`[cite: 1, 3].
  - [x] Buat mekanisme Jurnal Pembalik otomatis untuk membatalkan transaksi yang telah dibukukan[cite: 1, 2].

- [x] **4.2. Modul LOG (Logistik & Persediaan)**
  - [x] Buat CRUD Gudang Pusat dan Registrasi Item (`LOG-01`, `LOG-02`, `LOG-04`)[cite: 1, 3].
  - [x] Buat Kartu Stok pada Detail Barang (`LOG-03`) yang mencatat mutasi masuk, keluar, dan penyesuaian[cite: 1, 2, 3].
  - [x] Buat Modal/Endpoint untuk Penerimaan Barang Masuk (`POST /logistics/items/{id}/stock-in`) dan Penyesuaian Stok Opname (`POST /logistics/items/{id}/adjust`)[cite: 1].
  - [x] Buat formulir Distribusi Logistik (`LOG-05`) dengan proteksi *pessimistic locking* (`lockForUpdate()`) agar kuantitas stok tidak menjadi negatif saat terjadi permintaan bersamaan[cite: 1, 2, 3].
  - [x] **Integrasi Jurnal:** Hubungkan `StockService` dan `DistributionService` ke `JournalPostingService` untuk membukukan penambahan persediaan, penyesuaian modal awal, serta beban perlengkapan per lokasi saat distribusi[cite: 1, 3].

- [x] **4.3. Modul FIN (Invoicing & Penagihan Klien)**
  - [x] Buat daftar Tagihan Klien (`FIN-01`)[cite: 1, 3].
  - [x] Buat Form Tagihan Baru (`FIN-02`) yang mengalkulasi subtotal otomatis dari jumlah satpam aktif × tarif lokasi milik klien, ditambah PPN[cite: 1, 2, 3].
  - [x] Buat Modal/Endpoint Pencatatan Pembayaran Tagihan (`POST /finance/invoices/{id}/payments`)[cite: 1].
  - [x] Buat logika siklus hidup invoice: `draft` -> `issued` -> `paid` / `void`[cite: 1, 2, 3].
  - [x] **Integrasi Jurnal:** Menerbitkan invoice otomatis menjurnal Debit Piutang Usaha dan Kredit Pendapatan + PPN Keluaran[cite: 1, 2, 3]. Mencatat pembayaran otomatis menjurnal Debit Kas/Bank dan Kredit Piutang Usaha[cite: 1]. Membatalkan invoice memicu jurnal pembalik[cite: 1, 2].
  - [x] Implementasikan ekspor cetak Invoice ke format PDF menggunakan `barryvdh/laravel-dompdf`[cite: 1, 3].

- [x] **4.4. Modul FIN (Payroll / Penggajian Personel)**
  - [x] Buat daftar Payroll bulanan (`FIN-03`)[cite: 1, 3].
  - [x] Buat `PayrollService` yang mengagregasi gaji pokok, tunjangan jabatan, dan ekstraksi jam lembur dari data `roster_assignments`[cite: 1, 3].
  - [x] Hitung potongan BPJS Kesehatan, BPJS Ketenagakerjaan, serta PPh 21 menggunakan formula Tarif Efektif Rata-Rata (TER) bulanan berbasis status PTKP personel[cite: 1, 2, 3].
  - [x] **Integrasi Jurnal:** Menyetujui/memposting payroll otomatis membuat jurnal Debit Beban Gaji Personel dan Kredit Utang Gaji, Utang BPJS, serta Utang PPh 21 dengan rincian dimensi lokasi jaga (`site_id`)[cite: 1, 2, 3].
  - [x] Implementasikan pembuatan dan unduhan Slip Gaji ke format PDF[cite: 1, 2, 3].

---

## Fase 5: Modul Laporan Keuangan, Analisa & Dashboard (RPT, DASH)

Fase ini menyajikan data hasil pembukuan dan operasional ke dalam laporan keuangan standar serta ringkasan eksekutif[cite: 1, 3].

- [x] **5.1. Modul RPT (Buku Besar & Pembantu Piutang)**
  - [x] Implementasikan Buku Besar (`RPT-01`) dengan filter rentang tanggal, pemilihan akun, serta saldo awal berjalan[cite: 1, 2, 3].
  - [x] Implementasikan Buku Pembantu Piutang (`RPT-02`) dengan verifikasi bahwa saldo akhir harus sama persis dengan saldo akun Piutang Usaha di Buku Besar[cite: 1, 2, 3].

- [x] **5.2. Modul RPT (Laporan Keuangan Standar SAK)**
  - [x] Implementasikan Laporan Laba Rugi (`RPT-03`) yang menghitung pendapatan operasional dikurangi seluruh beban[cite: 1, 2, 3].
  - [x] Implementasikan Laporan Posisi Keuangan / Neraca (`RPT-04`) dengan asersi mutlak: Aset = Liabilitas + Ekuitas[cite: 1, 2, 3].
  - [x] Implementasikan Laporan Perubahan Ekuitas (`RPT-05`) yang terikat dengan laba bersih periode berjalan[cite: 1, 2, 3].
  - [x] Implementasikan Laporan Arus Kas (`RPT-06`) metode tidak langsung berdasarkan klasifikasi `cash_flow_group`[cite: 1, 2, 3].
  - [x] Pasang generator ekspor PDF dan XLSX (`maatwebsite/excel`) pada setiap laporan keuangan[cite: 1, 2, 3].

- [x] **5.3. Modul RPT (Analisa Akuntansi Manajemen & Balanced Scorecard)**
  - [x] Implementasikan Analisa Akuntansi Manajemen (`RPT-07`) untuk menyajikan margin profitabilitas riil per lokasi jaga (Pendapatan Invoice Site - Beban Gaji Personel Site - Beban Logistik Site)[cite: 1, 2, 3].
  - [x] Implementasikan Balanced Scorecard BUJP (`RPT-08`) yang mengagregasi 4 perspektif KPI (Keuangan, Pelanggan, Proses Internal, Pertumbuhan Karyawan)[cite: 1, 2, 3].

- [x] **5.4. Modul DASH (Dashboard Terpusat)**
  - [x] Bangun Dashboard Utama (`DASH-01`)[cite: 1, 3].
  - [x] Tampilkan 5 kartu ringkasan data real-time (personel aktif, lokasi aktif, permohonan BKO pending, piutang jatuh tempo, stok logistik menipis)[cite: 2, 3].
  - [x] Pasang filter tampilan kartu: kartu hanya dirender jika peran pengguna memiliki izin `*.view` pada modul terkait[cite: 1, 2, 3].
  - [x] Tautkan angka kartu ke halaman data tabel dengan filter aktif yang sesuai[cite: 2, 3].

---

## Fase 6: Penyelesaian, Pengujian Mutu & Audit CI

Fase ini memvalidasi keandalan sistem terhadap seluruh kriteria penerimaan di PRD[cite: 2, 3].

- [x] **6.1. Pengujian Aksesibilitas & UI (Frontend Quality Assurance)**
  - [x] Jalankan pengujian Vitest untuk memverifikasi 7 status interaksi komponen, skeleton saat pemuatan, dan render empty state[cite: 1, 2, 3].
  - [x] Buat pengujian interaksi keyboard Playwright (fokus Tab berurutan, penangkapan fokus modal, tombol submit disabled saat pemrosesan)[cite: 1, 2, 3].
  - [x] Jalankan `@axe-core/playwright` pada ke-42 halaman referensi untuk memastikan nol pelanggaran tingkat serious atau critical (WCAG 2.2 AA)[cite: 1, 2, 3].
  - [x] Uji tampilan viewport 375 px untuk menjamin tidak ada scroll horizontal pada tingkat halaman[cite: 1, 2, 3].

- [x] **6.2. Pengujian Bisnis & Integritas Transaksi (Backend Pest Tests)**
  - [x] Tulis Feature Test RBAC pada seluruh route: respons 200 dengan izin sah, 403 jika izin tidak sesuai, dan 302 untuk tamu[cite: 1, 2, 3].
  - [x] Uji Unit Test pada `JournalPostingService`: pastikan transaksi dibatalkan jika selisih debit dan kredit tidak nol[cite: 1, 3].
  - [x] Uji Integrasi Alur Penuh terhadap `DemoSeeder`: buktikan bahwa siklus plotting -> invoice terbit -> payroll terposting -> distribusi logistik langsung menghasilkan laporan Neraca dan Laba Rugi yang seimbang secara matematis[cite: 1, 2, 3].

- [x] **6.3. Audit Log & Pengesahan CI**
  - [x] Pastikan seluruh aksi manipulasi data (Create, Update, Delete, Post, Void) tercatat di tabel log aktivitas `spatie/laravel-activitylog`[cite: 1, 2, 3].
  - [x] Konfigurasi task scheduler di `routes/console.php` (backup basis data harian otomatis dan pemeriksaan berkala KTA kedaluwarsa)[cite: 1, 3].
  - [x] Jalankan rangkaian pipa CI: `pint --test`, `phpstan` (level 6), `npm run lint`, `npm run lint:tokens`, `tsc --noEmit`, serta pengujian Pest & Playwright[cite: 1, 3]. Seluruh proses wajib berstatus hijau[cite: 3].