# PRD — Garda ERP untuk Badan Usaha Jasa Pengamanan (BUJP)

| Atribut | Nilai |
|---|---|
| Produk | Garda — ERP untuk BUJP (perusahaan jasa satpam) |
| Aplikasi referensi | `https://garda.katalangit.com` |
| Versi dokumen | 1.0 — 5 Oktober 2026 |
| Sumber | 42 berkas [`Design/`](Design/) + 42 berkas [`Skill/`](Skill/) (hasil ekstraksi typeui.sh per halaman) |
| Dokumen terkait | [TECH_SPEC.md](TECH_SPEC.md) · [SKILL.md](SKILL.md) · [TASK.md](TASK.md) |

> [!IMPORTANT]
> Berkas di `Design/` dan `Skill/` hanya berisi panduan UI: token desain, aturan aksesibilitas, aturan state komponen, dan kepadatan komponen per halaman. Berkas tersebut **tidak** memuat aturan bisnis, skema data, atau API. Karena itu setiap kebutuhan di dokumen ini diberi label sumber:
> - **[D]** — tertulis langsung di berkas `Design/` atau `Skill/`.
> - **[I]** — disimpulkan dari nama halaman, route URL, jumlah input/tombol/tabel, dan praktik umum operasional BUJP di Indonesia. Kebutuhan [I] wajib divalidasi dengan pemilik produk sebelum fase terkait dimulai (lihat §9).

---

## 1. Latar Belakang

BUJP mengelola tiga arus kerja yang saling bergantung: **orang** (rekrutmen, data personel, penjadwalan jaga, penugasan BKO), **barang** (seragam dan perlengkapan jaga yang didistribusikan ke personel dan lokasi), dan **uang** (tagihan ke klien, penggajian personel, pembukuan). Garda menyatukan ketiganya dalam satu aplikasi web dengan satu basis data, sehingga satu kejadian operasional (misalnya personel ditempatkan di lokasi klien) langsung tercermin di tagihan, biaya gaji, dan laporan keuangan.

Aplikasi referensi memiliki 42 layar yang sudah diekstrak menjadi spesifikasi desain. Proyek ini membangun Garda dengan paritas fungsional dan visual terhadap 42 layar tersebut, memakai satu sistem token desain yang dikonsolidasikan, dan memenuhi WCAG 2.2 AA.

### 1.1 Temuan dari Analisis Berkas Desain

| Temuan | Dampak ke Produk |
|---|---|
| Ke-42 halaman memakai palet gelap: kanvas `#000000`, permukaan `#030712`/`#111827`, aksen amber `#f59e0b`. | Tema gelap jadi tema utama v1. |
| 41 dari 42 halaman memuat 32–96 tautan dan 1 elemen `navigation`; halaman login tidak. | Semua halaman setelah login memakai satu sidebar global (±32 tautan menu). |
| Halaman formulir punya 5–22 input; halaman daftar punya 1 tabel. | Dua pola halaman utama: **Daftar** (tabel + filter + aksi) dan **Formulir** (field + simpan/batal). |
| Pasangan `Registrasi Item Baru` ↔ `Edit Barang` dan `Buat Role Baru` ↔ `Edit Role` memiliki kepadatan komponen identik. | Halaman edit memakai ulang layout formulir tambah. |
| `Design/PORTAL LOGIN.md` mencatat audiens "developers" dan permukaan "documentation site" dengan diagnostik *confidence rendah*. | Diabaikan; login diperlakukan sebagai gerbang aplikasi dashboard. |
| 31 halaman memuat diagnostik "Audience and product surface inference confidence is low". | Konteks brand dikonfirmasi manual: audiens = pengguna internal BUJP yang terautentikasi. |

---

## 2. Tujuan dan Metrik Keberhasilan

