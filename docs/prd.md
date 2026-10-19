# Product Requirements Document (PRD)
## Garda — Sistem ERP Terintegrasi untuk Badan Usaha Jasa Pengamanan (BUJP)

| Atribut | Nilai |
|---|---|
| Produk | Garda ERP — Sistem ERP Khusus BUJP (Perusahaan Jasa Pengamanan) |
| Aplikasi Referensi | `https://garda.katalangit.com` |
| Versi Dokumen | 2.0 (Disinkronkan Penuh dengan Garda Reference 42 Layar) |
| Source of Truth | 42 berkas Desain & 48 berkas Skill di `docs/skills/` (hasil ekstraksi typeui.sh per halaman) |
| Dokumen Terkait | `docs/architecture.md` · `docs/plan.md` |

> [!IMPORTANT]
> Seluruh file spesifikasi di `docs/skills/` (referensi Garda) merupakan **Source of Truth (Acuan Utama)**. Setiap kebutuhan di dokumen ini dipetakan langsung dengan kode sumber:
> - **[D]** — Tertulis langsung di berkas desain/skill referensi Garda.
> - **[I]** — Disimpulkan dari kebutuhan operasional standar industri BUJP di Indonesia dan relasi antar modul (keamanan, orang, barang, dan akuntansi double-entry).

---

## 1. Overview & Latar Belakang

### 1.1 Profil Bisnis BUJP
Perusahaan Badan Usaha Jasa Pengamanan (BUJP) mengelola tiga arus kerja kritis yang saling terintegrasi:
1. **Orang (Human Resources & Operasional Pengamanan)**: Rekrutmen pelamar (PSB), data personel satpam, verifikasi legalitas (KTA Polri, Sertifikasi Gada Pratama/Madya/Utama), penjadwalan shift jaga (rostering), titik patroli (checkpoint QR), dan penugasan perbantuan BKO (Bawah Kendali Operasi).
2. **Barang (Logistik & Perlengkapan Jaga)**: Pengelolaan gudang pusat, registrasi seragam (PDH/PDL), perlengkapan (kopel, borgol, tongkat, senter), kartu stok, dan distribusi langsung ke personel satpam atau lokasi penempatan jaga (site).
3. **Uang (Finance & Akuntansi Double-Entry)**: Penagihan invoice ke klien mitra berbasis jumlah personel aktif dan tarif kontrak per lokasi jaga (+ PPN & PPh 23), penggajian (payroll) personel berdasarkan presensi/shift (+ potongan BPJS Ketenagakerjaan/Kesehatan & PPh 21), bagan akun (COA), serta pencatatan jurnal umum otomatis berprinsip double-entry ke buku besar hingga laporan keuangan SAK.

**Garda ERP** menyatukan ketiga pilar tersebut dalam satu aplikasi terpadu. Satu kejadian operasional (misalnya penempatan personel di lokasi klien) secara otomatis berdampak langsung pada tagihan invoice, beban gaji, kartu stok seragam, dan laporan keuangan laba rugi.

### 1.2 Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, React Aria Components / Shadcn UI
- **Backend & Database**: Supabase PostgreSQL dengan Row Level Security (RLS) & PostgreSQL Functions (RPC)
- **Autentikasi & Otorisasi**: Supabase Auth dengan Custom Claims / RBAC (8 Modul x {`view`, `manage`})
- **Reporting & Asset**: PDF & XLSX Generator, QR Code Generator untuk Patroli Checkpoint

---

## 2. User Roles & Izin Akses (RBAC)

Sistem menggunakan matriks hak akses 8 modul izin bawaan dengan 2 tingkat akses: `view` (baca) dan `manage` (tulis/eksekusi).

### 2.1 Role Bawaan Sistem (System Default Roles)

