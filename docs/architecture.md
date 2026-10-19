# Architecture Document
## Garda ERP — System Architecture & Database Design

| Atribut | Nilai |
|---|---|
| Produk | Garda ERP — Sistem ERP Khusus BUJP (Badan Usaha Jasa Pengamanan) |
| Source of Truth | `docs/prd.md` & referensi skill di `docs/skills/` (42 Layar) |
| Stack Teknis | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, React Aria / Shadcn, Supabase PostgreSQL, Supabase Auth |
| Versi Dokumen | 2.0 (Disinkronkan Penuh dengan Domain BUJP) |

---

## 1. System Architecture Overview

### 1.1 Diagram Arsitektur Tiga Lapis (3-Tier Layered Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / PRESENTATION LAYER                   │
│  - Next.js 15 App Router (React 19 Server & Client Components)           │
│  - Tailwind CSS v4 Dark Token System (#000000, #030712, #111827, #f59e0b)│
│  - Accessible Primitives: React Aria Components / Shadcn UI             │
│  - Data Grid (@tanstack/react-table), Org Chart (d3-hierarchy SVG)      │
│  - Strict 7-State Interaction (default, hover, focus, active, disabled,  │
│    loading, error) & WCAG 2.2 AA Compliance                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Server Actions / Route Handlers)
┌─────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION & BACKEND SERVICE LAYER               │
│  - Next.js Server Actions & API Routes (@supabase/ssr)                  │
│  - Authentication & Session: Supabase Auth (JWT with Custom Claims)    │
│  - Authorization Guard: RBAC Middleware (8 Modul x {view, manage})      │
│  - Zod Domain Validation Schemas (Strict Types, No any)                 │
│  - Report Exporters (PDF Generator via Puppeteer/React-PDF, XLSX)       │
│  - QR Code Engine for Security Patrol Checkpoints                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Supabase JS Client / RPC Calls)
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE & PERSISTENCE LAYER                    │
│  - Supabase PostgreSQL 15+ (Schema public)                              │
│  - Row Level Security (RLS) di Seluruh Tabel Master & Transaksional     │
│  - Atomic Business Functions (PostgreSQL RPC Functions):                │
│    * post_invoice_to_journal(p_invoice_id)                              │
│    * post_payroll_to_journal(p_payroll_run_id)                          │
│    * process_distribution_with_journal(p_distribution_id)               │
│    * approve_bko_request(p_request_id)                                  │
│    * validate_and_save_journal_entry(p_header, p_lines)                 │
│    * convert_applicant_to_personnel(p_applicant_id, p_data)             │
│  - Double-Entry Balance Constraints (Debit == Kredit, immutable journals)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Directory Structure (42 Routes Parity)

