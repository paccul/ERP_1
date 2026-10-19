# Aturan Refactoring — Garda ERP

Aturan untuk memodifikasi kode yang sudah ada untuk memperkecil *technical debt*.

## 1. Perlindungan Sumber Kebenaran
- Dokumen yang ada di dalam map `Design/` dan `Skill/` (hasil ekstraksi bot) bersifat statis (*read-only*). **Jangan mengubah berkas tersebut**.
- Rujukan utama perubahan aturan atau token dilakukan di dokumen global: `TECH_SPEC.md` dan `PRD.md`.

## 2. Praktik Refactoring yang Diizinkan
- Memecah Komponen React besar menjadi *sub-komponen* kecil murni (Pure Components) selama tidak mengubah *behavior* state Aria.
- Memindahkan duplikasi logika kueri pelaporan SQL (`DB::raw`) di Controller ke dalam `app/Reports/` Queries.
- Refactoring tidak boleh memodifikasi tabel riwayat jurnal akuntansi (entri `journal_lines`) apabila sistem sudah dalam status *Production*.

## 3. Checklist Sebelum Commit
1. Jalankan Analisis statis PHPStan.
2. Jalankan `npm run lint:tokens`.
3. Jalankan keseluruhan test `pest` dan `vitest`.
