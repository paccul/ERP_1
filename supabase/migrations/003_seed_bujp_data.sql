-- ============================================================================
-- 003_seed_bujp_data.sql
-- Seed Data Realistis BUJP: Personel Satpam, Legalitas KTA (Perpol 01/2023), Pos Jaga & Billing
-- ============================================================================

-- 1. IDENTITAS PERUSAHAAN (INSTITUTION SETTINGS)
INSERT INTO institution_settings (
    id,
    company_name,
    license_number,
    npwp,
    address,
    phone,
    email,
    ppn_rate,
    pph23_rate,
    bpjs_kesehatan_rate,
    bpjs_ketenagakerjaan_rate
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'PT GARDA NUSANTARA PERKASA',
    'SIO-BUJP/POLRI/2023/IX/0819',
    '01.234.567.8-012.000',
    'Kawasan Industri Terpadu MM2100, Cikarang Barat, Bekasi, Jawa Barat',
    '021-89801234',
    'operasional@gardanantara.co.id',
    11.00,
    2.00,
    1.00,
    3.00
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name;

-- 2. KLIEN MITRA OPERASIONAL (CLIENTS)
INSERT INTO clients (id, name, code, contact_person, phone, email, address, is_active) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'PT Surya Mas Manufaktur', 'SMM-01', 'Bambang Hartono', '081288990011', 'bambang@suryamas.com', 'Kawasan MM2100 Blok C-2, Cikarang', true),
    ('b0000000-0000-0000-0000-000000000002', 'Grand Central Mall & Plaza', 'GCM-02', 'Dewi Lestari', '081199887722', 'building.ops@grandmall.co.id', 'Jl. Boulevard Raya Kav. 8, Jakarta Pusat', true),
    ('b0000000-0000-0000-0000-000000000003', 'RS Mitra Husada Kasih', 'RSM-03', 'dr. Gunawan Sp.PK', '081377665544', 'admin.hr@rsmhk.com', 'Jl. Cut Meutia No. 45, Bekasi Timur', true),
    ('b0000000-0000-0000-0000-000000000004', 'Logistik Nusantara Hub', 'LNH-04', 'Kapten (Purn) Suryadi', '081522334455', 'security.ops@logistiknusantara.id', 'Kawasan Marunda Center, Cilincing, Jakarta Utara', true)
ON CONFLICT (id) DO NOTHING;

-- 3. LOKASI POS JAGA (SITES)
INSERT INTO sites (id, client_id, name, code, address, required_guards, supervisor_name) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Pos Induk Gerbang Barat', 'POS-SMM-01', 'Gerbang Utama Truk Masuk PT Surya Mas', 6, 'Danru Dedi Suryadi'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Pos Lobby & Patroli Dalam', 'POS-GCM-01', 'Lantai Dasar Main Lobby Grand Mall', 8, 'Danru Eko Prasetyo'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Pos IGD & Dropping Pasien', 'POS-RSM-01', 'Pintu Gerbang Emergency RS Mitra', 4, 'Danru Fajar Nugroho'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Pos Container & Dermaga', 'POS-LNH-01', 'Dermaga Petikemas Area Gudang 3', 5, 'Danru Hendra Wijaya')
ON CONFLICT (id) DO NOTHING;

