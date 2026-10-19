-- ============================================================================
-- GARDA ERP BUJP: ATOMIC RPC FUNCTIONS & SEED DATA
-- Target: Supabase PostgreSQL 15+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RPC: POST INVOICE TO JOURNAL
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION post_invoice_to_journal(p_invoice_id UUID)
RETURNS UUID AS $$
DECLARE
    v_inv RECORD;
    v_journal_id UUID;
    v_acc_piutang UUID;
    v_acc_pendapatan UUID;
    v_acc_ppn UUID;
BEGIN
    SELECT * INTO v_inv FROM invoices WHERE id = p_invoice_id FOR UPDATE;
    IF v_inv.id IS NULL THEN
        RAISE EXCEPTION 'Invoice tidak ditemukan.';
    END IF;

    IF v_inv.status <> 'draft' THEN
        RAISE EXCEPTION 'Hanya invoice berstatus draf yang dapat diterbitkan.';
    END IF;

    -- Dapatkan ID Akun
    SELECT id INTO v_acc_piutang FROM accounts WHERE code = '11200' LIMIT 1;
    SELECT id INTO v_acc_pendapatan FROM accounts WHERE code = '41100' LIMIT 1;
    SELECT id INTO v_acc_ppn FROM accounts WHERE code = '21400' LIMIT 1;

    IF v_acc_piutang IS NULL OR v_acc_pendapatan IS NULL THEN
        RAISE EXCEPTION 'Akun Piutang Usaha (11200) atau Pendapatan Jasa (41100) belum terdaftar di COA.';
    END IF;

    -- Buat Journal Entry
    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, source_id, status)
    VALUES (
        'JRN-INV-' || v_inv.invoice_number,
        v_inv.period_month,
        'Penerbitan Invoice No: ' || v_inv.invoice_number,
        'invoice',
        v_inv.id,
        'posted'
    ) RETURNING id INTO v_journal_id;

    -- Debit Piutang Usaha (Total Tagihan)
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_piutang, v_inv.total_amount, 0, 'Piutang Invoice ' || v_inv.invoice_number);

    -- Kredit Pendapatan Jasa Pengamanan (Subtotal)
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_pendapatan, 0, v_inv.subtotal, 'Pendapatan Jasa Penempatan Satpam');

    -- Kredit PPN Keluaran jika ada
    IF v_inv.ppn_amount > 0 AND v_acc_ppn IS NOT NULL THEN
        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (v_journal_id, v_acc_ppn, 0, v_inv.ppn_amount, 'PPN Keluaran Faktur');
    END IF;

    -- Update status invoice
    UPDATE invoices
    SET status = 'issued', journal_entry_id = v_journal_id, updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. RPC: POST PAYROLL TO JOURNAL
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION post_payroll_to_journal(p_payroll_run_id UUID)
RETURNS UUID AS $$
DECLARE
    v_run RECORD;
    v_journal_id UUID;
    v_acc_beban_gaji UUID;
    v_acc_utang_gaji UUID;
    v_acc_utang_bpjs UUID;
    v_total_beban NUMERIC(18,2);
BEGIN
    SELECT * INTO v_run FROM payroll_runs WHERE id = p_payroll_run_id FOR UPDATE;
    IF v_run.id IS NULL THEN
        RAISE EXCEPTION 'Data penggajian tidak ditemukan.';
    END IF;

    IF v_run.status <> 'draft' THEN
        RAISE EXCEPTION 'Hanya penggajian berstatus draf yang dapat diposting.';
    END IF;

    SELECT id INTO v_acc_beban_gaji FROM accounts WHERE code = '51100' LIMIT 1;
    SELECT id INTO v_acc_utang_gaji FROM accounts WHERE code = '21100' LIMIT 1;
    SELECT id INTO v_acc_utang_bpjs FROM accounts WHERE code = '21200' LIMIT 1;

    IF v_acc_beban_gaji IS NULL OR v_acc_utang_gaji IS NULL THEN
        RAISE EXCEPTION 'Akun Beban Gaji (51100) atau Utang Gaji (21100) belum terdaftar di COA.';
    END IF;

    v_total_beban := v_run.total_basic_salary + v_run.total_allowances + v_run.total_overtime;

    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, source_id, status)
    VALUES (
        'JRN-PAY-' || TO_CHAR(v_run.period_month, 'YYYY-MM'),
        v_run.run_date,
        'Beban Penggajian Satpam Periode ' || TO_CHAR(v_run.period_month, 'Mon YYYY'),
        'payroll',
        v_run.id,
        'posted'
    ) RETURNING id INTO v_journal_id;

    -- Debit Total Beban Gaji
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_beban_gaji, v_total_beban, 0, 'Beban Gaji & Lembur Satpam');

    -- Kredit Utang Gaji Netto
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_utang_gaji, 0, v_run.net_payroll_amount, 'Utang Gaji Personel');

    -- Kredit Utang Potongan BPJS & Lainnya
    IF v_run.total_deductions > 0 THEN
        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (v_journal_id, COALESCE(v_acc_utang_bpjs, v_acc_utang_gaji), 0, v_run.total_deductions, 'Utang Iuran BPJS & Potongan');
    END IF;

    UPDATE payroll_runs
    SET status = 'posted', journal_entry_id = v_journal_id
    WHERE id = p_payroll_run_id;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. RPC: PROCESS DISTRIBUTION WITH JOURNAL
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION process_distribution_with_journal(p_distribution_id UUID)
RETURNS UUID AS $$
DECLARE
    v_dist RECORD;
    v_line RECORD;
    v_item RECORD;
    v_journal_id UUID;
    v_acc_beban_logistik UUID;
    v_acc_persediaan UUID;
    v_total_cost NUMERIC(18,2) := 0;
