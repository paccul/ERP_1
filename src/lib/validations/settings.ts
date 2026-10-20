import { z } from "zod";

export const institutionSettingsSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(3, "Nama perusahaan wajib diisi minimal 3 karakter"),
  license_number: z.string().min(3, "Nomor Izin Mabes Polri / SIO wajib diisi"),
  npwp: z.string().min(10, "NPWP BUJP wajib diisi dengan benar"),
  address: z.string().min(5, "Alamat kantor pusat wajib diisi"),
  phone: z.string().min(5, "Nomor telepon operasional wajib diisi"),
  email: z.string().email("Format email kantor tidak valid"),
  ppn_rate: z.coerce.number().min(0, "Tarif PPN minimal 0%").max(100, "Tarif PPN maksimal 100%"),
  pph23_rate: z.coerce.number().min(0, "Tarif PPh 23 minimal 0%").max(100, "Tarif PPh 23 maksimal 100%"),
  bpjs_ketenagakerjaan_rate: z.coerce.number().min(0).max(100),
  bpjs_kesehatan_rate: z.coerce.number().min(0).max(100),
  logo_url: z.string().nullable().optional(),
});

export type InstitutionSettingsInput = z.infer<typeof institutionSettingsSchema>;

export const orgUnitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama unit / divisi organisasi wajib diisi"),
  code: z.string().min(2, "Kode unit wajib diisi (misal: DIR-OPS)"),
  level: z.coerce.number().int().min(1).max(10),
  leader_name: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
});

export type OrgUnitInput = z.infer<typeof orgUnitSchema>;

export const userProfileSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2, "Nama lengkap wajib diisi minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role_id: z.string().min(1, "Role penugasan wajib dipilih"),
  is_active: z.boolean().default(true),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  avatar_url: z.string().nullable().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const roleModulePermissionSchema = z.object({
  module: z.string(),
  can_view: z.boolean(),
  can_manage: z.boolean(),
});

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama role wajib diisi"),
  description: z.string().optional().nullable(),
  permissions: z.array(roleModulePermissionSchema),
});

export type RoleInput = z.infer<typeof roleSchema>;

export const ALL_SYSTEM_MODULES = [
  { key: "security", label: "Operasional Pengamanan (Personel, Klien, Sites, Roster, BKO)" },
  { key: "recruitment", label: "Rekrutmen Calon Satpam (PSB & Seleksi Dokumen)" },
  { key: "logistics", label: "Gudang Logistik, Seragam & Distribusi Kaporlap" },
  { key: "finance", label: "Keuangan Operasional (Invoicing & Penggajian Payroll)" },
  { key: "accounting", label: "Bagan Akun (COA) & Jurnal Umum Double-Entry" },
  { key: "reports", label: "Buku Besar, Neraca, Laba Rugi & Balanced Scorecard" },
  { key: "users", label: "Manajemen Akun Pengguna & Hak Akses" },
  { key: "institution", label: "Profil BUJP, SIO Mabes Polri, Struktur & Backup" },
];

export interface RolePermissionItem {
  id: string;
  module: string;
  can_view: boolean;
  can_manage: boolean;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean | null;
  created_at?: string | null;
  role_permissions: RolePermissionItem[];
}

