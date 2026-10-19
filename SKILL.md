---
name: garda-erp-workflow
description: Aturan kerja dan peta konteks untuk membangun Garda ERP (BUJP). Gunakan di awal setiap tugas di repositori ini untuk menentukan berkas Skill/, Design/, PRD, dan TECH_SPEC mana yang harus dibaca sebelum menulis kode, komponen UI, migrasi, atau dokumentasi.
---

# SKILL — Aturan Kerja dan Panduan Operasional Garda ERP

Dokumen ini mengatur cara agen AI bekerja di repositori Garda ERP. Isinya: urutan baca dokumen, aturan wajib, peta "konteks pekerjaan → berkas yang dibaca", dan prosedur per jenis tugas.

| Dokumen | Pertanyaan yang Dijawab |
|---|---|
| [PRD.md](PRD.md) | Apa yang dibangun dan kapan dianggap selesai (FR-*, AC-*) |
| [TECH_SPEC.md](TECH_SPEC.md) | Bagaimana membangunnya (stack, skema, RBAC, token, indeks halaman) |
| [TASK.md](TASK.md) | Apa yang dikerjakan sekarang |
| `Skill/*.md` (42 berkas) | Aturan desain dan token per halaman, ditulis sebagai instruksi untuk agen |
| `Design/*.md` (42 berkas) | Isi yang sama dengan `Skill/`, ditambah kepadatan komponen dan diagnostik ekstraksi |
| [`.agents/skills/anti-slop/`](.agents/skills/anti-slop/SKILL.md) | Cara mendeteksi dan membersihkan pola generik di teks, kode, dan desain |

---

## 1. Protokol Memulai Tugas

Jalankan langkah ini secara berurutan setiap kali menerima tugas.

1. **Temukan tugas di [TASK.md](TASK.md).** Catat ID tugas (contoh `T2.SEC.03`). Jika permintaan pengguna tidak ada di TASK.md, tambahkan sebagai tugas baru di fase yang sesuai sebelum mulai.
2. **Periksa prasyarat.** Semua tugas yang disebut di kolom "Bergantung" harus sudah dicentang. Jika belum, beri tahu pengguna dan kerjakan prasyaratnya terlebih dahulu atau minta izin untuk melewatinya.
3. **Baca kebutuhan.** Buka bagian PRD untuk modul terkait (§5.x) dan kriteria penerimaannya (§7).
4. **Baca spesifikasi teknis.** Buka TECH_SPEC §6 (tabel yang disentuh), §7 (izin), §8 (jika ada posting jurnal), dan §9 (jika ada UI).
5. **Muat berkas desain sesuai peta di §3.** Baca berkas `Skill/` untuk aturan, lalu baris "known page component density" di berkas `Design/` pasangannya untuk jumlah elemen.
6. **Kerjakan, uji, lalu centang** tugas di TASK.md hanya setelah semua butir Definition of Done (§7) terpenuhi.

## 2. Aturan Wajib

Kata "wajib" berarti tidak bisa ditawar. "Sebaiknya" berarti boleh menyimpang dengan alasan tertulis di deskripsi commit.

### 2.1 Berkas Sumber

- Berkas di `Design/` dan `Skill/` **wajib tidak dihapus, diganti nama, atau diedit**. Keduanya adalah bukti hasil ekstraksi dari aplikasi referensi.
- Nama folder wajib ditulis persis `Design/` dan `Skill/` di kode, skrip, dan dokumen.
- Berkas `Design/Data Personel.md` dan `Skill/Data Personil Security.md` adalah pasangan untuk halaman SEC-01, meskipun namanya berbeda.

### 2.2 Prioritas Saat Sumber Bertentangan

Jika dua sumber memberi jawaban berbeda, pakai yang lebih atas:

1. Kriteria penerimaan di PRD §7.
2. Batasan kontras di TECH_SPEC §9.3.
3. Token global di TECH_SPEC §9.2 dan katalog komponen di §9.4.
4. Aturan "Rules: Do / Don't" dan "Quality Gates" di berkas `Skill/` (seragam di 42 berkas).
5. Nilai token per halaman di berkas `Skill/` / `Design/`.

