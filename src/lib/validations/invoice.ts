import { z } from "zod";

export const invoiceStatusEnum = z.enum(["draft", "issued", "paid", "cancelled"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft / Konsep",
  issued: "Terbit / Belum Bayar",
  paid: "Lunas / Terbayar",
  cancelled: "Dibatalkan",
};

export const invoiceLineSchema = z.object({
  site_id: z.string().uuid("Pilih lokasi pos jaga / site yang valid"),
  personnel_count: z.coerce.number().int().min(1, "Jumlah personel minimal 1"),
  rate_per_personnel: z.coerce.number().min(0, "Tarif per personel tidak boleh negatif"),
  line_total: z.coerce.number().min(0),
});

export type InvoiceLineFormValues = z.infer<typeof invoiceLineSchema>;

export const invoiceFormSchema = z.object({
  client_id: z.string().uuid("Pilih klien mitra yang valid"),
  period_month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "Format bulan tidak valid"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal jatuh tempo harus YYYY-MM-DD"),
  ppn_rate: z.coerce.number().min(0).max(100).default(11),
  pph23_amount: z.coerce.number().min(0).default(0),
  lines: z.array(invoiceLineSchema).min(1, "Minimal harus ada 1 baris penagihan site"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