| Role Bawaan | Deskripsi Tanggung Jawab | Modul Akses Utama |
|---|---|---|
| **Administrator Sistem** | Manajemen akun pengguna, konfigurasi role & izin, profil institusi BUJP, backup data | `users.*`, `institution.*` |
| **Manajer Operasional** | Pengelolaan personel satpam, klien mitra, lokasi jaga (sites), master checkpoint patroli, plotting jadwal shift, dan persetujuan penugasan BKO | `security.*`, `reports.view` |
| **Staf Rekrutmen (HR/PSB)** | Manajemen pelamar (PSB), pemrosesan seleksi/tes, dan konversi kandidat diterima menjadi draf personel satpam baru | `recruitment.*`, `security.view` |
| **Staf Logistik** | Pengelolaan gudang logistik pusat, registrasi item barang/seragam, pemantauan kartu stok, dan distribusi perlengkapan ke personel/lokasi | `logistics.*` |
| **Staf Keuangan (Finance)** | Pembuatan dan penerbitan tagihan klien (invoicing), perhitungan siklus penggajian (payroll) satpam, dan pemantauan piutang | `finance.*`, `accounting.view`, `reports.view` |
| **Akuntan** | Pengelolaan Bagan Akun (COA), pencatatan jurnal umum manual, posting jurnal otomatis, rekonsiliasi buku besar & pembantu piutang | `accounting.*`, `reports.*` |
| **Direksi (Management)** | Pemantauan performa bisnis real-time melalui Dashboard, Laporan Keuangan (Neraca, Laba Rugi, Arus Kas, Perubahan Ekuitas), Analisa Manajemen per Lokasi Jaga, dan Balanced Scorecard BUJP | `reports.view`, `security.view`, `finance.view`, `accounting.view` (Read-only) |

### 2.2 Matriks 8 Modul Izin (16 Hak Akses Granular)
1. `security.view` & `security.manage` (Operasional Personel, Klien, Sites, Roster, BKO, Checkpoint)
2. `recruitment.view` & `recruitment.manage` (Rekrutmen Pelamar PSB & Detail Kandidat)
3. `logistics.view` & `logistics.manage` (Gudang, Master Barang, Kartu Stok, Distribusi)
4. `finance.view` & `finance.manage` (Invoicing Klien, Perhitungan Payroll)
5. `accounting.view` & `accounting.manage` (Chart of Accounts, Jurnal Umum, Verifikasi Debit-Kredit)
6. `reports.view` & `reports.manage` (Buku Besar, Buku Pembantu, Laporan Keuangan, Analisa Manajemen, BSC)
7. `users.view` & `users.manage` (Pengguna Sistem & Manajemen Role/Izin)
8. `institution.view` & `institution.manage` (Profil Institusi BUJP, Struktur Organisasi, Backup & Restore)

---

## 3. Ruang Lingkup Modul & 42 Layar Referensi Garda

| Kode Modul | Nama Modul | Prefix Route | Jumlah Layar | Deskripsi Singkat |
|---|---|---|---|---|
| **AUTH** | Autentikasi | `/login` | 1 | Login portal BUJP, proteksi brute-force, sesi JWT |
| **DASH** | Dashboard Utama | `/dashboard` | 1 | Ringkasan KPI operasional satpam, klien, BKO, piutang, dan stok |
| **SEC** | Operasional Pengamanan | `/security/*` | 10 | Personel, Klien, Sites, Checkpoint QR, Roster Jadwal, BKO Request |
| **PSB** | Rekrutmen Satpam Baru | `/psb/admin/*` | 2 | Pelamar PSB, seleksi kandidat, konversi ke personel aktif |
| **LOG** | Logistik & Perlengkapan | `/logistics/*` | 5 | Gudang pusat, master seragam/alat, detail kartu stok, distribusi |
| **FIN** | Keuangan Operasional | `/finance/*` | 3 | Tagihan invoice klien bulanan, buat invoice, dan penggajian satpam |
| **ACC** | Akuntansi Inti | `/finance/accounting/*` | 4 | Bagan Akun (COA), tambah akun, daftar jurnal umum, input jurnal |
| **RPT** | Laporan & Analisa | `/finance/accounting/reports/*` | 8 | GL, Buku Pembantu Piutang, Neraca, Laba Rugi, Arus Kas, Ekuitas, Analisa Manajemen per Site, Balanced Scorecard BUJP |
| **SET** | Pengaturan & Organisasi | `/settings/*` | 8 | Identitas BUJP, Org Chart visual, manajemen pengguna, role matrix, backup |
| **TOTAL** | | | **42** | **Paritas Penuh 42 Halaman Referensi** |

