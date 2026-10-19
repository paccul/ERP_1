// Dihasilkan oleh `php artisan garda:export-enums`. Jangan diedit manual.

export const AccountCategory = {
    Asset: 'asset',
    Liability: 'liability',
    Equity: 'equity',
    Revenue: 'revenue',
    Expense: 'expense',
} as const;
export type AccountCategory = (typeof AccountCategory)[keyof typeof AccountCategory];
export const AccountCategoryLabel: Record<AccountCategory, string> = {
    'asset': 'Aset',
    'liability': 'Liabilitas',
    'equity': 'Ekuitas',
    'revenue': 'Pendapatan',
    'expense': 'Beban',
};

export const ApplicantStatus = {
    New: 'new',
    Screening: 'screening',
    Accepted: 'accepted',
    Rejected: 'rejected',
} as const;
export type ApplicantStatus = (typeof ApplicantStatus)[keyof typeof ApplicantStatus];
export const ApplicantStatusLabel: Record<ApplicantStatus, string> = {
    'new': 'Baru',
    'screening': 'Seleksi',
    'accepted': 'Diterima',
    'rejected': 'Ditolak',
};

export const BkoStatus = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
} as const;
export type BkoStatus = (typeof BkoStatus)[keyof typeof BkoStatus];
export const BkoStatusLabel: Record<BkoStatus, string> = {
    'pending': 'Menunggu',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
};

export const CashFlowGroup = {
    Cash: 'cash',
    Operating: 'operating',
    Investing: 'investing',
    Financing: 'financing',
} as const;
export type CashFlowGroup = (typeof CashFlowGroup)[keyof typeof CashFlowGroup];
export const CashFlowGroupLabel: Record<CashFlowGroup, string> = {
    'cash': 'Kas dan Setara Kas',
    'operating': 'Aktivitas Operasi',
    'investing': 'Aktivitas Investasi',
    'financing': 'Aktivitas Pendanaan',
};

export const GadaLevel = {
    Pratama: 'pratama',
    Madya: 'madya',
    Utama: 'utama',
} as const;
export type GadaLevel = (typeof GadaLevel)[keyof typeof GadaLevel];
export const GadaLevelLabel: Record<GadaLevel, string> = {
    'pratama': 'Gada Pratama',
    'madya': 'Gada Madya',
    'utama': 'Gada Utama',
};

export const Gender = {
    Male: 'male',
    Female: 'female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const GenderLabel: Record<Gender, string> = {
    'male': 'Laki-laki',
    'female': 'Perempuan',
};

export const InvoiceStatus = {
    Draft: 'draft',
    Issued: 'issued',
    Paid: 'paid',
    Void: 'void',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export const InvoiceStatusLabel: Record<InvoiceStatus, string> = {
    'draft': 'Draf',
    'issued': 'Terbit',
    'paid': 'Lunas',
    'void': 'Batal',
};

export const JournalStatus = {
    Draft: 'draft',
    Posted: 'posted',
} as const;
export type JournalStatus = (typeof JournalStatus)[keyof typeof JournalStatus];
export const JournalStatusLabel: Record<JournalStatus, string> = {
    'draft': 'Draf',
    'posted': 'Terposting',
};

export const NormalBalance = {
    Debit: 'debit',
    Credit: 'credit',
} as const;
export type NormalBalance = (typeof NormalBalance)[keyof typeof NormalBalance];
export const NormalBalanceLabel: Record<NormalBalance, string> = {
    'debit': 'Debit',
    'credit': 'Kredit',
};

export const PayrollStatus = {
    Draft: 'draft',
    Posted: 'posted',
} as const;
export type PayrollStatus = (typeof PayrollStatus)[keyof typeof PayrollStatus];
export const PayrollStatusLabel: Record<PayrollStatus, string> = {
    'draft': 'Draf',
    'posted': 'Terposting',
};

export const PersonnelStatus = {
    Active: 'active',
    Leave: 'leave',
    Inactive: 'inactive',
} as const;
export type PersonnelStatus = (typeof PersonnelStatus)[keyof typeof PersonnelStatus];
export const PersonnelStatusLabel: Record<PersonnelStatus, string> = {
    'active': 'Aktif',
    'leave': 'Cuti',
    'inactive': 'Nonaktif',
};

export const RecipientType = {
    Personnel: 'personnel',
    Site: 'site',
} as const;
export type RecipientType = (typeof RecipientType)[keyof typeof RecipientType];
export const RecipientTypeLabel: Record<RecipientType, string> = {
    'personnel': 'Personel',
    'site': 'Lokasi Jaga',
};

export const RosterSource = {
    Plot: 'plot',
    Bko: 'bko',
} as const;
export type RosterSource = (typeof RosterSource)[keyof typeof RosterSource];
export const RosterSourceLabel: Record<RosterSource, string> = {
    'plot': 'Plotting',
    'bko': 'BKO',
};

export const SiteStatus = {
    Active: 'active',
    Inactive: 'inactive',
} as const;
export type SiteStatus = (typeof SiteStatus)[keyof typeof SiteStatus];
export const SiteStatusLabel: Record<SiteStatus, string> = {
    'active': 'Aktif',
    'inactive': 'Nonaktif',
};

export const StockMovementType = {
    In: 'in',
    Out: 'out',
    Adjust: 'adjust',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];
export const StockMovementTypeLabel: Record<StockMovementType, string> = {
    'in': 'Masuk',
    'out': 'Keluar',
    'adjust': 'Penyesuaian',
};
