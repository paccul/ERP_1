import { z } from "zod";

export const siteStatusEnum = z.enum(["active", "inactive"]);
export type SiteStatus = z.infer<typeof siteStatusEnum>;

export const siteFormSchema = z.object({
  client_id: z.string().min(1, "Klien mitra wajib dipilih"),
  code: z
    .string()
    .min(3, "Kode pos/site minimal 3 karakter")
    .max(50, "Kode pos/site maksimal 50 karakter")
    .toUpperCase(),
  name: z
    .string()
    .min(2, "Nama pos jaga/site minimal 2 karakter")
    .max(255, "Nama pos jaga/site maksimal 255 karakter"),
  address: z
    .string()
    .min(5, "Alamat pos jaga minimal 5 karakter"),
  latitude: z
    .number()
    .optional()
    .nullable()
    .or(z.string().transform((v) => (v === "" ? null : parseFloat(v)))),
  longitude: z
    .number()
    .optional()
    .nullable()
    .or(z.string().transform((v) => (v === "" ? null : parseFloat(v)))),
  required_personnel_per_shift: z
    .number()
    .min(1, "Minimal 1 personel per shift")
    .default(1)
    .or(
      z
        .string()
        .transform((v) => parseInt(v, 10))
        .refine((v) => !isNaN(v) && v >= 1, "Minimal 1 personel per shift")
    ),
  monthly_rate_per_personnel: z
    .number()
    .min(0, "Tarif tidak boleh negatif")
    .default(0)
    .or(
      z
        .string()
        .transform((v) => parseFloat(v))
        .refine((v) => !isNaN(v) && v >= 0, "Tarif tidak boleh negatif")
    ),
  status: siteStatusEnum.default("active"),
});

export type SiteFormValues = z.infer<typeof siteFormSchema>;