| ID | Tujuan | Metrik | Target |
|---|---|---|---|
| G-1 | Paritas layar | Route referensi yang berfungsi | 42 / 42 |
| G-2 | Aksesibilitas [D] | Pelanggaran axe-core level *serious* + *critical* di 42 halaman | 0 |
| G-3 | Konsistensi token [D] | Nilai hex mentah di kode komponen (di luar berkas token) | 0 |
| G-4 | State komponen lengkap [D] | Komponen interaktif yang mendefinisikan 7 state (default, hover, focus-visible, active, disabled, loading, error) | 100% |
| G-5 | Integritas akuntansi [I] | Jurnal terposting dengan total debit ≠ total kredit | 0 |
| G-6 | Integritas laporan [I] | Periode di mana Neraca tidak seimbang (Aset ≠ Liabilitas + Ekuitas) | 0 |
| G-7 | Keamanan akses [I] | Route yang dapat diakses tanpa izin modul yang sesuai | 0 |

---

## 3. Pengguna dan Peran

Berkas desain menyebut audiens "authenticated users and operators" [D]. Peran di bawah adalah **role bawaan (seed)**; administrator dapat membuat role lain lewat Manajemen Role & Izin.

| Role Bawaan | Tanggung Jawab | Modul Utama |
|---|---|---|
| Administrator Sistem | Profil perusahaan, pengguna, role, backup | Pengaturan (SET) |
| Manajer Operasional | Personel, klien, lokasi jaga, checkpoint, jadwal, persetujuan BKO | Operasional Pengamanan (SEC) |
| Staf Rekrutmen | Seleksi pelamar dan konversi kandidat menjadi personel | PSB, SEC (personel) |
| Staf Logistik | Stok gudang, registrasi barang, distribusi ke personel/lokasi | Logistik (LOG) |
| Staf Keuangan | Invoice klien, penggajian | Keuangan (FIN) |
| Akuntan | Bagan akun, jurnal umum, laporan keuangan | Akuntansi (ACC), Laporan (RPT) |
| Direksi | Dashboard, laporan keuangan, analisa manajemen, Balanced Scorecard (hanya baca) | DASH, RPT |

---

## 4. Ruang Lingkup

### 4.1 Dalam Ruang Lingkup (v1)

| Kode | Modul | Prefix Route | Jumlah Halaman |
|---|---|---|---|
| AUTH | Autentikasi | `/login` | 1 |
| DASH | Dashboard | `/dashboard` | 1 |
| SEC | Operasional Pengamanan | `/security/*` | 10 |
| PSB | Rekrutmen Pelamar | `/psb/admin/*` | 2 |
| LOG | Logistik | `/logistics/*` | 5 |
| FIN | Keuangan (Invoice & Payroll) | `/finance/invoices`, `/finance/invoice/new`, `/finance/payroll` | 3 |
| ACC | Akuntansi (COA & Jurnal) | `/finance/accounting/coa*`, `/finance/accounting/journals*` | 4 |
| RPT | Laporan Keuangan & Manajemen | `/finance/accounting/reports/*` | 8 |
| SET | Pengaturan | `/settings/*` | 8 |
| | **Total** | | **42** |

