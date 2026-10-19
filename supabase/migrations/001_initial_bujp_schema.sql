-- ============================================================================
-- GARDA ERP BUJP: INITIAL DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL 15+
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. IDENTITAS & ORGANISASI
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    npwp VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    logo_url TEXT,
    ppn_rate NUMERIC(5,2) NOT NULL DEFAULT 11.00,
    pph23_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    bpjs_kesehatan_rate NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    bpjs_ketenagakerjaan_rate NUMERIC(5,2) NOT NULL DEFAULT 3.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    leader_name VARCHAR(150),
    parent_id UUID REFERENCES org_units(id) ON DELETE SET NULL,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. ROLES, PERMISSIONS & USER PROFILES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(role_id, module)
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. OPERASIONAL PENGAMANAN (SEC & PSB)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    npwp VARCHAR(50),
    billing_address TEXT NOT NULL,
    pic_name VARCHAR(150) NOT NULL,
    pic_phone VARCHAR(50) NOT NULL,
    pic_email VARCHAR(100),
    contract_end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    required_personnel_per_shift INTEGER NOT NULL DEFAULT 1 CHECK (required_personnel_per_shift > 0),
    monthly_rate_per_personnel NUMERIC(18,2) NOT NULL CHECK (monthly_rate_per_personnel >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('Laki-laki', 'Perempuan')),
    address TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    kta_number VARCHAR(100) UNIQUE,
    kta_expiry_date DATE,
    gada_level VARCHAR(50) DEFAULT 'Belum Ada' CHECK (gada_level IN ('Pratama', 'Madya', 'Utama', 'Belum Ada')),
    gada_certificate_number VARCHAR(100),
    position VARCHAR(100) NOT NULL DEFAULT 'Anggota',
    join_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'leave', 'inactive')),
    current_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personnel_kta_expiry ON personnel(kta_expiry_date);
CREATE INDEX IF NOT EXISTS idx_personnel_site ON personnel(current_site_id);

CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    patrol_order INTEGER NOT NULL DEFAULT 1,
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, code)
);

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS roster_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'present', 'absent', 'replaced', 'off')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(personnel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_roster_site_date ON roster_assignments(site_id, date);

CREATE TABLE IF NOT EXISTS bko_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    origin_site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    target_site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gada_level VARCHAR(50) DEFAULT 'Belum Ada',
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'document_review', 'fitness_test', 'interview', 'accepted', 'rejected')),
    score NUMERIC(5,2),
    notes TEXT,
    converted_to_personnel_id UUID REFERENCES personnel(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. LOGISTIK & PERLENGKAPAN JAGA (LOG)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    size VARCHAR(20),
    initial_stock INTEGER NOT NULL DEFAULT 0 CHECK (initial_stock >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    unit_price NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reference_number VARCHAR(100),
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('personnel', 'site', 'supplier', 'adjustment')),
    recipient_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id, created_at);

