import { z } from "zod";

export const bkoFormSchema = z
  .object({
    personnel_id: z.string().min(1, "Personel satpam wajib dipilih"),
    origin_site_id: z.string().min(1, "Lokasi pos asal wajib dipilih"),
    target_site_id: z.string().min(1, "Lokasi pos tujuan wajib dipilih"),
    start_date: z.string().min(1, "Tanggal mulai BKO wajib diisi"),
    end_date: z.string().min(1, "Tanggal selesai BKO wajib diisi"),
    reason: z
      .string()
      .min(5, "Alasan BKO minimal 5 karakter")
      .max(500, "Alasan BKO maksimal 500 karakter"),
  })
  .refine((data) => data.origin_site_id !== data.target_site_id, {
    message: "Lokasi pos asal dan pos tujuan tidak boleh sama",
    path: ["target_site_id"],
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "Tanggal selesai BKO tidak boleh sebelum tanggal mulai",
    path: ["end_date"],
  });

export type BkoFormValues = z.infer<typeof bkoFormSchema>;