---

## 4. Spesifikasi Fungsional Detail per Modul

### 4.1 Modul AUTH — Autentikasi (`/login`)
- **FR-AUTH-1 [D]**: Halaman login tunggal bertema gelap dengan 3 input (email/username, password, remember me), tombol submit, dan tautan reset password.
- **FR-AUTH-2 [I]**: Rate limiting proteksi brute-force: maksimal 5 kali kegagalan dalam 1 menit mengunci login akun/IP selama 60 detik (HTTP 429).
- **FR-AUTH-3 [I]**: Validasi status akun aktif (`is_active = true`). Jika dinonaktifkan oleh admin, akses ditolak dengan pesan kesalahan yang jelas.
- **FR-AUTH-4 [I]**: Pasca login sukses, arahkan ke `/dashboard`. Navigasi sidebar merender menu secara dinamis hanya untuk modul yang diizinkan oleh role pengguna.

### 4.2 Modul DASH — Dashboard Operasional BUJP (`/dashboard`)
- **FR-DASH-1 [D]**: Tampilan ringkasan metrik eksekutif, global search bar, tombol reload data, dan pemilih periode.
- **FR-DASH-2 [I]**: Kartu metrik utama menampilkan:
  - Jumlah personel aktif & personel dengan KTA kedaluwarsa ≤ 30 hari
  - Jumlah lokasi jaga (sites) aktif & klien mitra berjalan
  - Permintaan BKO menunggu persetujuan (*pending approval*)
  - Total piutang usaha klien jatuh tempo
  - Jumlah item perlengkapan logistik di bawah stok minimum
- **FR-DASH-3 [I]**: Setiap angka metrik berfungsi sebagai tautan langsung (*deep link*) ke modul terkait dengan filter yang telah terpasang.

### 4.3 Modul SEC — Operasional Pengamanan (10 Layar)
- **SEC-01 (`/security/personnel`) - Data Personil Security [D]**: Tabel master satpam dengan filter status, unit, sertifikasi Gada, pencarian nama/NIK/KTA. Penanda visual merah/kuning untuk KTA yang kedaluwarsa ≤ 30 hari.
- **SEC-02 (`/security/personnel/new` & `/security/personnel/edit/[id]`) - Input & Edit Personil [D]**: 19 field formulir lengkap: NIK, Nama Lengkap, Tempat Lahir, Tgl Lahir, Jenis Kelamin, Alamat, No Telepon, Email, No KTA Polri, Masa Berlaku KTA, Tingkat Kualifikasi Gada (Pratama/Madya/Utama), No Ijazah Gada, Jabatan, Tgl Bergabung, Status (Aktif/Cuti/Nonaktif), Lokasi Penempatan Jaga (Site ID), Nama Bank, No Rekening, Foto Personel.
- **SEC-03 (`/security/clients`) - Data Klien Mitra [D]**: Tabel daftar perusahaan mitra pengguna jasa pengamanan, kontak PIC, jumlah site, tanggal kontrak.
- **SEC-04 (`/security/clients/new`) - Registrasi Klien Baru [D]**: 7 field formulir: Nama Perusahaan, NPWP, Alamat Penagihan, Nama PIC, No Telp PIC, Email PIC, Tanggal Berakhir Kontrak Kerjasama.
- **SEC-05 (`/security/sites`) - Data Lokasi Jaga (Sites) [D]**: Tabel titik penempatan pos jaga satpam per klien, kuota personel per shift, tarif penagihan bulanan.
- **SEC-06 (`/security/sites/new`) - Tambah Lokasi Jaga Baru [D]**: 7 field: Relasi Klien, Nama Lokasi/Site, Alamat Lengkap Pos Jaga, Titik Koordinat GPS (Latitude, Longitude), Kuota Kebutuhan Personel per Shift, Tarif Bulanan per Personel, Status Operasional.
- **SEC-07 (`/security/checkpoints`) - Master Checkpoint [D]**: Pengelolaan titik patroli satpam per lokasi jaga, kode titik unik, nama checkpoint, urutan rute patroli, dan fitur ekspor/cetak kode QR untuk pemindaian lapangan.
- **SEC-08 (`/security/roster`) - Jadwal Jaga (Rostering) [D]**: Tampilan interaktif kalender/grid lokasi x tanggal yang menampilkan penugasan shift satpam (Pagi, Siang, Malam, Off).
- **SEC-09 (`/security/roster/new`) - Plotting Jadwal Baru [D]**: Form plotting jadwal shift satpam. Validasi ketat menolak penugasan jika personel telah terjadwal di shift tumpang tindih pada hari yang sama atau berstatus cuti/nonaktif.
- **SEC-10 (`/security/bko-requests`) - Persetujuan BKO Request [D]**: Pengelolaan izin Bantuan Kendali Operasi (BKO - mutasi penugasan temporer satpam ke site lain karena keadaan darurat/event). Alur status `menunggu` → `disetujui` / `ditolak`. Saat disetujui, sistem secara atomik memutakhirkan jadwal jaga di lokasi tujuan.