CREATE TABLE IF NOT EXISTS distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_number VARCHAR(100) UNIQUE NOT NULL,
    distribution_date DATE NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('personnel', 'site')),
    personnel_id UUID REFERENCES personnel(id),
    site_id UUID REFERENCES sites(id),
    recipient_name VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(18,2) NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 5. KEUANGAN & AKUNTANSI DOUBLE-ENTRY (FIN, ACC, RPT)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Aset', 'Liabilitas', 'Ekuitas', 'Pendapatan', 'Beban')),
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    parent_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(100) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('invoice', 'payroll', 'distribution', 'manual', 'closing')),
    source_id UUID,
    site_id UUID REFERENCES sites(id),
    status VARCHAR(50) NOT NULL DEFAULT 'posted' CHECK (status IN ('draft', 'posted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    memo TEXT,
    CONSTRAINT check_debit_credit_not_both_zero CHECK (debit > 0 OR credit > 0),
    CONSTRAINT check_debit_or_credit_zero CHECK (debit = 0 OR credit = 0)
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    period_month DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
    ppn_rate NUMERIC(5,2) NOT NULL DEFAULT 11.00,
    ppn_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    pph23_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    personnel_count INTEGER NOT NULL CHECK (personnel_count > 0),
    rate_per_personnel NUMERIC(18,2) NOT NULL CHECK (rate_per_personnel >= 0),
    line_total NUMERIC(18,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_month DATE NOT NULL,
    run_date DATE NOT NULL,
    total_basic_salary NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_allowances NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_overtime NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_payroll_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE RESTRICT,
    site_id UUID REFERENCES sites(id),
    basic_salary NUMERIC(18,2) NOT NULL,
    allowance_position NUMERIC(18,2) DEFAULT 0,
    overtime_amount NUMERIC(18,2) DEFAULT 0,
    bpjs_kesehatan NUMERIC(18,2) DEFAULT 0,
    bpjs_ketenagakerjaan NUMERIC(18,2) DEFAULT 0,
    pph21_amount NUMERIC(18,2) DEFAULT 0,
    uniform_deduction NUMERIC(18,2) DEFAULT 0,
    net_salary NUMERIC(18,2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bko_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTION & BASIC POLICIES
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_user_permission(p_module VARCHAR, p_action VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_role_id UUID;
    v_allowed BOOLEAN := FALSE;
BEGIN
    SELECT role_id INTO v_role_id FROM profiles WHERE id = auth.uid() AND is_active = TRUE;
    IF v_role_id IS NULL THEN RETURN FALSE; END IF;

    IF p_action = 'view' THEN
        SELECT can_view INTO v_allowed FROM role_permissions WHERE role_id = v_role_id AND module = p_module;
    ELSIF p_action = 'manage' THEN
        SELECT can_manage INTO v_allowed FROM role_permissions WHERE role_id = v_role_id AND module = p_module;
    END IF;

    RETURN COALESCE(v_allowed, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Global Authenticated Read Policies
CREATE POLICY "Auth Read Institution" ON institution_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Org Units" ON org_units FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Roles" ON roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Role Permissions" ON role_permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Profiles" ON profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Shifts" ON shifts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth Read Accounts" ON accounts FOR SELECT TO authenticated USING (TRUE);

-- Module RBAC Policies
CREATE POLICY "Security View Personnel" ON personnel FOR SELECT TO authenticated USING (check_user_permission('security', 'view') OR check_user_permission('recruitment', 'view'));
CREATE POLICY "Security Manage Personnel" ON personnel FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Security View Clients" ON clients FOR SELECT TO authenticated USING (check_user_permission('security', 'view') OR check_user_permission('finance', 'view'));
CREATE POLICY "Security Manage Clients" ON clients FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Security View Sites" ON sites FOR SELECT TO authenticated USING (check_user_permission('security', 'view') OR check_user_permission('finance', 'view'));
CREATE POLICY "Security Manage Sites" ON sites FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Security View Checkpoints" ON checkpoints FOR SELECT TO authenticated USING (check_user_permission('security', 'view'));
CREATE POLICY "Security Manage Checkpoints" ON checkpoints FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Security View Roster" ON roster_assignments FOR SELECT TO authenticated USING (check_user_permission('security', 'view'));
CREATE POLICY "Security Manage Roster" ON roster_assignments FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Security View BKO" ON bko_requests FOR SELECT TO authenticated USING (check_user_permission('security', 'view'));
CREATE POLICY "Security Manage BKO" ON bko_requests FOR ALL TO authenticated USING (check_user_permission('security', 'manage'));

CREATE POLICY "Recruitment View Applicants" ON applicants FOR SELECT TO authenticated USING (check_user_permission('recruitment', 'view'));
CREATE POLICY "Recruitment Manage Applicants" ON applicants FOR ALL TO authenticated USING (check_user_permission('recruitment', 'manage'));

CREATE POLICY "Logistics View Items" ON items FOR SELECT TO authenticated USING (check_user_permission('logistics', 'view'));
CREATE POLICY "Logistics Manage Items" ON items FOR ALL TO authenticated USING (check_user_permission('logistics', 'manage'));

CREATE POLICY "Logistics View Stock" ON stock_movements FOR SELECT TO authenticated USING (check_user_permission('logistics', 'view'));
CREATE POLICY "Logistics Manage Stock" ON stock_movements FOR ALL TO authenticated USING (check_user_permission('logistics', 'manage'));

CREATE POLICY "Logistics View Distributions" ON distributions FOR SELECT TO authenticated USING (check_user_permission('logistics', 'view'));
CREATE POLICY "Logistics Manage Distributions" ON distributions FOR ALL TO authenticated USING (check_user_permission('logistics', 'manage'));

CREATE POLICY "Logistics View Distribution Lines" ON distribution_lines FOR SELECT TO authenticated USING (check_user_permission('logistics', 'view'));
CREATE POLICY "Logistics Manage Distribution Lines" ON distribution_lines FOR ALL TO authenticated USING (check_user_permission('logistics', 'manage'));

CREATE POLICY "Finance View Invoices" ON invoices FOR SELECT TO authenticated USING (check_user_permission('finance', 'view'));
CREATE POLICY "Finance Manage Invoices" ON invoices FOR ALL TO authenticated USING (check_user_permission('finance', 'manage'));

CREATE POLICY "Finance View Invoice Lines" ON invoice_lines FOR SELECT TO authenticated USING (check_user_permission('finance', 'view'));
CREATE POLICY "Finance Manage Invoice Lines" ON invoice_lines FOR ALL TO authenticated USING (check_user_permission('finance', 'manage'));

CREATE POLICY "Finance View Payroll" ON payroll_runs FOR SELECT TO authenticated USING (check_user_permission('finance', 'view'));
CREATE POLICY "Finance Manage Payroll" ON payroll_runs FOR ALL TO authenticated USING (check_user_permission('finance', 'manage'));

CREATE POLICY "Finance View Payslips" ON payslips FOR SELECT TO authenticated USING (check_user_permission('finance', 'view'));
CREATE POLICY "Finance Manage Payslips" ON payslips FOR ALL TO authenticated USING (check_user_permission('finance', 'manage'));

CREATE POLICY "Accounting View Journals" ON journal_entries FOR SELECT TO authenticated USING (check_user_permission('accounting', 'view') OR check_user_permission('reports', 'view'));
CREATE POLICY "Accounting Manage Journals" ON journal_entries FOR ALL TO authenticated USING (check_user_permission('accounting', 'manage'));

CREATE POLICY "Accounting View Journal Lines" ON journal_lines FOR SELECT TO authenticated USING (check_user_permission('accounting', 'view') OR check_user_permission('reports', 'view'));
CREATE POLICY "Accounting Manage Journal Lines" ON journal_lines FOR ALL TO authenticated USING (check_user_permission('accounting', 'manage'));
