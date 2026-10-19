import { z } from "zod";

export const clientStatusEnum = z.enum(["active", "inactive"]);
export type ClientStatus = z.infer<typeof clientStatusEnum>;

export const clientFormSchema = z.object({
  code: z
    .string()
    .min(3, "Kode klien minimal 3 karakter")
    .max(50, "Kode klien maksimal 50 karakter")
    .toUpperCase(),
  company_name: z
    .string()
    .min(2, "Nama perusahaan minimal 2 karakter")
    .max(255, "Nama perusahaan maksimal 255 karakter"),
  npwp: z.string().optional().or(z.literal("")).nullable(),
  billing_address: z
    .string()
    .min(5, "Alamat penagihan minimal 5 karakter"),
  pic_name: z
    .string()
    .min(2, "Nama PIC minimal 2 karakter")
    .max(150, "Nama PIC maksimal 150 karakter"),
  pic_phone: z
    .string()
    .min(10, "Nomor telepon PIC minimal 10 digit")
    .max(50, "Nomor telepon PIC maksimal 50 digit"),
  pic_email: z
    .string()
    .email("Format email PIC tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  contract_end_date: z
    .string()
    .min(1, "Tanggal berakhir kontrak wajib diisi"),
  status: clientStatusEnum.default("active"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