```text
ERP_2/
├── docs/
│   ├── prd.md                          # Source of Truth Persyaratan Produk BUJP
│   ├── architecture.md                 # Desain Arsitektur & Skema Database
│   ├── plan.md                         # Roadmap Rencana Implementasi Bertahap
│   └── skills/                         # 50 berkas referensi UI & domain Garda
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              # Guest Auth Layout (Dark Canvas)
│   │   │   └── login/
│   │   │       └── page.tsx            # AUTH-01: Portal Login
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # AppLayout: Global Responsive Sidebar (42 routes)
│   │   │   ├── page.tsx                # Redirect ke /dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # DASH-01: Dashboard Operasional BUJP
│   │   │   ├── security/               # Modul SEC: Operasional Pengamanan
│   │   │   │   ├── personnel/
│   │   │   │   │   ├── page.tsx        # SEC-01: Data Personil Security
│   │   │   │   │   ├── new/page.tsx    # SEC-02: Input Personil Baru
│   │   │   │   │   └── edit/[id]/page.tsx # SEC-02: Edit Data Personil
│   │   │   │   ├── clients/
│   │   │   │   │   ├── page.tsx        # SEC-03: Data Klien Mitra
│   │   │   │   │   └── new/page.tsx    # SEC-04: Registrasi Klien Baru
│   │   │   │   ├── sites/
│   │   │   │   │   ├── page.tsx        # SEC-05: Data Lokasi Jaga (Sites)
│   │   │   │   │   └── new/page.tsx    # SEC-06: Tambah Lokasi Jaga Baru
│   │   │   │   ├── checkpoints/
│   │   │   │   │   └── page.tsx        # SEC-07: Master Checkpoint & QR
│   │   │   │   ├── roster/
│   │   │   │   │   ├── page.tsx        # SEC-08: Jadwal Jaga (Rostering Grid)
│   │   │   │   │   └── new/page.tsx    # SEC-09: Plotting Jadwal Baru
│   │   │   │   └── bko-requests/
│   │   │   │       └── page.tsx        # SEC-10: Persetujuan BKO Request
│   │   │   ├── psb/admin/              # Modul PSB: Rekrutmen Satpam Baru
│   │   │   │   ├── applicants/
│   │   │   │   │   └── page.tsx        # PSB-01: Data Pelamar PSB
│   │   │   │   └── applicant-detail/
│   │   │   │       └── page.tsx        # PSB-02: Detail Kandidat & Konversi
│   │   │   ├── logistics/              # Modul LOG: Logistik & Perlengkapan Jaga
│   │   │   │   ├── warehouse/
│   │   │   │   │   └── page.tsx        # LOG-01: Gudang Logistik Pusat
│   │   │   │   ├── items/
│   │   │   │   │   ├── new/page.tsx    # LOG-02: Registrasi Item Baru
│   │   │   │   │   ├── detail/[id]/page.tsx # LOG-03: Detail Barang & Kartu Stok
│   │   │   │   │   └── edit/[id]/page.tsx   # LOG-04: Edit Barang
│   │   │   │   └── distribution/
│   │   │   │       └── page.tsx        # LOG-05: Distribusi Perlengkapan
│   │   │   ├── finance/                # Modul FIN: Keuangan Operasional
│   │   │   │   ├── invoices/
│   │   │   │   │   └── page.tsx        # FIN-01: Tagihan Klien (Invoicing)
│   │   │   │   ├── invoice/
│   │   │   │   │   └── new/page.tsx    # FIN-02: Buat Invoice Baru
│   │   │   │   ├── payroll/
│   │   │   │   │   └── page.tsx        # FIN-03: Penggajian (Payroll)
│   │   │   │   └── accounting/         # Modul ACC & RPT: Akuntansi & Laporan
│   │   │   │       ├── coa/
│   │   │   │       │   ├── page.tsx    # ACC-01: Chart of Accounts
│   │   │   │       │   └── new/page.tsx # ACC-02: Tambah Akun Baru
│   │   │   │       ├── journals/
│   │   │   │       │   ├── page.tsx    # ACC-03: Jurnal Umum
│   │   │   │       │   └── new/page.tsx # ACC-04: Input Jurnal Umum
│   │   │   │       └── reports/
│   │   │   │           ├── ledger/page.tsx            # RPT-01: Buku Besar
│   │   │   │           ├── receivables/page.tsx       # RPT-02: Buku Pembantu Piutang
│   │   │   │           ├── income-statement/page.tsx  # RPT-03: Laba Rugi
│   │   │   │           ├── balance-sheet/page.tsx     # RPT-04: Neraca Keuangan
│   │   │   │           ├── equity-changes/page.tsx    # RPT-05: Perubahan Ekuitas
│   │   │   │           ├── cash-flow/page.tsx         # RPT-06: Arus Kas
│   │   │   │           ├── management-analysis/page.tsx # RPT-07: Analisa Manajemen
│   │   │   │           └── balanced-scorecard/page.tsx  # RPT-08: Balanced Scorecard
│   │   │   └── settings/               # Modul SET: Pengaturan & Identitas
│   │   │       ├── institution/
│   │   │       │   └── page.tsx        # SET-01: Identitas & Organisasi
│   │   │       ├── org-chart/
│   │   │       │   └── page.tsx        # SET-02: Visual Struktur Organisasi
│   │   │       ├── users/
│   │   │       │   ├── page.tsx        # SET-03: Manajemen Pengguna
│   │   │       │   └── new/page.tsx    # SET-04: Tambah Pengguna Baru
│   │   │       ├── roles/
│   │   │       │   ├── page.tsx        # SET-05: Manajemen Role & Izin
│   │   │       │   ├── new/page.tsx    # SET-06: Buat Role Baru
│   │   │       │   └── edit/[id]/page.tsx # SET-07: Edit Role
│   │   │       └── backup/
│   │   │           └── page.tsx        # SET-08: Manajemen Data & Backup
│   │   └── api/                        # Route Handlers (Exports, QR, Cron)
│   ├── components/
│   │   ├── ui/                         # Primitif UI (Button, TextField, Dialog, dll)
│   │   ├── domain/                     # Komponen Khusus Domain (RosterGrid, OrgChart, dll)
│   │   └── layouts/                    # AppLayout, Sidebar, Navbar
│   ├── lib/
│   │   ├── supabase/                   # Supabase Server & Client SDK Helpers
│   │   ├── validations/                # Zod Schemas per Modul
│   │   ├── format.ts                   # IDR Currency, Tanggal Indonesia
│   │   └── permissions.ts              # RBAC Helpers
│   └── types/                          # TypeScript Database & Domain Types
└── supabase/
    └── migrations/                     # File Migrasi SQL untuk Supabase
```