### 4.4 Modul PSB — Rekrutmen Satpam Baru (2 Layar)
- **PSB-01 (`/psb/admin/applicants`) - Data Pelamar PSB [D]**: Tabel pelamar calon satpam dengan filter status seleksi (`baru`, `seleksi_berkas`, `tes_fisik_kesamaptaan`, `wawancara`, `diterima`, `ditolak`).
- **PSB-02 (`/psb/admin/applicant-detail`) - Detail Kandidat [D]**: Formulir verifikasi dokumen pelamar (KTP, SKCK, Ijazah umum, Sertifikat Gada jika ada), input nilai tes, catatan rekruter, dan tombol aksi "Terima" / "Tolak".
- **FR-PSB-Konversi [I]**: Kandidat dengan status `diterima` dapat dikonversi menjadi draf personel satpam baru (SEC-02) dengan sekali klik tanpa perlu input ulang data identitas.

### 4.5 Modul LOG — Logistik & Perlengkapan Jaga (5 Layar)
- **LOG-01 (`/logistics/warehouse`) - Gudang Logistik Pusat [D]**: Tampilan inventaris barang perlengkapan satpam di gudang pusat, status stok, indikator peringatan stok menipis (< stok minimum).
- **LOG-02 & LOG-04 (`/logistics/items/new` & `/logistics/items/edit/[id]`) - Registrasi & Edit Item [D]**: 9 field: Kode Item Unik, Nama Barang, Kategori (Seragam PDH, Seragam PDL, Sepatu Boot, Kopel, Borgol, Tongkat T, Rompi, Senter, Handy Talky), Satuan, Ukuran (S/M/L/XL/XXL/All Size), Stok Awal, Batas Stok Minimum, Harga Satuan Perolehan, Keterangan.
- **LOG-03 (`/logistics/items/detail/[id]`) - Detail Barang & Kartu Stok [D]**: Informasi detail item dan tabel Kartu Stok kronologis (*stock card ledger*) yang mencatat setiap mutasi (masuk/keluar/penyesuaian), nomor bukti, pihak penerima, dan saldo berjalan (*running balance*).
- **LOG-05 (`/logistics/distribution`) - Distribusi Perlengkapan [D]**: Form pengeluaran barang perlengkapan kepada personel satpam perorangan atau dialokasikan langsung ke pos jaga (site). Validasi menolak distribusi jika kuantitas melebihi stok fisik tersedia. Pengeluaran logistik memicu pencatatan jurnal akuntansi secara otomatis: Debit Beban Perlengkapan Satpam, Kredit Persediaan Logistik.