-- 4. MASTER PERSONEL SATPAM & LEGALITAS KTA (PERPOL 01/2023)
-- Kasus: 10 KTA Aktif, 3 KTA Mendekati Kedaluwarsa (<= 30 hari), 2 KTA Kedaluwarsa
INSERT INTO personnel (
    id, nik, full_name, birth_place, birth_date, gender, phone, email,
    kta_number, kta_expiry_date, gada_level, gada_certificate_number,
    position, join_date, status, current_site_id, bank_name, bank_account_number
) VALUES
    -- 1. Danru Dedi Suryadi (KTA Mendekati Expire dalam 18 hari - UJI KEPATUHAN WARNING)
    ('d0000000-0000-0000-0000-000000000001', '3216011204850001', 'Dedi Suryadi', 'Bekasi', '1985-04-12', 'Laki-laki', '081211112201', 'dedi.s@gardanantara.id',
     'KTA-POL-2021-001', CURRENT_DATE + INTERVAL '18 days', 'Madya', 'SERT-GM/PMJ/2021/045',
     'Komandan Regu (Danru)', '2021-02-01', 'active', 'c0000000-0000-0000-0000-000000000001', 'BCA', '8830112233'),

    -- 2. Danru Eko Prasetyo (KTA Mendekati Expire dalam 25 hari - UJI KEPATUHAN WARNING)
    ('d0000000-0000-0000-0000-000000000002', '3216021508880002', 'Eko Prasetyo', 'Solo', '1988-08-15', 'Laki-laki', '081211112202', 'eko.p@gardanantara.id',
     'KTA-POL-2021-002', CURRENT_DATE + INTERVAL '25 days', 'Madya', 'SERT-GM/PMJ/2021/088',
     'Komandan Regu (Danru)', '2021-05-10', 'active', 'c0000000-0000-0000-0000-000000000002', 'Mandiri', '1560012345678'),

    -- 3. Fajar Nugroho (KTA Mendekati Expire dalam 7 hari - UJI KEPATUHAN WARNING)
    ('d0000000-0000-0000-0000-000000000003', '3216032211900003', 'Fajar Nugroho', 'Kebumen', '1990-11-22', 'Laki-laki', '081211112203', 'fajar.n@gardanantara.id',
     'KTA-POL-2021-003', CURRENT_DATE + INTERVAL '7 days', 'Pratama', 'SERT-GP/PMJ/2021/102',
     'Wadanru', '2021-06-15', 'active', 'c0000000-0000-0000-0000-000000000003', 'BRI', '001201045678501'),

    -- 4. Hendra Wijaya (KTA Telah Kedaluwarsa 15 hari lalu - UJI KEPATUHAN EXPIRED)
    ('d0000000-0000-0000-0000-000000000004', '3216041002870004', 'Hendra Wijaya', 'Bandung', '1987-02-10', 'Laki-laki', '081211112204', 'hendra.w@gardanantara.id',
     'KTA-POL-2020-004', CURRENT_DATE - INTERVAL '15 days', 'Madya', 'SERT-GM/JBR/2020/012',
     'Komandan Regu (Danru)', '2020-03-01', 'leave', 'c0000000-0000-0000-0000-000000000004', 'BNI', '0234567891'),

    -- 5. Joko Susanto (KTA Telah Kedaluwarsa 40 hari lalu - UJI KEPATUHAN EXPIRED)
    ('d0000000-0000-0000-0000-000000000005', '3216051806890005', 'Joko Susanto', 'Cilacap', '1989-06-18', 'Laki-laki', '081211112205', 'joko.s@gardanantara.id',
     'KTA-POL-2020-005', CURRENT_DATE - INTERVAL '40 days', 'Pratama', 'SERT-GP/JBR/2020/077',
     'Anggota Pengamanan', '2020-08-01', 'inactive', NULL, 'BCA', '8830998877'),

    -- 6. Agus Setiawan (KTA Aktif Panjang s.d. 2028)
    ('d0000000-0000-0000-0000-000000000006', '3216062409920006', 'Agus Setiawan', 'Semarang', '1992-09-24', 'Laki-laki', '081211112206', 'agus.s@gardanantara.id',
     'KTA-POL-2023-006', CURRENT_DATE + INTERVAL '600 days', 'Pratama', 'SERT-GP/PMJ/2023/214',
     'Anggota Pengamanan', '2023-01-15', 'active', 'c0000000-0000-0000-0000-000000000001', 'Mandiri', '1560098765432'),

    -- 7. Budi Santoso (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000007', '3216070301930007', 'Budi Santoso', 'Surabaya', '1993-01-03', 'Laki-laki', '081211112207', 'budi.s@gardanantara.id',
     'KTA-POL-2023-007', CURRENT_DATE + INTERVAL '550 days', 'Pratama', 'SERT-GP/JTM/2023/155',
     'Operator CCTV', '2023-02-01', 'active', 'c0000000-0000-0000-0000-000000000002', 'BCA', '8830445566'),

    -- 8. Candra Gunawan (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000008', '3216081907940008', 'Candra Gunawan', 'Yogyakarta', '1994-07-19', 'Laki-laki', '081211112208', 'candra.g@gardanantara.id',
     'KTA-POL-2023-008', CURRENT_DATE + INTERVAL '480 days', 'Pratama', 'SERT-GP/DIY/2023/042',
     'Anggota Pengamanan', '2023-03-10', 'active', 'c0000000-0000-0000-0000-000000000003', 'BRI', '001201998877665'),

    -- 9. Dimas Pratama (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000009', '3216091103950009', 'Dimas Pratama', 'Magelang', '1995-03-11', 'Laki-laki', '081211112209', 'dimas.p@gardanantara.id',
     'KTA-POL-2023-009', CURRENT_DATE + INTERVAL '450 days', 'Pratama', 'SERT-GP/PMJ/2023/301',
     'Anggota Pengamanan', '2023-04-01', 'active', 'c0000000-0000-0000-0000-000000000004', 'BCA', '8830119922'),

    -- 10. Erwin Romadhon (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000010', '3216102810930010', 'Erwin Romadhon', 'Cirebon', '1993-10-28', 'Laki-laki', '081211112210', 'erwin.r@gardanantara.id',
     'KTA-POL-2023-010', CURRENT_DATE + INTERVAL '400 days', 'Pratama', 'SERT-GP/JBR/2023/188',
     'Anggota Patroli Bergerak', '2023-05-15', 'active', 'c0000000-0000-0000-0000-000000000001', 'Mandiri', '1560033445566'),

    -- 11. Farhan Syahputra (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000011', '3216110505960011', 'Farhan Syahputra', 'Medan', '1996-05-05', 'Laki-laki', '081211112211', 'farhan.s@gardanantara.id',
     'KTA-POL-2023-011', CURRENT_DATE + INTERVAL '620 days', 'Pratama', 'SERT-GP/SU/2023/099',
     'Anggota Pengamanan', '2023-06-01', 'active', 'c0000000-0000-0000-0000-000000000002', 'BNI', '0234556677'),

    -- 12. Gilang Ramadhan (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000012', '3216121412950012', 'Gilang Ramadhan', 'Palembang', '1995-12-14', 'Laki-laki', '081211112212', 'gilang.r@gardanantara.id',
     'KTA-POL-2023-012', CURRENT_DATE + INTERVAL '580 days', 'Pratama', 'SERT-GP/SS/2023/110',
     'Anggota Pengamanan', '2023-07-10', 'active', 'c0000000-0000-0000-0000-000000000003', 'BRI', '001201554433221'),

    -- 13. Hadi Sucipto (KTA Aktif - Gada Utama / Chief Security)
    ('d0000000-0000-0000-0000-000000000013', '3216130101820013', 'Hadi Sucipto', 'Purwokerto', '1982-01-01', 'Laki-laki', '081211112213', 'hadi.s@gardanantara.id',
     'KTA-POL-2022-013', CURRENT_DATE + INTERVAL '350 days', 'Utama', 'SERT-GU/BAHARKAM/2022/015',
     'Chief Security Area', '2022-01-15', 'active', 'c0000000-0000-0000-0000-000000000001', 'BCA', '8830776655'),

    -- 14. Irwan Fauzi (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000014', '3216141604970014', 'Irwan Fauzi', 'Tasikmalaya', '1997-04-16', 'Laki-laki', '081211112214', 'irwan.f@gardanantara.id',
     'KTA-POL-2024-014', CURRENT_DATE + INTERVAL '700 days', 'Pratama', 'SERT-GP/JBR/2024/045',
     'Anggota Pengamanan', '2024-01-05', 'active', 'c0000000-0000-0000-0000-000000000004', 'Mandiri', '1560077889900'),

    -- 15. Lukman Hakim (KTA Aktif)
    ('d0000000-0000-0000-0000-000000000015', '3216152009940015', 'Lukman Hakim', 'Lampung', '1994-09-20', 'Laki-laki', '081211112215', 'lukman.h@gardanantara.id',
     'KTA-POL-2024-015', CURRENT_DATE + INTERVAL '680 days', 'Pratama', 'SERT-GP/LMP/2024/078',
     'Anggota Pengamanan', '2024-02-01', 'active', 'c0000000-0000-0000-0000-000000000002', 'BCA', '8830332211')