---

## 3. Database Schema Design (20 Tabel BUJP)

Semua tabel dibuat dalam skema `public` dengan relasi foreign key, tipe moneter `numeric(18,2)`, dan constraint integritas data.

### 3.1 Hierarki, Pengaturan & Keamanan (SET & AUTH)

#### `institution_settings`
Menyimpan profil tunggal BUJP dan parameter global.
```sql
CREATE TABLE institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL, -- No Izin Operasional Mabes Polri
    npwp VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    logo_url TEXT,
    ppn_rate NUMERIC(5,2) NOT NULL DEFAULT 11.00, -- 11% / 12%
    pph23_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- 2%
    bpjs_kesehatan_rate NUMERIC(5,2) NOT NULL DEFAULT 1.00, -- 1% karyawan
    bpjs_ketenagakerjaan_rate NUMERIC(5,2) NOT NULL DEFAULT 3.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `org_units`
Pohon hierarki organisasi BUJP (*self-referencing tree*).
```sql
CREATE TABLE org_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    leader_name VARCHAR(150),
    parent_id UUID REFERENCES org_units(id) ON DELETE SET NULL,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `roles` & `role_permissions`
Definisi peran dan matriks 16 izin granular (8 modul x {`view`, `manage`}).
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL, -- security, recruitment, logistics, finance, accounting, reports, users, institution
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(role_id, module)
);
```

#### `profiles` (User Profiles terhubung dengan `auth.users`)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.2 Modul Operasional Pengamanan & Rekrutmen (SEC & PSB)

#### `clients` (Klien Mitra BUJP)
```sql
CREATE TABLE clients (
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
```

#### `sites` (Lokasi Jaga Pos Satpam)
```sql
CREATE TABLE sites (
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
```

#### `personnel` (Personel Satpam)
```sql
CREATE TABLE personnel (
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
    gada_level VARCHAR(50) CHECK (gada_level IN ('Pratama', 'Madya', 'Utama', 'Belum Ada')),
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
CREATE INDEX idx_personnel_kta_expiry ON personnel(kta_expiry_date);
CREATE INDEX idx_personnel_site ON personnel(current_site_id);
```

#### `checkpoints` (Titik Rute Patroli)
```sql
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    patrol_order INTEGER NOT NULL DEFAULT 1,
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, code)
);
```

#### `shifts` & `roster_assignments` (Jadwal Jaga Satpam)
```sql
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- Pagi, Siang, Malam, Middle
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE roster_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'present', 'absent', 'replaced', 'off')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(personnel_id, date) -- Mencegah double-shift di hari yang sama
);
CREATE INDEX idx_roster_site_date ON roster_assignments(site_id, date);
```

#### `bko_requests` (Permintaan Bantuan Kendali Operasi)
```sql
CREATE TABLE bko_requests (
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
```

#### `applicants` (Rekrutmen Satpam Baru / PSB)
```sql
CREATE TABLE applicants (
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
```

---

### 3.3 Modul Logistik & Perlengkapan Jaga (LOG)

#### `items` (Master Perlengkapan / Seragam Satpam)
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Seragam PDH, Seragam PDL, Kopel, Borgol, Tongkat, Senter, Rompi, dll
    unit VARCHAR(50) NOT NULL,      -- Stel, Pcs, Pasang, Unit
    size VARCHAR(20),               -- S, M, L, XL, XXL, All Size
    initial_stock INTEGER NOT NULL DEFAULT 0 CHECK (initial_stock >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    unit_price NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `stock_movements` (Kartu Stok / Audit Mutasi Barang)
```sql
CREATE TABLE stock_movements (
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
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id, created_at);
```

#### `distributions` & `distribution_lines` (Pengeluaran Barang)
```sql
CREATE TABLE distributions (
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

CREATE TABLE distribution_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(18,2) NOT NULL DEFAULT 0
);
```

---

### 3.4 Modul Keuangan & Akuntansi Double-Entry (FIN, ACC, RPT)

#### `invoices` & `invoice_lines` (Tagihan Jasa Pengamanan ke Klien)
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    period_month DATE NOT NULL, -- Awal bulan tagihan (e.g. 2026-10-01)
    due_date DATE NOT NULL,
    subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
    ppn_rate NUMERIC(5,2) NOT NULL DEFAULT 11.00,
    ppn_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    pph23_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
    journal_entry_id UUID, -- Terhubung ke entri jurnal saat issued
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    personnel_count INTEGER NOT NULL CHECK (personnel_count > 0),
    rate_per_personnel NUMERIC(18,2) NOT NULL CHECK (rate_per_personnel >= 0),
    line_total NUMERIC(18,2) NOT NULL CHECK (line_total >= 0)
);
```

#### `payroll_runs` & `payslips` (Siklus Penggajian Personel)
```sql
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_month DATE NOT NULL,
    run_date DATE NOT NULL,
    total_basic_salary NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_allowances NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_overtime NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_payroll_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
    journal_entry_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payslips (
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
```

#### `accounts` (Chart of Accounts Standar BUJP)
```sql
CREATE TABLE accounts (
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
```

#### `journal_entries` & `journal_lines` (Buku Catatan Jurnal Double-Entry)
```sql
CREATE TABLE journal_entries (
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

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    memo TEXT,
    CONSTRAINT check_debit_credit_not_both_zero CHECK (debit > 0 OR credit > 0),
    CONSTRAINT check_debit_or_credit_zero CHECK (debit = 0 OR credit = 0)
);
CREATE INDEX idx_journal_lines_account ON journal_lines(account_id);
```

---

## 4. PostgreSQL Functions (Atomic RPC Engine)

Semua transaksi ERP multi-tabel wajib dieksekusi secara atomik menggunakan PostgreSQL Functions dan dipanggil melalui `supabase.rpc()`:

### 4.1 RPC: Posting Invoice ke Jurnal (`post_invoice_to_journal`)
```sql
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
    IF v_inv.status <> 'draft' THEN
        RAISE EXCEPTION 'Invoice sudah terbit atau dibatalkan.';
    END IF;

    -- Dapatkan ID akun sistem
    SELECT id INTO v_acc_piutang FROM accounts WHERE code = '11200'; -- Piutang Usaha
    SELECT id INTO v_acc_pendapatan FROM accounts WHERE code = '41100'; -- Pendapatan Jasa Pengamanan
    SELECT id INTO v_acc_ppn FROM accounts WHERE code = '21400'; -- Utang PPN Keluaran

    -- Buat Journal Entry
    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, source_id, status)
    VALUES ('JRN-INV-' || v_inv.invoice_number, v_inv.period_month, 'Penerbitan Invoice No: ' || v_inv.invoice_number, 'invoice', v_inv.id, 'posted')
    RETURNING id INTO v_journal_id;

    -- Debit Piutang Usaha
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_piutang, v_inv.total_amount, 0, 'Piutang Invoice ' || v_inv.invoice_number);

    -- Kredit Pendapatan Jasa
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_pendapatan, 0, v_inv.subtotal, 'Pendapatan Jasa Penempatan Satpam');

    -- Kredit PPN Keluaran
    IF v_inv.ppn_amount > 0 THEN
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
```

### 4.2 RPC: Posting Payroll ke Jurnal (`post_payroll_to_journal`)
```sql
CREATE OR REPLACE FUNCTION post_payroll_to_journal(p_payroll_run_id UUID)
RETURNS UUID AS $$
DECLARE
    v_run RECORD;
    v_journal_id UUID;
    v_acc_beban_gaji UUID;
    v_acc_utang_gaji UUID;
    v_acc_utang_bpjs UUID;
    v_acc_utang_pph21 UUID;
BEGIN
    SELECT * INTO v_run FROM payroll_runs WHERE id = p_payroll_run_id FOR UPDATE;
    IF v_run.status <> 'draft' THEN
        RAISE EXCEPTION 'Payroll sudah diposting.';
    END IF;

    SELECT id INTO v_acc_beban_gaji FROM accounts WHERE code = '51100'; -- Beban Gaji Satpam
    SELECT id INTO v_acc_utang_gaji FROM accounts WHERE code = '21100'; -- Utang Gaji
    SELECT id INTO v_acc_utang_bpjs FROM accounts WHERE code = '21200'; -- Utang BPJS
    SELECT id INTO v_acc_utang_pph21 FROM accounts WHERE code = '21300'; -- Utang PPh 21

    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, source_id, status)
    VALUES ('JRN-PAY-' || TO_CHAR(v_run.period_month, 'YYYY-MM'), v_run.run_date, 'Beban Penggajian Satpam Periode ' || TO_CHAR(v_run.period_month, 'Mon YYYY'), 'payroll', v_run.id, 'posted')
    RETURNING id INTO v_journal_id;

    -- Debit Beban Gaji Total
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_beban_gaji, (v_run.total_basic_salary + v_run.total_allowances + v_run.total_overtime), 0, 'Beban Gaji & Lembur');

    -- Kredit Utang Gaji Netto
    INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
    VALUES (v_journal_id, v_acc_utang_gaji, 0, v_run.net_payroll_amount, 'Utang Gaji Netto');

    -- Kredit Utang Potongan
    IF v_run.total_deductions > 0 THEN
        INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo)
        VALUES (v_journal_id, v_acc_utang_bpjs, 0, v_run.total_deductions, 'Utang BPJS & Potongan');
    END IF;

    UPDATE payroll_runs 
    SET status = 'posted', journal_entry_id = v_journal_id 
    WHERE id = p_payroll_run_id;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 RPC: Validasi & Simpan Jurnal Umum Manual (`validate_and_save_journal_entry`)
```sql
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
    -- Validasi keseimbangan debit dan kredit
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        v_total_debit := v_total_debit + COALESCE((v_line->>'debit')::NUMERIC, 0);
        v_total_credit := v_total_credit + COALESCE((v_line->>'credit')::NUMERIC, 0);
    END LOOP;

    IF v_total_debit <> v_total_credit OR v_total_debit <= 0 THEN
        RAISE EXCEPTION 'Jurnal tidak seimbang: Total Debit (%), Total Kredit (%).', v_total_debit, v_total_credit;
    END IF;

    -- Insert Header
    INSERT INTO journal_entries (entry_number, entry_date, description, source_type, status)
    VALUES (
        p_header->>'entry_number',
        (p_header->>'entry_date')::DATE,
        p_header->>'description',
        'manual',
        'posted'
    ) RETURNING id INTO v_journal_id;

    -- Insert Lines
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
```

---

## 5. Row Level Security (RLS) & Authorization

Seluruh tabel publik mengaktifkan RLS:
```sql
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
```

Helper Function untuk Verifikasi Izin:
```sql
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
```
Contoh Kebijakan RLS:
```sql
-- Read Policy
CREATE POLICY "Allow read if user has module view permission" ON personnel
    FOR SELECT USING (check_user_permission('security', 'view'));

-- Manage Policy
CREATE POLICY "Allow write if user has module manage permission" ON personnel
    FOR ALL USING (check_user_permission('security', 'manage'));
```

---

## 6. Token Desain UI & Standar Aksesibilitas

Sesuai `docs/skills/frontend_guidelines.md` dan berkas token:
- **Kanvas**: `bg-[#000000]`
- **Card & Table Surface**: `bg-[#030712]`, `bg-[#111827]`, border `border-[#374151]`
- **Aksen Tombol & Sorotan**: Amber `bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold`
- **Fokus Keyboard (WCAG 2.2)**: `focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:outline-none`
- **Error State**: Field input invalid mendapat `aria-invalid="true"`, border `#f87171`, dan teks error `#f87171` terhubung melalui `aria-describedby`.