### 4.6 Modul FIN — Keuangan Operasional (3 Layar)
- **FIN-01 (`/finance/invoices`) - Tagihan Klien (Invoicing) [D]**: Tabel daftar faktur tagihan jasa pengamanan ke klien mitra dengan status `draf` → `terbit` → `lunas` / `batal`. Tombol unduh faktur PDF dan kuitansi pembayaran.
- **FIN-02 (`/finance/invoice/new`) - Buat Invoice Baru [D]**: Formulir pembuatan faktur tagihan bulanan. Memilih klien mitra dan periode tagihan otomatis mengagregasi seluruh lokasi jaga (sites) aktif milik klien:
  $$\text{Subtotal} = \sum (\text{Jumlah Personel Satpam Aktif di Site} \times \text{Tarif Kontrak Bulanan per Personel})$$
  Ditambah Pajak Pertambahan Nilai (PPN 11% / 12% sesuai konfigurasi institusi) dan pengenaan pemotongan PPh Pasal 23 (2%).
  Saat status diubah menjadi `terbit`, sistem mengunci invoice dari pengeditan dan secara atomik memposting jurnal:
  - Debit: Piutang Usaha Klien
  - Kredit: Pendapatan Jasa Pengamanan
  - Kredit: Utang PPN Keluaran
- **FIN-03 (`/finance/payroll`) - Penggajian (Payroll) [D]**: Pemrosesan gaji bulanan personel satpam berdasarkan rekap presensi shift dan lokasi jaga:
  - Komponen Pendapatan: Gaji Pokok (UMP/UMK penempatan), Tunjangan Jabatan (Danru/Chief), Lembur (*overtime*).
  - Komponen Potongan: BPJS Ketenagakerjaan (JKK, JKM, JHT, JP), BPJS Kesehatan (1%), Potongan Angsuran Seragam/Kasbon, dan PPh 21.
  - Aksi "Posting Gaji" memicu pencatatan jurnal akuntansi otomatis:
    - Debit: Beban Gaji & Upah Satpam
    - Kredit: Utang Gaji Personel
    - Kredit: Utang Iuran BPJS Ketenagakerjaan & Kesehatan
    - Kredit: Utang PPh 21 Karyawan

### 4.7 Modul ACC — Akuntansi Inti (4 Layar)
- **ACC-01 (`/finance/accounting/coa`) - Chart of Accounts (Bagan Akun) [D]**: Pohon hierarki akun keuangan standar BUJP (Aset, Liabilitas, Ekuitas, Pendapatan Jasa, Beban Operasional, Beban Umum & Administrasi). Akun bawaan sistem (*system accounts*) ditandai khusus dan diproteksi dari penghapusan.
- **ACC-02 (`/finance/accounting/coa/new`) - Tambah Akun Baru [D]**: 6 field: Kode Akun (unik), Nama Akun, Kategori Klasifikasi, Saldo Normal (Debit / Kredit), Akun Induk (Parent ID), Status Aktif.
- **ACC-03 (`/finance/accounting/journals`) - Daftar Jurnal Umum [D]**: Tabel riwayat seluruh entri jurnal akuntansi dengan filter rentang tanggal, jenis sumber transaksi (Invoice, Payroll, Logistik, Penyesuaian Manual), dan status posting.
- **ACC-04 (`/finance/accounting/journals/new`) - Input Jurnal Umum [D]**: Editor baris jurnal double-entry interaktif. Memiliki header tanggal, nomor bukti voucher, deskripsi/memo, dan tabel baris multi-debit/kredit. Sistem memvalidasi secara live dan memblokir tombol simpan selama:
  $$\sum \text{Debit} \neq \sum \text{Kredit} \quad \text{atau} \quad \text{Total} \le 0$$
  Entri jurnal yang telah terposting berstatus *immutable* (tidak dapat diubah/dihapus; koreksi dilakukan melalui jurnal pembalik).

### 4.8 Modul RPT — Laporan Keuangan & Manajemen BUJP (8 Layar)
- **RPT-01 (`/finance/accounting/reports/ledger`) - Buku Besar (General Ledger) [D]**: Menampilkan mutasi transaksi per akun COA dalam rentang tanggal tertentu lengkap dengan saldo awal, mutasi debit/kredit, dan saldo akhir berjalan.
- **RPT-02 (`/finance/accounting/reports/receivables`) - Buku Pembantu Piutang Usaha [D]**: Rincian saldo piutang tagihan per masing-masing klien mitra (`?type=receivable`), riwayat faktur diterbitkan, pelunasan pembayaran, dan umur piutang (*aging receivables*).
- **RPT-03 (`/finance/accounting/reports/income-statement`) - Laporan Laba Rugi [D]**: Pendapatan operasional jasa pengamanan dikurangi Beban Pokok Pendapatan (Gaji Satpam, BPJS, Seragam/Logistik) menghasilkan Laba Kotor; dikurangi Beban Operasional & Adm/Umum menghasilkan Laba Bersih Periode Berjalan.
- **RPT-04 (`/finance/accounting/reports/balance-sheet`) - Laporan Posisi Keuangan (Neraca) [D]**: Neraca keuangan dengan validasi kepatuhan akuntansi:
  $$\text{Total Aset} = \text{Total Liabilitas} + \text{Total Ekuitas}$$
