import { z } from "zod";

export const checkpointFormSchema = z.object({
  site_id: z.string().min(1, "Lokasi jaga (site) wajib dipilih"),
  code: z
    .string()
    .min(2, "Kode checkpoint minimal 2 karakter")
    .max(50, "Kode checkpoint maksimal 50 karakter")
    .toUpperCase(),
  name: z
    .string()
    .min(2, "Nama checkpoint minimal 2 karakter")
    .max(150, "Nama checkpoint maksimal 150 karakter"),
  patrol_order: z
    .number()
    .min(1, "Urutan rute patroli minimal 1")
    .default(1)
    .or(
      z
        .string()
        .transform((v) => parseInt(v, 10))
        .refine((v) => !isNaN(v) && v >= 1, "Urutan rute patroli minimal 1")
    ),
  qr_code_hash: z.string().optional().or(z.literal("")),
});

export type CheckpointFormValues = z.infer<typeof checkpointFormSchema>;
