# Panduan Frontend — Garda ERP

Aplikasi klien dibangun menggunakan React 19 + Inertia.js + Tailwind CSS v4 + React Aria Components.

## 1. Kepatuhan Sistem Desain & Token Tailwind
- **Dilarang keras** menggunakan nilai warna hex secara langsung (seperti `#f59e0b` atau `rgb()`). Semua styling WAJIB menggunakan variabel CSS yang ada di `resources/css/tokens.css` melalui class utility Tailwind (misal: `bg-accent`, `text-fg-strong`).
- Gunakan spasi/jarak yang mematuhi kelipatan desain: `p-2`, `gap-4`, `m-6`.

## 2. Komponen Interaktif (React Aria)
- Setiap komponen input dan tombol wajib diturunkan dari primitif `react-aria-components`.
- WAJIB memiliki spesifikasi tampilan untuk **7 status interaksi**: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, dan `error`.
- Fokus visual harus jelas. Gunakan `ring-accent` untuk indikator `focus-visible`.

## 3. Standar Aksesibilitas (WCAG 2.2 AA)
- Tidak boleh ada pelanggaran standar kontras warna tingkat *serious* atau *critical*.
- Semua aksi kritis harus bisa dioperasikan lewat Keyboard secara eksklusif (Tab, Shift+Tab, Enter, Space).
- Selalu lampirkan teks bantu (*aria-labels* / deskriptor teks tersembunyi) pada ikon fungsional yang tidak berlabel teks kasat mata.