- **RPT-05 (`/finance/accounting/reports/equity-changes`) - Laporan Perubahan Ekuitas [D]**: Menampilkan modal awal, tambahan modal disetor, laba bersih periode berjalan dari Laba Rugi, dividen/prive, dan saldo modal akhir.
- **RPT-06 (`/finance/accounting/reports/cash-flow`) - Laporan Arus Kas [D]**: Laporan arus kas metode tidak langsung terbagi menjadi 3 aktivitas utama: Operasional (penerimaan klien, pembayaran gaji/operasional), Investasi, dan Pendanaan.
- **RPT-07 (`/finance/accounting/reports/management-analysis`) - Analisa Akuntansi Manajemen [D]**: Analisa profitabilitas per titik penempatan lokasi jaga (site profitability). Mengukur:
  $$\text{Profit Margin Site} = \text{Pendapatan Invoice Site} - \text{Total Biaya Gaji Satpam di Site} - \text{Biaya Alokasi Logistik Site}$$
- **RPT-08 (`/finance/accounting/reports/balanced-scorecard`) - Balanced Scorecard BUJP [D]**: Dashboard eksekutif performa perusahaan BUJP berbasis 4 perspektif:
  1. **Perspektif Keuangan**: Margin Laba Bersih, Rasio Lancar, Efektivitas Penagihan Invoice.
  2. **Perspektif Pelanggan/Klien**: Tingkat Retensi Klien Mitra, Pertumbuhan Jumlah Site Aktif.
  3. **Perspektif Proses Bisnis Internal**: Rasio Pemenuhan Kuota Personel per Shift (100% SLA), Tingkat Kepatuhan Patroli Checkpoint QR, Kecepatan Respon Insiden.
  4. **Perspektif Pembelajaran & Pertumbuhan**: Persentase Satpam Bersertifikasi Resmi Gada (Pratama/Madya/Utama), Rasio Personel dengan KTA Polri Aktif Valid.

### 4.9 Modul SET — Pengaturan Sistem & Identitas (8 Layar)
- **SET-01 (`/settings/institution`) - Identitas & Organisasi [D]**: Formulir 22 input profil BUJP: Nama Resmi PT, Nomor Izin Mabes Polri / Polda, NPWP Perusahaan, Alamat Kantor Pusat, Telepon, Email, Logo Institusi, Pengaturan Tarif PPN (11%/12%), dan Persentase Iuran BPJS.
- **SET-02 (`/settings/org-chart`) - Visual Struktur Organisasi [D]**: Visualisasi pohon bagan hierarki struktural manajemen dan divisi operasional BUJP menggunakan rendering grafis pohon hierarkis (`d3-hierarchy` SVG).
- **SET-03 & SET-04 (`/settings/users` & `/settings/users/new`) - Manajemen Pengguna [D]**: Pengelolaan akun staf internal BUJP (Nama, Email, Kata Sandi, Role Penugasan, Status Aktif). Administrator tidak dapat menonaktifkan akunnya sendiri.
- **SET-05, SET-06, SET-07 (`/settings/roles`, `/settings/roles/new`, `/settings/roles/edit/[id]`) - Manajemen Role & Izin [D]**: Matriks pengaturan peran khusus dengan 18 input: Nama Role, Deskripsi, dan 16 checkbox granular modul izin (8 modul x {`view`, `manage`}).
- **SET-08 (`/settings/backup`) - Manajemen Data & Backup [D]**: Pencatatan riwayat snapshot backup database, unduh file arsip, trigger backup manual, dan prosedur pemulihan (*restore*) dengan validasi pengaman ketik ulang nama institusi untuk mencegah kehilangan data tak sengaja.