BEGIN
    SELECT * INTO v_dist FROM distributions WHERE id = p_distribution_id FOR UPDATE;
    IF v_dist.id IS NULL THEN
        RAISE EXCEPTION 'Data distribusi tidak ditemukan.';
    END IF;

    SELECT id INTO v_acc_beban_logistik FROM accounts WHERE code = '51300' LIMIT 1;
    SELECT id INTO v_acc_persediaan FROM accounts WHERE code = '11300' LIMIT 1;

    -- Kurangi stok untuk setiap baris barang
    FOR v_line IN SELECT * FROM distribution_lines WHERE distribution_id = p_distribution_id LOOP
        SELECT * INTO v_item FROM items WHERE id = v_line.item_id FOR UPDATE;
        IF v_item.current_stock < v_line.quantity THEN
            RAISE EXCEPTION 'Stok barang % tidak mencukupi (Tersedia: %, Diminta: %).', v_item.name, v_item.current_stock, v_line.quantity;
        END IF;

        UPDATE items
        SET current_stock = current_stock - v_line.quantity, updated_at = NOW()
        WHERE id = v_line.item_id;

        INSERT INTO stock_movements (
            item_id, movement_type, quantity, balance_after, reference_number,
            recipient_type, recipient_id, notes
        ) VALUES (
            v_line.item_id, 'out', v_line.quantity, v_item.current_stock - v_line.quantity,
            v_dist.distribution_number, v_dist.target_type,
            COALESCE(v_dist.personnel_id, v_dist.site_id),
            'Distribusi kepada: ' || v_dist.recipient_name
        );

        v_total_cost := v_total_cost + (v_line.quantity * v_item.unit_price);
    END LOOP;

    -- Buat Jurnal Akuntansi jika akun terdaftar dan total biaya > 0
    IF v_total_cost > 0 AND v_acc_beban_logistik IS NOT NULL AND v_acc_persediaan IS NOT NULL THEN
        INSERT INTO journal_entries (entry_number, entry_date, description, source_type, source_id, status)
        VALUES (
            'JRN-DIST-' || v_dist.distribution_number,
            v_dist.distribution_date,
            'Pengeluaran Perlengkapan Satpam: ' || v_dist.distribution_number,
            'distribution',
            v_dist.id,
            'posted'
        ) RETURNING id INTO v_journal_id;

        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (v_journal_id, v_acc_beban_logistik, v_total_cost, 0, 'Beban Perlengkapan Satpam');

        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (v_journal_id, v_acc_persediaan, 0, v_total_cost, 'Pengurangan Persediaan Seragam');
    END IF;

    RETURN v_dist.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. RPC: APPROVE BKO REQUEST
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION approve_bko_request(p_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_bko RECORD;
BEGIN
    SELECT * INTO v_bko FROM bko_requests WHERE id = p_request_id FOR UPDATE;
    IF v_bko.id IS NULL THEN
        RAISE EXCEPTION 'Permintaan BKO tidak ditemukan.';
    END IF;

    IF v_bko.status <> 'pending' THEN
        RAISE EXCEPTION 'Permintaan BKO sudah diproses sebelumnya.';
    END IF;

    -- Update roster penugasan pada rentang tanggal BKO ke site tujuan
    UPDATE roster_assignments
    SET site_id = v_bko.target_site_id
    WHERE personnel_id = v_bko.personnel_id
      AND date BETWEEN v_bko.start_date AND v_bko.end_date;

    UPDATE bko_requests
    SET status = 'approved', approved_by = auth.uid(), updated_at = NOW()
    WHERE id = p_request_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. RPC: VALIDATE & SAVE JOURNAL ENTRY (DOUBLE-ENTRY)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION validate_and_save_journal_entry(
    p_header JSONB,
    p_lines JSONB
)
RETURNS UUID AS $$
DECLARE
    v_journal_id UUID;
    v_total_debit NUMERIC(18,2) := 0;
    v_total_credit NUMERIC(18,2) := 0;
    v_line JSONB;
BEGIN
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        v_total_debit := v_total_debit + COALESCE((v_line->>'debit')::NUMERIC, 0);
        v_total_credit := v_total_credit + COALESCE((v_line->>'credit')::NUMERIC, 0);
    END LOOP;

    IF v_total_debit <> v_total_credit OR v_total_debit <= 0 THEN
        RAISE EXCEPTION 'Jurnal tidak seimbang: Total Debit (%), Total Kredit (%).', v_total_debit, v_total_credit;
    END IF;

    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, status)
    VALUES (
        p_header->>'entry_number',
        (p_header->>'entry_date')::DATE,
        p_header->>'description',
        'manual',
        'posted'
    ) RETURNING id INTO v_journal_id;

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (
            v_journal_id,
            (v_line->>'account_id')::UUID,
            COALESCE((v_line->>'debit')::NUMERIC, 0),
            COALESCE((v_line->>'credit')::NUMERIC, 0),
            v_line->>'memo'
        );
    END LOOP;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. RPC: CONVERT APPLICANT TO PERSONNEL
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION convert_applicant_to_personnel(
    p_applicant_id UUID,
    p_personnel_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_app RECORD;
    v_personnel_id UUID;
BEGIN
    SELECT * INTO v_app FROM applicants WHERE id = p_applicant_id FOR UPDATE;
    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'Data pelamar tidak ditemukan.';
    END IF;

    IF v_app.status <> 'accepted' THEN
        RAISE EXCEPTION 'Hanya pelamar dengan status diterima yang dapat dikonversi menjadi personel.';
    END IF;

    INSERT INTO personnel (
        nik, full_name, birth_place, birth_date, gender, phone, email, address,
        gada_level, position, join_date, status, current_site_id
    ) VALUES (
        v_app.nik,
        v_app.full_name,
        v_app.birth_place,
        v_app.birth_date,
        v_app.gender,
        v_app.phone,
        v_app.email,
        v_app.address,
        v_app.gada_level,
        COALESCE(p_personnel_data->>'position', 'Anggota'),
        COALESCE((p_personnel_data->>'join_date')::DATE, CURRENT_DATE),
        'active',
        (p_personnel_data->>'current_site_id')::UUID
    ) RETURNING id INTO v_personnel_id;

    UPDATE applicants
    SET converted_to_personnel_id = v_personnel_id, updated_at = NOW()
    WHERE id = p_applicant_id;

    RETURN v_personnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 7. INITIAL SEED DATA (ROLES, SHIFTS, COA STANDAR BUJP)
-- ----------------------------------------------------------------------------

-- Shifts Seeder
INSERT INTO shifts (name, start_time, end_time) VALUES
    ('Pagi', '07:00:00', '15:00:00'),
    ('Siang', '15:00:00', '23:00:00'),
    ('Malam', '23:00:00', '07:00:00'),
    ('Off', '00:00:00', '00:00:00')
ON CONFLICT DO NOTHING;

-- Roles Seeder
INSERT INTO roles (name, description, is_system) VALUES
    ('Administrator Sistem', 'Akses penuh administrasi institusi, pengguna, dan backup', TRUE),
    ('Manajer Operasional', 'Pengelolaan personel satpam, klien, sites, roster, dan BKO', TRUE),
    ('Staf Rekrutmen', 'Seleksi pelamar PSB dan konversi ke personel', TRUE),
    ('Staf Logistik', 'Inventaris gudang, kartu stok, dan distribusi seragam/alat', TRUE),
    ('Staf Keuangan', 'Penerbitan tagihan invoice dan pemrosesan gaji satpam', TRUE),
    ('Akuntan', 'Bagan akun COA, jurnal umum double-entry, buku besar', TRUE),
    ('Direksi', 'Pemantauan dashboard eksekutif, laporan keuangan, dan BSC', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Chart of Accounts Standar BUJP Seeder
INSERT INTO accounts (code, name, category, normal_balance, is_system, is_active) VALUES
    ('11100', 'Kas & Bank Operasional', 'Aset', 'debit', TRUE, TRUE),
    ('11200', 'Piutang Usaha Klien Mitra', 'Aset', 'debit', TRUE, TRUE),
    ('11300', 'Persediaan Seragam & Logistik', 'Aset', 'debit', TRUE, TRUE),
    ('21100', 'Utang Gaji Personel Satpam', 'Liabilitas', 'credit', TRUE, TRUE),
    ('21200', 'Utang BPJS Ketenagakerjaan & Kesehatan', 'Liabilitas', 'credit', TRUE, TRUE),
    ('21300', 'Utang PPh Pasal 21 Karyawan', 'Liabilitas', 'credit', TRUE, TRUE),
    ('21400', 'Utang PPN Keluaran', 'Liabilitas', 'credit', TRUE, TRUE),
    ('31100', 'Modal Disetor', 'Ekuitas', 'credit', TRUE, TRUE),
    ('31200', 'Laba Ditahan', 'Ekuitas', 'credit', TRUE, TRUE),
    ('41100', 'Pendapatan Jasa Pengamanan', 'Pendapatan', 'credit', TRUE, TRUE),
    ('51100', 'Beban Gaji & Upah Satpam', 'Beban', 'debit', TRUE, TRUE),
    ('51200', 'Beban BPJS Karyawan', 'Beban', 'debit', TRUE, TRUE),
    ('51300', 'Beban Perlengkapan & Seragam Satpam', 'Beban', 'debit', TRUE, TRUE),
    ('61100', 'Beban Operasional Kantor & Adm', 'Beban', 'debit', TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;
