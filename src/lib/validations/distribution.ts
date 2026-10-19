import { z } from "zod";

export const distributionLineSchema = z.object({
  item_id: z.string().uuid("Pilih item barang yang valid"),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  unit_cost: z.coerce.number().min(0, "Biaya satuan tidak boleh negatif"),
});

export type DistributionLineFormValues = z.infer<typeof distributionLineSchema>;

export const distributionFormSchema = z
  .object({
    distribution_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    target_type: z.enum(["personnel", "site"], {
      required_error: "Pilih tujuan distribusi",
    }),
    personnel_id: z
      .string()
      .uuid("ID Personel tidak valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    site_id: z
      .string()
      .uuid("ID Site tidak valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    recipient_name: z
      .string()
      .min(2, "Nama penerima minimal 2 karakter")
      .max(255),
    notes: z.string().max(500).optional().nullable().or(z.literal("")),
    lines: z
      .array(distributionLineSchema)
      .min(1, "Minimal pilih 1 barang untuk didistribusikan"),
  })
  .superRefine((data, ctx) => {
    if (data.target_type === "personnel" && (!data.personnel_id || data.personnel_id === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wajib memilih personel penerima",
        path: ["personnel_id"],
      });
    }
    if (data.target_type === "site" && (!data.site_id || data.site_id === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wajib memilih lokasi pos jaga / site tujuan",
        path: ["site_id"],
      });
    }
  });

export type DistributionFormValues = z.infer<typeof distributionFormSchema>;