---

## 5. Sistem Desain, Token UI & Aksesibilitas (WCAG 2.2 AA)

Sesuai spesifikasi di `docs/skills/`:
1. **Palet Warna Gelap (Dark Theme First)**:
   - Kanvas Aplikasi: `#000000`
   - Permukaan Komponen / Card: `#030712`, `#111827`, `#1f2937`
   - Warna Border: `#374151`
   - Warna Teks Utama: `#f9fafb`, Teks Sekunder: `#9ca3af`
   - Aksen Utama: Amber `#f59e0b` / `#d97706` (khas branding Garda BUJP)
   - Status Semantik: Sukses `#10b981`, Peringatan `#f59e0b`, Bahaya/Error `#f87171`
2. **7 State Interaksi Komponen**: Setiap tombol, input, select, dan elemen interaktif wajib mendefinisikan 7 status visual:
   - `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error` (`aria-invalid="true"`).
3. **Standar Aksesibilitas WCAG 2.2 AA**:
   - Seluruh elemen dapat dijangkau dan dioperasikan menggunakan keyboard (Tab, Enter, Space, Escape, Panah).
   - Indikator fokus outline dengan kontras visual tinggi (minimal rasio kontras 3:1 terhadap latar belakang gelap).
   - Validasi formulir menyertakan pesan kesalahan teks eksplisit yang dihubungkan ke field melalui atribut `aria-describedby`.
4. **Prinsip Bebas AI Slop**: Desain profesional, padat, berorientasi tindakan fungsional, tanpa ornamen dekoratif generik yang tidak bernilai guna bisnis.

---

## 6. Kriteria Penerimaan & Verifikasi Integritas

| ID | Modul | Kriteria Penerimaan Wajib |
|---|---|---|
| **AC-G-1** | Global | Seluruh 42 layar referensi merespons dengan benar dan terproteksi oleh middleware otorisasi RBAC (HTTP 403 jika izin tidak sesuai). |
| **AC-G-2** | Global | Tidak ada pelanggaran aksesibilitas level *serious* atau *critical* pada audit axe-core di seluruh halaman. |
| **AC-G-3** | Global | Tampilan responsif pada resolusi 375px+ tanpa adanya scroll horizontal di level halaman utama. |
| **AC-SEC-1** | SEC | Pendaftaran personel dengan nomor KTA atau NIK yang telah terdaftar ditolak oleh validasi database constraint. |
| **AC-SEC-2** | SEC | Plotting jadwal shift jaga menolak penugasan yang tumpang tindih untuk personel yang sama pada tanggal yang identik. |
| **AC-SEC-3** | SEC | Persetujuan penugasan BKO secara atomik membatalkan shift di site asal dan menerbitkan jadwal shift di site tujuan BKO. |
| **AC-LOG-1** | LOG | Distribusi perlengkapan menolak pengeluaran jika jumlah barang > stok fisik tersedia di gudang. Distribusi valid memicu kartu stok dan jurnal akuntansi. |
| **AC-FIN-1** | FIN | Penerbitan invoice menghitung subtotal berbasis agregasi personel aktif per site x tarif bulanan, serta memposting jurnal double-entry otomatis secara atomik. |
| **AC-FIN-2** | FIN | Pemrosesan payroll mengalkulasi gaji, tunjangan, dan potongan BPJS/PPh 21, serta mencatat kewajiban utang gaji dan beban pada jurnal umum. |
| **AC-ACC-1** | ACC | Validasi jurnal menolak posting jika total debit $\neq$ total kredit atau total transaksi $\le 0$. Selisih balance ditampilkan secara real-time. |
| **AC-RPT-1** | RPT | Neraca keuangan selalu berada dalam kondisi seimbang: $\text{Total Aset} = \text{Total Liabilitas} + \text{Total Ekuitas}$ untuk setiap periode buku. |
| **AC-RPT-2** | RPT | Saldo akhir Buku Pembantu Piutang Usaha klien identik dengan saldo akun Piutang Usaha pada Buku Besar di tanggal yang sama. |