ON CONFLICT (id) DO UPDATE SET
    kta_expiry_date = EXCLUDED.kta_expiry_date,
    status = EXCLUDED.status;

-- 5. LOGISTIK KAPORLAP MASTER (LOGISTICS)
INSERT INTO logistics_items (id, name, code, category, min_stock, unit) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'Seragam PDH Lengkap (Kemeja + Celana)', 'KAP-PDH-01', 'Seragam', 20, 'Stel'),
    ('e0000000-0000-0000-0000-000000000002', 'Seragam PDL Lapangan Cokelat Satpam', 'KAP-PDL-02', 'Seragam', 15, 'Stel'),
    ('e0000000-0000-0000-0000-000000000003', 'Sepatu Boot PDL Tactical Kulit', 'KAP-SPT-03', 'Perlengkapan', 10, 'Pasang'),
    ('e0000000-0000-0000-0000-000000000004', 'Kopel Sabuk Hitam + Sarung Borgol', 'KAP-KPL-04', 'Aksesoris', 25, 'Pcs'),
    ('e0000000-0000-0000-0000-000000000005', 'Borgol Standar Polri Baja', 'KAP-BGL-05', 'Peralatan Jaga', 12, 'Unit'),
    ('e0000000-0000-0000-0000-000000000006', 'Tongkat T Satpam (Baton)', 'KAP-TGT-06', 'Peralatan Jaga', 15, 'Unit')
ON CONFLICT (id) DO NOTHING;