Daftar lengkap halaman, route, dan tautan ke berkas desain ada di [TECH_SPEC.md §10](TECH_SPEC.md#10-indeks-modul--berkas-desain).

### 4.2 Di Luar Ruang Lingkup (v1)

| Item | Alasan |
|---|---|
| Aplikasi mobile patroli untuk satpam (pemindaian checkpoint di lapangan) | Hanya master checkpoint yang didesain; tidak ada layar pemindaian. |
| Formulir pendaftaran publik untuk pelamar | Route `/psb/admin` menyiratkan sisi publik, tetapi tidak ada desainnya. |
| Buku Pembantu Utang Usaha (`?type=payable`) | Hanya varian `type=receivable` yang didesain. Parameter `type` tetap dibuat agar varian ini bisa ditambahkan tanpa mengubah route. |
| Integrasi e-Faktur DJP, bank, dan BPJS online | Tidak ada layar integrasi di desain. |
| Multi-perusahaan / multi-tenant | Ke-42 halaman mengasumsikan satu institusi (`/settings/institution`). |
| Tema terang | Semua halaman referensi bertema gelap. |

### 4.3 Kesenjangan Desain dan Keputusan

| Kesenjangan | Keputusan v1 |
|---|---|
| Tidak ada halaman edit untuk personel, klien, lokasi jaga, akun COA, dan pengguna. | Edit memakai ulang layout formulir tambah, sesuai preseden `Registrasi Item Baru` ↔ `Edit Barang`. Route: `/{resource}/edit/{id}`. |
| Tidak ada halaman detail invoice dan slip gaji. | Detail ditampilkan sebagai dokumen PDF yang diunduh dari baris tabel. |
| Tidak ada token warna untuk state *error*, padahal aturan [D] mewajibkan state error. | Tambah token `status.danger` (`#f87171` untuk teks di permukaan gelap). Lihat [TECH_SPEC.md §9](TECH_SPEC.md#9-implementasi-sistem-desain). |
| Route tidak konsisten: `/finance/invoice/new` (tunggal) vs `/finance/invoices` (jamak). | Route referensi dipertahankan demi paritas. `/finance/invoices/new` dibuat sebagai alias redirect 301. |
| Nama berkas tidak sama: `Design/Data Personel.md` vs `Skill/Data Personil Security.md`. | Keduanya dipetakan ke halaman SEC-01. Berkas tidak diganti namanya. |

---

## 5. Fitur Inti

Format: **FR-[modul]-[nomor]** · label sumber · deskripsi. Rujukan halaman memakai ID dari [TECH_SPEC.md §10](TECH_SPEC.md#10-indeks-modul--berkas-desain).

### 5.1 AUTH — Autentikasi

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-AUTH-1 | [D] | Halaman login (AUTH-01) dengan 3 input, 1 tombol kirim, 2 tautan. |
| FR-AUTH-2 | [I] | Login memakai email/username + kata sandi + "ingat saya" (3 input). Tautan: lupa kata sandi dan bantuan. |
| FR-AUTH-3 | [I] | Login gagal 5× dalam 1 menit dari IP + akun yang sama dikunci selama 60 detik. |
| FR-AUTH-4 | [I] | Setelah login, pengguna diarahkan ke `/dashboard`. Dashboard terbuka untuk semua pengguna yang login; setiap kartu hanya tampil jika pengguna memiliki izin `*.view` untuk modul sumber datanya. |

### 5.2 DASH — Dashboard

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-DASH-1 | [D] | Satu kartu ringkasan, 1 input, 2 tombol, sidebar global (DASH-01). |
| FR-DASH-2 | [I] | Kartu ringkasan menampilkan: jumlah personel aktif, lokasi jaga aktif, permintaan BKO menunggu, total piutang jatuh tempo, jumlah barang di bawah stok minimum. |
| FR-DASH-3 | [I] | Input berfungsi sebagai pencarian global (personel, klien, lokasi, barang). Dua tombol: muat ulang data dan pilih periode. |
| FR-DASH-4 | [I] | Tiap angka di kartu menjadi tautan ke halaman daftar dengan filter yang sesuai. |

### 5.3 SEC — Operasional Pengamanan

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-SEC-1 | [D] | Daftar personel (SEC-01): 1 tabel, 3 input filter, 8 tombol, 1 kartu ringkasan. |
| FR-SEC-2 | [I] | Formulir personel baru (SEC-02, 19 input): NIK, nama lengkap, tempat lahir, tanggal lahir, jenis kelamin, alamat, telepon, email, nomor KTA, masa berlaku KTA, tingkat Gada (Pratama/Madya/Utama), nomor sertifikat Gada, jabatan, tanggal bergabung, status (aktif/cuti/nonaktif), lokasi penempatan, bank, nomor rekening, foto. |
| FR-SEC-3 | [I] | Personel dengan KTA yang kedaluwarsa dalam 30 hari ditandai di daftar personel dan dihitung di dashboard. |
| FR-SEC-4 | [D] | Daftar klien mitra (SEC-03): 1 tabel, 7 tombol. Formulir klien baru (SEC-04): 7 input. |
| FR-SEC-5 | [I] | Field klien: nama perusahaan, NPWP, alamat penagihan, nama PIC, telepon PIC, email PIC, tanggal akhir kontrak. |
| FR-SEC-6 | [D] | Daftar lokasi jaga (SEC-05): 1 tabel, 1 input, 15 tombol (aksi per baris). Formulir lokasi baru (SEC-06): 7 input. |
| FR-SEC-7 | [I] | Field lokasi jaga: klien, nama lokasi, alamat, koordinat (lat, lng), jumlah personel yang dibutuhkan per shift, tarif bulanan per personel, status. |
| FR-SEC-8 | [D] | Master checkpoint (SEC-07): 1 tabel, 7 input, 6 tombol. |
| FR-SEC-9 | [I] | Checkpoint terikat ke satu lokasi jaga, memiliki kode unik, nama, urutan patroli, dan dapat dicetak sebagai QR. |
| FR-SEC-10 | [D] | Jadwal jaga (SEC-08): 2 input filter, 3 tombol. Plotting jadwal baru (SEC-09): 10 input. |
| FR-SEC-11 | [I] | Jadwal ditampilkan sebagai grid lokasi × tanggal. Plotting menetapkan personel ke lokasi, shift (pagi/siang/malam), dan rentang tanggal. |
| FR-SEC-12 | [I] | Sistem menolak plotting jika personel sudah terjadwal di shift yang tumpang-tindih atau berstatus nonaktif. |
| FR-SEC-13 | [D] | Persetujuan BKO (SEC-10): 1 tabel, 3 tombol. |
| FR-SEC-14 | [I] | BKO (Bawah Kendali Operasi) adalah penugasan sementara personel ke lokasi lain. Permintaan berstatus `menunggu` → `disetujui` / `ditolak`. Persetujuan menambahkan entri ke jadwal jaga lokasi tujuan. |

### 5.4 PSB — Rekrutmen Pelamar

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-PSB-1 | [D] | Daftar pelamar (PSB-01): 1 tabel, 2 input filter, 2 tombol. |
| FR-PSB-2 | [D] | Detail kandidat (PSB-02): 3 input, 3 tombol. |
| FR-PSB-3 | [I] | Status pelamar: `baru` → `seleksi` → `diterima` / `ditolak`. Input di detail: status, jadwal tes, catatan penilai. Tombol: simpan, terima, tolak. |
| FR-PSB-4 | [I] | Kandidat yang diterima dapat dikonversi menjadi draf personel. Data identitas tersalin ke formulir SEC-02. |

### 5.5 LOG — Logistik

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-LOG-1 | [D] | Gudang logistik pusat (LOG-01): 1 tabel, 3 input filter, 7 tombol. |
| FR-LOG-2 | [D] | Registrasi item (LOG-02) dan edit item (LOG-04): masing-masing 9 input, 3 tombol. |
| FR-LOG-3 | [I] | Field item: kode, nama, kategori (seragam/perlengkapan/elektronik/lainnya), satuan, ukuran, stok awal, stok minimum, harga satuan, keterangan. |
| FR-LOG-4 | [D] | Detail barang (LOG-03): 1 tabel, 5 tombol. |
| FR-LOG-5 | [I] | Tabel di detail barang adalah kartu stok (riwayat masuk/keluar/penyesuaian beserta saldo berjalan). |
| FR-LOG-6 | [D] | Distribusi (LOG-05): 9 input, 3 tombol. |
| FR-LOG-7 | [I] | Distribusi mengeluarkan barang ke personel atau lokasi jaga. Sistem menolak distribusi yang melebihi stok tersedia. |

### 5.6 FIN — Keuangan

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-FIN-1 | [D] | Daftar tagihan klien (FIN-01): 1 tabel, 2 tombol. |
| FR-FIN-2 | [D] | Buat invoice baru (FIN-02): 3 input, 3 tombol. |
| FR-FIN-3 | [I] | Tiga input: klien, periode tagihan (bulan), tanggal jatuh tempo. Baris invoice dibuat otomatis dari lokasi jaga aktif milik klien: jumlah personel × tarif bulanan. PPN dihitung dari tarif di pengaturan institusi. |
| FR-FIN-4 | [I] | Status invoice: `draf` → `terbit` → `lunas` / `batal`. Invoice terbit tidak dapat diedit, hanya dibatalkan. |
| FR-FIN-5 | [D] | Penggajian (FIN-03): 1 tabel, 2 input, 3 tombol. |
| FR-FIN-6 | [I] | Input: periode dan lokasi jaga (filter). Tombol: hitung payroll, posting, unduh slip. Komponen: gaji pokok, tunjangan, lembur, potongan BPJS Kesehatan, potongan BPJS Ketenagakerjaan, PPh 21. Tarif potongan disimpan di pengaturan, tidak ditulis langsung di kode. |

### 5.7 ACC — Akuntansi

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-ACC-1 | [D] | Bagan akun / Chart of Accounts (ACC-01): 1 tabel, 96 tautan (halaman terpadat). |
| FR-ACC-2 | [D] | Tambah akun (ACC-02): 6 input, 3 tombol. |
| FR-ACC-3 | [I] | Field akun: kode, nama, kategori (Aset/Liabilitas/Ekuitas/Pendapatan/Beban), saldo normal (debit/kredit), akun induk, status aktif. Akun yang sudah dipakai di jurnal tidak dapat dihapus, hanya dinonaktifkan. |
| FR-ACC-4 | [D] | Daftar jurnal umum (ACC-03): 1 tabel, 1 input, 3 tombol. Input jurnal (ACC-04): 10 input, 6 tombol, 1 tabel baris jurnal. |
| FR-ACC-5 | [I] | Jurnal memiliki header (tanggal, nomor bukti, keterangan) dan minimal 2 baris (akun, debit, kredit, memo, lokasi jaga opsional). Tombol simpan tidak aktif selama total debit ≠ total kredit. |
| FR-ACC-6 | [I] | Jurnal terposting tidak dapat diubah. Koreksi dilakukan lewat jurnal pembalik. |

### 5.8 RPT — Laporan

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-RPT-1 | [D] | Buku besar (RPT-01): 3 input (akun, tanggal mulai, tanggal akhir), 4 tombol. |
| FR-RPT-2 | [D] | Buku pembantu piutang (RPT-02): 1 tabel, 3 tombol, route `?type=receivable`. |
| FR-RPT-3 | [D] | Laba rugi (RPT-03), neraca (RPT-04), perubahan ekuitas (RPT-05), arus kas (RPT-06): masing-masing 3–4 tombol, 0–2 input periode. |
| FR-RPT-4 | [I] | Laporan keuangan mengikuti susunan laporan dalam SAK: Laporan Posisi Keuangan, Laporan Laba Rugi, Laporan Perubahan Ekuitas, Laporan Arus Kas (metode tidak langsung). |
| FR-RPT-5 | [I] | Setiap laporan dapat diekspor ke PDF dan XLSX, serta dicetak. |
| FR-RPT-6 | [D] | Analisa akuntansi manajemen (RPT-07): 1 tabel, 1 input, 4 tombol. |
| FR-RPT-7 | [I] | Analisa manajemen menampilkan profitabilitas per lokasi jaga: pendapatan invoice − biaya gaji personel di lokasi − biaya distribusi logistik ke lokasi. |
| FR-RPT-8 | [D] | Balanced Scorecard BUJP (RPT-08): 3 tombol, tanpa tabel. |
| FR-RPT-9 | [I] | Empat perspektif BSC dengan KPI yang dihitung dari data sistem: **Keuangan** (margin laba bersih), **Pelanggan** (retensi klien, jumlah lokasi aktif), **Proses Internal** (rasio pemenuhan kebutuhan personel per shift), **Pembelajaran & Pertumbuhan** (persentase personel dengan Gada dan KTA berlaku). |

### 5.9 SET — Pengaturan

| ID | Sumber | Kebutuhan |
|---|---|---|
| FR-SET-1 | [D] | Identitas & organisasi (SET-01): 22 input, 22 tombol, 1 list, 1 tabel (halaman formulir terpadat). |
| FR-SET-2 | [I] | Bagian profil: nama BUJP, nomor izin operasional, NPWP, alamat, telepon, email, logo, tarif PPN. Bagian struktur: daftar unit/jabatan dengan atasan langsung. |
| FR-SET-3 | [D] | Visual struktur organisasi (SET-02): 3 tombol (zoom masuk, zoom keluar, unduh gambar) [I]. |
| FR-SET-4 | [D] | Manajemen pengguna (SET-03): 1 tabel, 2 input, 9 tombol. Tambah pengguna (SET-04): 5 input, 1 kartu. |
| FR-SET-5 | [I] | Field pengguna: nama, email, kata sandi, konfirmasi kata sandi, role. Pengguna dapat dinonaktifkan tanpa dihapus. |
| FR-SET-6 | [D] | Manajemen role (SET-05). Buat role (SET-06) dan edit role (SET-07): masing-masing 18 input, 2 navigasi, 1 list. |
| FR-SET-7 | [I] | 18 input = nama role + deskripsi + 16 checkbox izin (8 modul izin × {`view`, `manage`}). Modul izin: `security`, `recruitment`, `logistics`, `finance`, `accounting`, `reports`, `users` (pengguna & role), `institution` (identitas, struktur, backup). Daftar lengkap di [TECH_SPEC.md §7](TECH_SPEC.md#7-otorisasi-rbac). |
| FR-SET-8 | [D] | Manajemen data & backup (SET-08): 11 tombol, 5 input, 1 kartu. |
| FR-SET-9 | [I] | Fungsi: backup manual, jadwal backup otomatis, daftar riwayat backup, unduh, pulihkan (dengan konfirmasi ketik ulang nama institusi), ekspor data master ke XLSX. |

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Sistem Desain [D]

- Komponen wajib memakai token semantik, bukan nilai hex mentah.
- Setiap komponen interaktif wajib mendefinisikan 7 state: default, hover, focus-visible, active, disabled, loading, error.
- Perilaku responsif dan penanganan kasus tepi wajib ditentukan untuk setiap keluarga komponen.
- Komponen interaktif wajib mendokumentasikan perilaku keyboard, pointer, dan sentuh.
- Dilarang membuat pengecualian spasi atau tipografi satu kali pakai.
- Dilarang memakai label ambigu atau aksi yang tidak deskriptif (contoh salah: "OK", "Submit"; contoh benar: "Simpan Personel", "Setujui BKO").
- Konten panjang, overflow, dan state kosong wajib ditangani.

### 6.2 Aksesibilitas [D]

- Target WCAG 2.2 AA.
- Interaksi mengutamakan keyboard. Indikator fokus wajib terlihat.
- Kontras teks wajib memenuhi batas AA. Beberapa warna hasil ekstraksi gagal di permukaan gelap; batasan pemakaiannya ada di [TECH_SPEC.md §9.3](TECH_SPEC.md#93-batasan-kontras-wcag-22-aa).
- Setiap aturan aksesibilitas wajib dapat diuji di implementasi (lulus/gagal).

### 6.3 Nada Penulisan [D]

Ringkas, yakin, berorientasi tindakan. UI berbahasa Indonesia. Format angka dan uang `id-ID` (Rp 1.250.000), tanggal `dd/MM/yyyy`, zona waktu `Asia/Jakarta` [I].

### 6.4 Keamanan dan Audit [I]

- Setiap route setelah login diperiksa terhadap izin modul.
- Setiap aksi tulis (buat, ubah, hapus, posting, setujui) tercatat di log aktivitas: pengguna, waktu, entitas, nilai sebelum dan sesudah.
- Kata sandi di-hash dengan bcrypt/argon2. Sesi kedaluwarsa setelah 120 menit tanpa aktivitas.

### 6.5 Data [I]

- Uang disimpan sebagai desimal tetap (bukan float).
- Backup harian otomatis, retensi 30 hari.
- Data master dan transaksi tidak dihapus permanen (soft delete), kecuali lewat prosedur pemulihan backup.

---

## 7. Kriteria Penerimaan

Setiap kriteria dapat diuji secara otomatis atau manual dengan hasil lulus/gagal.

### 7.1 Kriteria Global (berlaku di 42 halaman)

| ID | Kriteria | Cara Uji |
|---|---|---|
| AC-G-1 | Route halaman merespons HTTP 200 untuk pengguna dengan izin modul, dan 403 untuk pengguna tanpa izin. | Pest feature test |
| AC-G-2 | axe-core melaporkan 0 pelanggaran *serious*/*critical*. | Playwright + `@axe-core/playwright` |
| AC-G-3 | Semua elemen interaktif dapat dijangkau dengan Tab, urutan fokus mengikuti urutan visual, dan setiap elemen terfokus menampilkan outline dengan kontras ≥ 3:1 terhadap latar. | Playwright keyboard test |
| AC-G-4 | Tidak ada nilai hex mentah di `resources/js/**` selain berkas token. | `npm run lint:tokens` |
| AC-G-5 | Halaman daftar menampilkan state kosong (ilustrasi teks + aksi utama) saat data 0 baris. | Vitest + Testing Library |
| AC-G-6 | Halaman daftar menampilkan skeleton saat memuat, dan pesan error + tombol "Coba lagi" saat permintaan gagal. | Vitest |
| AC-G-7 | Teks yang lebih panjang dari kolom terpotong dengan elipsis dan nilai lengkap tersedia via `title`/tooltip yang dapat diakses keyboard. | Visual review + Vitest |
| AC-G-8 | Pada lebar 375 px, tidak ada scroll horizontal di level halaman. Tabel lebar di-scroll di dalam kontainernya sendiri. | Playwright viewport test |
| AC-G-9 | Formulir menampilkan pesan error validasi di bawah field yang salah, field diberi `aria-invalid="true"` dan `aria-describedby` yang menunjuk ke pesan, dan fokus pindah ke field error pertama. | Playwright |
| AC-G-10 | Tombol kirim berstatus loading (disabled + indikator) selama permintaan berjalan dan tidak dapat dikirim dua kali. | Vitest |
| AC-G-11 | Setiap aksi tulis menghasilkan satu entri log aktivitas. | Pest |

### 7.2 Kriteria per Modul

| ID | Modul | Kriteria |
|---|---|---|
| AC-AUTH-1 | AUTH | Kredensial benar → redirect ke `/dashboard`. Salah → pesan "Email atau kata sandi salah" tanpa mengungkap field mana yang salah. |
| AC-AUTH-2 | AUTH | Percobaan ke-6 dalam 1 menit → HTTP 429 dan pesan berisi sisa detik tunggu. |
| AC-DASH-1 | DASH | Setiap angka kartu sama dengan jumlah baris di halaman daftar tujuan dengan filter yang sama. |
| AC-SEC-1 | SEC | Menyimpan personel dengan NIK yang sudah terdaftar ditolak dengan pesan "NIK sudah terdaftar". |
| AC-SEC-2 | SEC | Plotting personel ke shift yang tumpang-tindih ditolak dan menampilkan jadwal yang bentrok. |
| AC-SEC-3 | SEC | Menyetujui BKO membuat entri jadwal di lokasi tujuan untuk rentang tanggal BKO. Menolak BKO tidak mengubah jadwal. |
| AC-SEC-4 | SEC | Lokasi jaga tidak dapat dihapus selama masih memiliki jadwal aktif atau invoice berstatus `terbit`. |
| AC-PSB-1 | PSB | Mengonversi kandidat `diterima` membuka SEC-02 dengan nama, NIK, tanggal lahir, alamat, dan telepon terisi. Kandidat berstatus lain tidak memiliki tombol konversi. |
| AC-LOG-1 | LOG | Distribusi dengan jumlah > stok tersedia ditolak. Distribusi valid mengurangi stok dan menambah satu baris di kartu stok. |
| AC-LOG-2 | LOG | Saldo akhir kartu stok sama dengan stok yang tampil di daftar gudang. |
| AC-FIN-1 | FIN | Invoice untuk klien dengan 2 lokasi aktif menghasilkan 2 baris dengan subtotal = jumlah personel × tarif, ditambah baris PPN sesuai tarif pengaturan. |
| AC-FIN-2 | FIN | Menerbitkan invoice membuat jurnal: Debit Piutang Usaha, Kredit Pendapatan Jasa Pengamanan, Kredit PPN Keluaran. Total debit = total kredit. |
| AC-FIN-3 | FIN | Posting payroll membuat jurnal: Debit Beban Gaji, Kredit Utang Gaji, Kredit Utang PPh 21, Kredit Utang BPJS. Payroll terposting tidak dapat dihitung ulang. |
| AC-ACC-1 | ACC | Tombol simpan jurnal disabled selama selisih debit-kredit ≠ 0. Selisih ditampilkan secara live. |
| AC-ACC-2 | ACC | Menghapus akun yang memiliki baris jurnal ditolak. Opsi nonaktifkan tersedia. |
| AC-ACC-3 | ACC | Kode akun unik. Akun induk tidak boleh menunjuk ke dirinya sendiri atau keturunannya. |
| AC-RPT-1 | RPT | Untuk periode apa pun, total Aset di neraca = total Liabilitas + Ekuitas. |
| AC-RPT-2 | RPT | Laba bersih di Laba Rugi = laba periode berjalan di Perubahan Ekuitas. |
| AC-RPT-3 | RPT | Kenaikan/penurunan kas di Arus Kas = selisih saldo akun kas awal dan akhir periode. |
| AC-RPT-4 | RPT | Saldo akhir Buku Pembantu Piutang = saldo akun Piutang Usaha di Buku Besar pada tanggal yang sama. |
| AC-RPT-5 | RPT | Ekspor PDF dan XLSX menghasilkan angka yang sama dengan tampilan layar. |
| AC-SET-1 | SET | Role tanpa izin `security.view` tidak melihat menu Operasional di sidebar dan mendapat 403 saat membuka `/security/*` langsung. |
| AC-SET-2 | SET | Pemulihan backup hanya berjalan setelah pengguna mengetik ulang nama institusi dengan tepat. |
| AC-SET-3 | SET | Administrator tidak dapat menonaktifkan akunnya sendiri atau menghapus role terakhir yang memiliki `users.manage`. |
| AC-SET-4 | SET | Perubahan struktur organisasi di SET-01 langsung tercermin di bagan SET-02 setelah halaman dimuat ulang. |

---

## 8. Asumsi dan Risiko

| Tipe | Pernyataan | Mitigasi |
|---|---|---|
| Asumsi | Satu institusi BUJP per instalasi. | Kolom `institution_id` tidak dibuat di v1. Migrasi ke multi-tenant butuh perubahan skema. |
| Asumsi | Granularitas izin = modul × {lihat, kelola}, berdasarkan 18 input di halaman role. | Nama izin dibuat per modul agar bisa dipecah per aksi tanpa mengubah pemeriksaan di controller. |
| Risiko | Kebutuhan [I] berbeda dari proses bisnis klien. | Validasi kebutuhan [I] per modul di awal fase terkait ([TASK.md](TASK.md)). |
| Risiko | Teks abu-abu `#64748b` dan `#475569` hasil ekstraksi gagal kontras AA di latar gelap. | Pemakaiannya dibatasi di [TECH_SPEC.md §9.3](TECH_SPEC.md#93-batasan-kontras-wcag-22-aa). |
| Risiko | Token per halaman tidak konsisten karena peran warna ditebak otomatis oleh ekstraktor. | Satu set token global dikonsolidasikan di TECH_SPEC; token per halaman hanya dipakai sebagai bukti, bukan sumber kebenaran. |

## 9. Validasi yang Dibutuhkan dari Pemilik Produk

Daftar ini harus dijawab sebelum fase yang disebut dimulai. Sampai dijawab, tim memakai keputusan default di kolom kanan.

| Pertanyaan | Fase | Default Sementara |
|---|---|---|
| Apakah tarif invoice dihitung per personel per bulan, atau nilai kontrak tetap per lokasi? | Fase 2 — FIN | Per personel per bulan |
| Komponen tunjangan dan aturan lembur apa yang dipakai? | Fase 2 — FIN | Tunjangan tetap per jabatan; lembur per jam dengan tarif di pengaturan |
| Apakah checkpoint perlu QR atau NFC? | Fase 2 — SEC | QR |
| Apakah akuntan perlu dipisah antara pembuat dan pemosting jurnal? | Fase 2 — ACC | Tidak; izin `accounting.manage` mencakup keduanya |