Contoh: `Skill/PORTAL LOGIN.md` memakai teks putih di atas `#d97706` (rasio 3.19:1). TECH_SPEC §9.3 melarangnya, jadi tombol login memakai `fg-on-accent` (#030712).

### 2.3 Token dan Gaya

- Nilai hex, `rgb()`, dan nilai arbitrer Tailwind wajib hanya ada di `resources/css/tokens.css`. `npm run lint:tokens` wajib lulus.
- Nilai token di berkas `Skill/` **wajib tidak disalin langsung ke komponen**. Cari nilai hex tersebut di TECH_SPEC §9.2, lalu pakai nama token globalnya. Jika nilai tidak ada di §9.2, nilai itu adalah artefak ekstraksi (lihat §6) dan tidak dipakai.
- Setiap komponen interaktif wajib memiliki 7 state: default, hover, focus-visible, active, disabled, loading, error.
- Label aksi wajib deskriptif: "Simpan Personel", "Setujui BKO", "Terbitkan Invoice". Dilarang: "OK", "Submit", "Klik di sini".

### 2.4 Backend dan Data

- Baris jurnal wajib dibentuk oleh `JournalPostingService` di backend. Klien tidak pernah mengirim baris debit/kredit untuk transaksi otomatis (TECH_SPEC ADR-07).
- Setiap service yang mengubah lebih dari satu tabel wajib membungkus perubahan dalam `DB::transaction`.
- Uang wajib memakai `numeric(18,2)` dan `bcmath`. Dilarang `float`.
- Setiap route baru wajib memiliki middleware izin dan feature test 200/403/302.
- Tarif (PPN, BPJS, lembur) wajib dibaca dari `institution_settings`, tidak ditulis langsung di kode.

### 2.5 Kebutuhan Berlabel [I]

Kebutuhan berlabel **[I]** di PRD adalah hasil inferensi. Saat mengerjakan tugas pertama sebuah modul, sampaikan daftar kebutuhan [I] modul tersebut kepada pengguna dan tanyakan apakah sudah sesuai. Jika pengguna tidak menjawab, pakai nilai default di PRD §9 dan catat di deskripsi commit.

## 3. Peta Konteks → Berkas

### 3.1 Berdasarkan Halaman atau Route

Gunakan tabel ini saat tugas menyebut halaman, route, atau ID halaman. Kolom "Skill" dibaca untuk aturan dan token. Kolom "Design" dibaca untuk kepadatan komponen. Kolom "PRD" dan "TECH_SPEC" menunjuk bagian yang wajib dibaca.

| Konteks Pekerjaan | Route | Skill | Design | PRD | TECH_SPEC |
|---|---|---|---|---|---|
| Login, sesi, rate limit | `/login` | [PORTAL LOGIN](<Skill/PORTAL LOGIN.md>) | [PORTAL LOGIN](<Design/PORTAL LOGIN.md>) | §5.1, AC-AUTH-* | §7, §9.5 (Tamu) |
| Dashboard, kartu ringkasan, pencarian global | `/dashboard` | [Dashboard](<Skill/Dashboard.md>) | [Dashboard](<Design/Dashboard.md>) | §5.2, AC-DASH-1 | §7, §9.5 |
| Daftar personel, status KTA/Gada | `/security/personnels` | [Data Personil Security](<Skill/Data Personil Security.md>) | [Data Personel](<Design/Data Personel.md>) | FR-SEC-1, 3 | §6.2 `personnel` |
| Formulir personel (tambah/edit) | `/security/personnels/new` | [Input Personil Baru](<Skill/Input Personil Baru.md>) | [Input Personil Baru](<Design/Input Personil Baru.md>) | FR-SEC-2, AC-SEC-1 | §6.2 `personnel` |
| Daftar klien | `/security/clients` | [Data Klien Mitra](<Skill/Data Klien Mitra.md>) | [Data Klien Mitra](<Design/Data Klien Mitra.md>) | FR-SEC-4 | §6.2 `clients` |
| Formulir klien | `/security/clients/new` | [Registrasi Klien Baru](<Skill/Registrasi Klien Baru.md>) | [Registrasi Klien Baru](<Design/Registrasi Klien Baru.md>) | FR-SEC-5 | §6.2 `clients` |
| Daftar lokasi jaga | `/security/sites` | [Data Lokasi Jaga (Sites)](<Skill/Data Lokasi Jaga (Sites).md>) | [Data Lokasi Jaga (Sites)](<Design/Data Lokasi Jaga (Sites).md>) | FR-SEC-6, AC-SEC-4 | §6.2 `sites` |
| Formulir lokasi jaga, tarif, koordinat | `/security/sites/new` | [Tambah Lokasi Jaga Baru](<Skill/Tambah Lokasi Jaga Baru.md>) | [Tambah Lokasi Jaga Baru](<Design/Tambah Lokasi Jaga Baru.md>) | FR-SEC-7 | §6.2 `sites` |
| Checkpoint patroli, QR | `/security/checkpoints` | [Master Checkpoint](<Skill/Master Checkpoint.md>) | [Master Checkpoint](<Design/Master Checkpoint.md>) | FR-SEC-8, 9 | §6.2 `checkpoints` |
| Grid jadwal jaga | `/security/rostering` | [Jadwal Jaga (Rostering)](<Skill/Jadwal Jaga (Rostering).md>) | [Jadwal Jaga (Rostering)](<Design/Jadwal Jaga (Rostering).md>) | FR-SEC-10, 11 | §6.2 `roster_assignments` |
| Plotting jadwal, deteksi bentrok | `/security/rostering/new` | [Plotting Jadwal Baru](<Skill/Plotting Jadwal Baru.md>) | [Plotting Jadwal Baru](<Design/Plotting Jadwal Baru.md>) | FR-SEC-12, AC-SEC-2 | §6.2 `roster_assignments`, `shifts` |
| Persetujuan BKO | `/security/bko` | [Persetujuan BKO Request](<Skill/Persetujuan BKO Request.md>) | [Persetujuan BKO Request](<Design/Persetujuan BKO Request.md>) | FR-SEC-14, AC-SEC-3 | §6.2 `bko_requests`, §8.2 |
| Daftar pelamar | `/psb/admin` | [Data Pelamar (PSB)](<Skill/Data Pelamar (PSB).md>) | [Data Pelamar (PSB)](<Design/Data Pelamar (PSB).md>) | FR-PSB-1 | §6.2 `applicants` |
| Detail kandidat, konversi ke personel | `/psb/admin/detail/{id}` | [Detail Kandidat](<Skill/Detail Kandidat.md>) | [Detail Kandidat](<Design/Detail Kandidat.md>) | FR-PSB-2–4, AC-PSB-1 | §6.2 `applicants`, `personnel` |
| Daftar stok gudang | `/logistics/warehouse` | [Gudang Logistik Pusat](<Skill/Gudang Logistik Pusat.md>) | [Gudang Logistik Pusat](<Design/Gudang Logistik Pusat.md>) | FR-LOG-1, AC-LOG-2 | §6.2 `items` |
| Registrasi barang | `/logistics/items/new` | [Registrasi Item Baru](<Skill/Registrasi Item Baru.md>) | [Registrasi Item Baru](<Design/Registrasi Item Baru.md>) | FR-LOG-2, 3 | §6.2 `items`, §8.1 |
| Detail barang, kartu stok | `/logistics/items/detail/{id}` | [Detail Barang](<Skill/Detail Barang.md>) | [Detail Barang](<Design/Detail Barang.md>) | FR-LOG-4, 5 | §6.2 `stock_movements` |
| Edit barang | `/logistics/items/edit/{id}` | [Edit Barang](<Skill/Edit Barang.md>) | [Edit Barang](<Design/Edit Barang.md>) | FR-LOG-2 | §6.2 `items` |
| Distribusi barang | `/logistics/distribute` | [Distribusi](<Skill/Distribusi.md>) | [Distribusi](<Design/Distribusi.md>) | FR-LOG-6, 7, AC-LOG-1 | §6.2 `distributions`, §8.1 |
| Daftar invoice, pembayaran | `/finance/invoices` | [Tagihan Klien (Invoicing)](<Skill/Tagihan Klien (Invoicing).md>) | [Tagihan Klien (Invoicing)](<Design/Tagihan Klien (Invoicing).md>) | FR-FIN-1, 4 | §6.2 `invoices`, §8.1 |
| Buat invoice | `/finance/invoice/new` | [Buat Invoice Baru](<Skill/Buat Invoice Baru.md>) | [Buat Invoice Baru](<Design/Buat Invoice Baru.md>) | FR-FIN-2, 3, AC-FIN-1, 2 | §6.2 `invoice_lines`, §8.1 |
| Payroll, slip gaji | `/finance/payroll` | [Penggajian (Payroll)](<Skill/Penggajian (Payroll).md>) | [Penggajian (Payroll)](<Design/Penggajian (Payroll).md>) | FR-FIN-5, 6, AC-FIN-3 | §6.2 `payroll_runs`, §8.1 |
| Bagan akun (pohon) | `/finance/accounting/coa` | [Chart of Accounts](<Skill/Chart of Accounts.md>) | [Chart of Accounts](<Design/Chart of Accounts.md>) | FR-ACC-1, AC-ACC-2 | §6.2 `accounts`, §6.3 |
| Tambah akun | `/finance/accounting/coa/new` | [Tambah Akun Baru](<Skill/Tambah Akun Baru.md>) | [Tambah Akun Baru](<Design/Tambah Akun Baru.md>) | FR-ACC-2, 3, AC-ACC-3 | §6.2 `accounts` |
| Daftar jurnal | `/finance/accounting/journals` | [Jurnal Umum](<Skill/Jurnal Umum.md>) | [Jurnal Umum](<Design/Jurnal Umum.md>) | FR-ACC-4, 6 | §6.2 `journal_entries` |
| Input jurnal, editor baris debit-kredit | `/finance/accounting/journals/new` | [Input Jurnal Umum](<Skill/Input Jurnal Umum.md>) | [Input Jurnal Umum](<Design/Input Jurnal Umum.md>) | FR-ACC-5, AC-ACC-1 | §6.2 `journal_lines` |
| Buku besar | `…/reports/general-ledger` | [Buku Besar (General Ledger)](<Skill/Buku Besar (General Ledger).md>) | [Buku Besar (General Ledger)](<Design/Buku Besar (General Ledger).md>) | FR-RPT-1 | §8.3 |
| Buku pembantu piutang | `…/reports/subsidiary-ledger?type=receivable` | [Buku Pembantu Piutang Usaha](<Skill/Buku Pembantu Piutang Usaha.md>) | [Buku Pembantu Piutang Usaha](<Design/Buku Pembantu Piutang Usaha.md>) | FR-RPT-2, AC-RPT-4 | §8.3 |
| Laba rugi | `…/reports/profit-loss` | [Laporan Laba Rugi](<Skill/Laporan Laba Rugi.md>) | [Laporan Laba Rugi](<Design/Laporan Laba Rugi.md>) | FR-RPT-3, 4, AC-RPT-2 | §8.3 |
| Neraca | `…/reports/balance-sheet` | [Laporan Posisi Keuangan (Neraca)](<Skill/Laporan Posisi Keuangan (Neraca).md>) | [Laporan Posisi Keuangan (Neraca)](<Design/Laporan Posisi Keuangan (Neraca).md>) | FR-RPT-3, 4, AC-RPT-1 | §8.3 |
| Perubahan ekuitas | `…/reports/equity-changes` | [Laporan Perubahan Ekuitas](<Skill/Laporan Perubahan Ekuitas.md>) | [Laporan Perubahan Ekuitas](<Design/Laporan Perubahan Ekuitas.md>) | FR-RPT-3, 4, AC-RPT-2 | §8.3 |
| Arus kas | `…/reports/cash-flow` | [Laporan Arus Kas](<Skill/Laporan Arus Kas.md>) | [Laporan Arus Kas](<Design/Laporan Arus Kas.md>) | FR-RPT-3, 4, AC-RPT-3 | §6.3, §8.3 |
| Profitabilitas per lokasi | `…/reports/management` | [Analisa Akuntansi Manajemen](<Skill/Analisa Akuntansi Manajemen.md>) | [Analisa Akuntansi Manajemen](<Design/Analisa Akuntansi Manajemen.md>) | FR-RPT-6, 7 | §8.3 |
| Balanced Scorecard | `…/reports/balanced-scorecard` | [Balanced Scorecard BUJP](<Skill/Balanced Scorecard BUJP.md>) | [Balanced Scorecard BUJP](<Design/Balanced Scorecard BUJP.md>) | FR-RPT-8, 9 | §8.3 |
| Profil institusi, struktur unit | `/settings/institution` | [Identitas & Organisasi](<Skill/Identitas & Organisasi.md>) | [Identitas & Organisasi](<Design/Identitas & Organisasi.md>) | FR-SET-1, 2 | §6.2 `institution_settings`, `org_units` |
| Bagan organisasi | `/settings/institution/visual` | [Visual Struktur Organisasi](<Skill/Visual Struktur Organisasi.md>) | [Visual Struktur Organisasi](<Design/Visual Struktur Organisasi.md>) | FR-SET-3, AC-SET-4 | §4.3 `d3-hierarchy` |
| Daftar pengguna | `/settings/users` | [Manajemen Pengguna](<Skill/Manajemen Pengguna.md>) | [Manajemen Pengguna](<Design/Manajemen Pengguna.md>) | FR-SET-4, AC-SET-3 | §7 |
| Tambah pengguna | `/settings/users/new` | [Tambah Pengguna Baru](<Skill/Tambah Pengguna Baru.md>) | [Tambah Pengguna Baru](<Design/Tambah Pengguna Baru.md>) | FR-SET-5 | §7 |
| Daftar role | `/settings/roles` | [Manajemen Role & Izin](<Skill/Manajemen Role & Izin.md>) | [Manajemen Role & Izin](<Design/Manajemen Role & Izin.md>) | FR-SET-6 | §7 |
| Buat role, matriks izin | `/settings/roles/new` | [Buat Role Baru](<Skill/Buat Role Baru.md>) | [Buat Role Baru](<Design/Buat Role Baru.md>) | FR-SET-7, AC-SET-1 | §7 |
| Edit role | `/settings/roles/edit/{id}` | [Edit Role](<Skill/Edit Role.md>) | [Edit Role](<Design/Edit Role.md>) | FR-SET-7, AC-SET-3 | §7 |
| Backup, pemulihan, ekspor data | `/settings/data` | [Manajemen Data & Backup](<Skill/Manajemen Data & Backup.md>) | [Manajemen Data & Backup](<Design/Manajemen Data & Backup.md>) | FR-SET-8, 9, AC-SET-2 | §4.2 `spatie/laravel-backup`, §12.2 |

### 3.2 Berdasarkan Jenis Pekerjaan Lintas Halaman

Untuk komponen bersama, baca halaman yang paling banyak memakai komponen tersebut (berdasarkan kepadatan di `Design/`). Halaman-halaman ini memberi kasus tepi terberat.

| Pekerjaan | Berkas Skill yang Dibaca | Alasan Pemilihan |
|---|---|---|
| Token global, `tokens.css` | [Dashboard](<Skill/Dashboard.md>), [PORTAL LOGIN](<Skill/PORTAL LOGIN.md>), [Chart of Accounts](<Skill/Chart of Accounts.md>) | Dashboard menjadi sumber palet aksen amber; Login menjadi sumber tipografi 16/400 dan `shadow-accent`; COA menjadi sumber weight 400 untuk teks tabel |
| `AppLayout`, sidebar, navigasi | [Dashboard](<Skill/Dashboard.md>), [Chart of Accounts](<Skill/Chart of Accounts.md>), [Buat Role Baru](<Skill/Buat Role Baru.md>) | Sidebar ada di 41 halaman; COA punya tautan terbanyak (96); Buat Role punya 2 elemen navigasi |
| `DataTable`, pagination, filter | [Chart of Accounts](<Skill/Chart of Accounts.md>), [Gudang Logistik Pusat](<Skill/Gudang Logistik Pusat.md>), [Data Lokasi Jaga (Sites)](<Skill/Data Lokasi Jaga (Sites).md>) | Tabel dengan 96 dan 72 tautan; Sites punya 15 tombol aksi per baris |
| Field formulir, validasi, layout 2 kolom | [Identitas & Organisasi](<Skill/Identitas & Organisasi.md>), [Input Personil Baru](<Skill/Input Personil Baru.md>), [Buat Role Baru](<Skill/Buat Role Baru.md>) | Input terbanyak: 22, 19, 18 |
| `Checkbox`, matriks izin | [Buat Role Baru](<Skill/Buat Role Baru.md>), [Edit Role](<Skill/Edit Role.md>) | 18 input + list per halaman |
| `Badge` status | [Persetujuan BKO Request](<Skill/Persetujuan BKO Request.md>), [Master Checkpoint](<Skill/Master Checkpoint.md>), [Tagihan Klien (Invoicing)](<Skill/Tagihan Klien (Invoicing).md>) | Satu-satunya halaman dengan `#d1fae5` (sukses) dan `#fffbeb` (peringatan); invoice punya 4 status |
| Varian `info-solid` (indigo) | [Detail Barang](<Skill/Detail Barang.md>), [Distribusi](<Skill/Distribusi.md>), [Analisa Akuntansi Manajemen](<Skill/Analisa Akuntansi Manajemen.md>) | Halaman yang memuat `#4f46e5` / bayangan indigo |
| `Modal`, dropdown, `shadow-overlay` | [Data Klien Mitra](<Skill/Data Klien Mitra.md>), [Manajemen Pengguna](<Skill/Manajemen Pengguna.md>), [Gudang Logistik Pusat](<Skill/Gudang Logistik Pusat.md>) | Halaman daftar dengan bayangan `rgba(15, 23, 42, 0.2)` |
| `StatCard`, `Card` | [Dashboard](<Skill/Dashboard.md>), [Data Personil Security](<Skill/Data Personil Security.md>), [Manajemen Data & Backup](<Skill/Manajemen Data & Backup.md>), [Tambah Pengguna Baru](<Skill/Tambah Pengguna Baru.md>) | 4 halaman dengan `cards (1)` |
| Pola halaman Laporan | [Buku Besar (General Ledger)](<Skill/Buku Besar (General Ledger).md>), [Laporan Arus Kas](<Skill/Laporan Arus Kas.md>), [Laporan Posisi Keuangan (Neraca)](<Skill/Laporan Posisi Keuangan (Neraca).md>) | Kombinasi input periode + tombol ekspor + tabel |
| Komponen visual (grid, bagan) | [Jadwal Jaga (Rostering)](<Skill/Jadwal Jaga (Rostering).md>), [Visual Struktur Organisasi](<Skill/Visual Struktur Organisasi.md>), [Balanced Scorecard BUJP](<Skill/Balanced Scorecard BUJP.md>) | Halaman tanpa tabel dengan kontrol tampilan |
| Aksesibilitas umum, QA checklist | Bagian "Accessibility" dan "Quality Gates" di berkas `Skill/` mana pun | Isinya identik di 42 berkas |

### 3.3 Berdasarkan Istilah dalam Permintaan

Jika permintaan pengguna tidak menyebut halaman, cocokkan istilah berikut.

| Istilah | Halaman (ID TECH_SPEC §10) |
|---|---|
| satpam, personel, personil, anggota, KTA, Gada, NIK | SEC-01, SEC-02 |
| klien, mitra, kontrak, PIC | SEC-03, SEC-04 |
| lokasi, pos jaga, site, tarif | SEC-05, SEC-06 |
| checkpoint, patroli, QR | SEC-07 |
| jadwal, shift, roster, plotting, bentrok | SEC-08, SEC-09 |
| BKO, bantuan personel, penugasan sementara | SEC-10 |
| PSB, pelamar, kandidat, rekrutmen, seleksi | PSB-01, PSB-02 |
| gudang, stok, barang, seragam, perlengkapan, kartu stok | LOG-01 s.d. LOG-04 |
| distribusi, pengeluaran barang | LOG-05 |
| invoice, tagihan, faktur, PPN, piutang, pembayaran | FIN-01, FIN-02, RPT-02 |
| gaji, payroll, slip, BPJS, PPh 21, lembur | FIN-03 |
| akun, COA, bagan akun, kode akun | ACC-01, ACC-02 |
| jurnal, debit, kredit, posting, jurnal pembalik | ACC-03, ACC-04 |
| buku besar, neraca, laba rugi, ekuitas, arus kas | RPT-01, RPT-03 s.d. RPT-06 |
| margin per lokasi, analisa biaya | RPT-07 |
| BSC, KPI, scorecard | RPT-08 |
| profil perusahaan, logo, izin operasional, struktur organisasi | SET-01, SET-02 |
| pengguna, user, akun login | SET-03, SET-04 |
| role, izin, hak akses, permission | SET-05 s.d. SET-07 |
| backup, restore, pulihkan, ekspor data | SET-08 |

## 4. Cara Membaca Berkas `Skill/` dan `Design/`

Setiap berkas memiliki struktur yang sama. Ambil bagian yang relevan dan abaikan sisanya.

| Bagian | Tindakan |
|---|---|
| Frontmatter `name` (hanya `Skill/`) | Pakai sebagai identitas halaman saat menulis commit atau komentar PR |
| `## Brand` → `URL` | Konfirmasi route halaman (sama dengan TECH_SPEC §10) |
| `## Style Foundations` | Hanya sebagai bukti. Petakan setiap hex ke token global TECH_SPEC §9.2 |
| `## Accessibility`, `## Rules: Do/Don't`, `## Quality Gates` | Wajib dipatuhi. Isinya seragam di 42 berkas |
| `## Guideline Authoring Workflow`, `## Required Output Structure` | Dipakai saat menulis dokumentasi komponen (`resources/js/Components/ui/*.md`) |
| `Include known page component density` (hanya `Design/`) | Jumlah minimum elemen per jenis yang harus ada di halaman |
| `Extraction diagnostics` (hanya `Design/`) | Abaikan untuk implementasi. Menjelaskan kenapa audiens/brand perlu diverifikasi |

## 5. Kualitas (Anti-Slop)

Skill [anti-slop](.agents/skills/anti-slop/SKILL.md) terpasang di `.agents/skills/anti-slop/`. Baca berkas referensinya sesuai jenis pekerjaan:

| Pekerjaan | Baca | Jalankan |
|---|---|---|
| Menulis atau mengedit dokumen Markdown berbahasa Inggris | [text-patterns.md](.agents/skills/anti-slop/references/text-patterns.md) | `python .agents/skills/anti-slop/scripts/detect_slop.py <berkas> --verbose` (skor wajib ≤ 30) |
| Menulis teks berbahasa Indonesia (UI, PRD, pesan error) | [text-patterns.md](.agents/skills/anti-slop/references/text-patterns.md) sebagai panduan manual | Tidak ada skrip; pola deteksi skrip dioptimalkan untuk bahasa Inggris. Tinjau manual. |
| Menulis atau me-review kode PHP/TypeScript | [code-patterns.md](.agents/skills/anti-slop/references/code-patterns.md) | Tinjau manual |
| Membuat halaman atau komponen UI | [design-patterns.md](.agents/skills/anti-slop/references/design-patterns.md) | Tinjau manual |

Aturan yang paling sering relevan di proyek ini:

- Nama variabel menyebut isinya: `$issuedInvoice`, `$overlappingAssignments`, bukan `$data`, `$result`, `$temp`.
- Nama method = kata kerja + objek: `InvoiceService::issue()`, `RosterService::detectOverlap()`, bukan `handle()` atau `process()`.
- Komentar menjelaskan **alasan** (contoh: kenapa shift malam dihitung ke tanggal mulai), bukan mengulang kode.
- Teks UI spesifik: "Belum ada personel. Tambahkan personel pertama." bukan "Tidak ada data."
- Tidak ada gradien dekoratif, glassmorphism, atau ilustrasi stok. Desain referensi datar, gelap, dan berbasis konten.
- Teks dimulai dari inti. Tanpa pembuka seperti "Pada dokumen ini kita akan…".

## 6. Artefak Ekstraksi yang Diabaikan

Nilai berikut muncul di berkas `Skill/`/`Design/` tetapi bukan bagian dari desain.

| Artefak | Muncul di | Alasan Diabaikan |
|---|---|---|
| `color.border.default=#e5e7eb` | 42 berkas | Warna border preflight Tailwind; tidak terlihat di tema gelap |
| `color.surface.muted=#ffffff` / `#f8fafc` / `#f1f5f9` | Halaman formulir | Ekstraktor mengira warna teks/field sebagai permukaan |
| Teks `#475569`, `#334155` | 14 berkas | Gagal kontras AA (TECH_SPEC §9.3) |
| `space.8=103.5px`, `space.1=1px` | Gudang Logistik Pusat, Tambah Pengguna Baru | Ukuran elemen tunggal, bukan skala spasi |
| `font.size.xs=8px`, `font.size.md=11px` | Tambah Pengguna Baru, Visual Struktur Organisasi | Hanya di 1 halaman masing-masing |
| Audiens "developers and technical teams", permukaan "documentation site" | PORTAL LOGIN | Diagnostik confidence rendah; halaman ini adalah login aplikasi |

## 7. Definition of Done

Sebuah tugas di TASK.md boleh dicentang jika semua butir berlaku sudah terpenuhi:

- [ ] Kriteria penerimaan PRD yang dirujuk tugas lulus dan dibuktikan dengan test otomatis.
- [ ] `composer test`, `npm run test`, `npm run lint`, `npm run lint:tokens`, `tsc --noEmit`, dan `vendor/bin/phpstan` lulus tanpa error.
- [ ] Halaman baru: test axe lulus (0 pelanggaran serious/critical), urutan Tab sesuai urutan visual, dan tidak ada scroll horizontal di lebar 375 px.
- [ ] Komponen baru: 7 state diimplementasikan dan diuji.
- [ ] Route baru: feature test 200 / 403 / 302.
- [ ] Aksi tulis baru: menghasilkan entri log aktivitas.
- [ ] Transaksi yang mempengaruhi keuangan: jurnal seimbang dan test integritas laporan (AC-RPT-1 s.d. 4) tetap lulus.
- [ ] Jumlah elemen di halaman tidak kurang dari kepadatan di berkas `Design/` (kecuali tautan sidebar, yang dihitung sekali di `AppLayout`).
- [ ] Teks UI dan nama kode lolos tinjauan anti-slop (§5).
- [ ] Kotak tugas di TASK.md dicentang dan ID tugas disebut di pesan commit, contoh `feat(security): plotting jadwal dengan deteksi bentrok [T2.SEC.05]`.

## 8. Pemutakhiran Dokumen

| Kejadian | Dokumen yang Diperbarui |
|---|---|
| Pengguna menjawab pertanyaan validasi PRD §9 | PRD: ganti label [I] menjadi [D] pada kebutuhan terkait, hapus baris dari §9 |
| Kolom atau tabel baru | TECH_SPEC §6.2 |
| Izin baru | TECH_SPEC §7 dan seeder `RolePermissionSeeder` |
| Token baru | TECH_SPEC §9.2 dan §9.3 (hitung rasio kontras sebelum menambah warna) |
| Route baru di luar desain | TECH_SPEC §10.2 |
| Tugas baru atau tugas dipecah | TASK.md, di fase yang sesuai, dengan ID lanjutan |

Berkas `Design/` dan `Skill/` tidak pernah diperbarui. Jika aplikasi referensi berubah, ekstraksi ulang ditempatkan di folder baru dan perbedaannya dicatat di TECH_SPEC §9.1.
