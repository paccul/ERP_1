import { z } from "zod";

export const gadaLevelEnum = z.enum(["Belum Ada", "Pratama", "Madya", "Utama"]);
export type GadaLevel = z.infer<typeof gadaLevelEnum>;

export const personnelStatusEnum = z.enum(["active", "leave", "inactive"]);
export type PersonnelStatus = z.infer<typeof personnelStatusEnum>;

export const personnelFormSchema = z
  .object({
    // 1. Biodata Utama
    nik: z
      .string()
      .min(16, "NIK harus terdiri dari 16 digit angka")
      .max(16, "NIK maksimal 16 digit angka")
      .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
    full_name: z
      .string()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    gender: z.enum(["Laki-laki", "Perempuan"]).default("Laki-laki"),
    birth_place: z.string().optional().nullable(),
    birth_date: z.string().optional().nullable(),

    // 2. Kontak & Alamat
    phone: z
      .string()
      .min(10, "Nomor telepon minimal 10 digit")
      .max(15, "Nomor telepon maksimal 15 digit")
      .regex(/^08\d+$/, "Format telepon harus diawali '08...'"),
    email: z
      .string()
      .email("Format email tidak valid")
      .optional()
      .or(z.literal(""))
      .nullable(),
    address: z.string().optional().nullable(),

    // 3. Legalitas KTA & Gada
    kta_number: z.string().optional().or(z.literal("")).nullable(),
    kta_expiry_date: z.string().optional().or(z.literal("")).nullable(),
    gada_level: gadaLevelEnum.default("Belum Ada"),
    gada_certificate_number: z.string().optional().or(z.literal("")).nullable(),

    // 4. Penempatan & Kepegawaian
    position: z
      .string()
      .min(1, "Posisi/Jabatan wajib dipilih")
      .default("Anggota"),
    status: personnelStatusEnum.default("active"),
    current_site_id: z.string().optional().or(z.literal("")).nullable(),
    join_date: z.string().min(1, "Tanggal bergabung wajib diisi"),

    // 5. Informasi Rekening Bank
    bank_name: z.string().optional().or(z.literal("")).nullable(),
    bank_account_number: z.string().optional().or(z.literal("")).nullable(),
    photo_url: z.string().optional().or(z.literal("")).nullable(),
  })
  .superRefine((data, ctx) => {
    // Validasi Khusus: kta_expiry_date wajib diisi jika kta_number diisi
    if (data.kta_number && data.kta_number.trim().length > 0) {
      if (!data.kta_expiry_date || data.kta_expiry_date.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["kta_expiry_date"],
          message: "Masa berlaku KTA (KTA Expiry) wajib diisi jika Nomor KTA dicantumkan",
        });
      }
    }
  });

export type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

export type KtaStatus = "valid" | "expiring_soon" | "expired" | "no_kta";

/**
 * Menghitung status KTA personel:
 * - 'expired': Masa berlaku sudah lewat dari hari ini
 * - 'expiring_soon': Masa berlaku kurang dari atau sama dengan 30 hari lagi
 * - 'valid': Masa berlaku masih lebih dari 30 hari
 * - 'no_kta': Personel belum memiliki KTA
 */
export function calculateKtaStatus(
  ktaNumber: string | null | undefined,
  ktaExpiryDate: string | null | undefined
): KtaStatus {
  if (!ktaNumber || !ktaExpiryDate) {
    return "no_kta";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(ktaExpiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "expired";
  } else if (diffDays <= 30) {
    return "expiring_soon";
  }
  return "valid";
}

