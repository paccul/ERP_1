import { z } from "zod";

export const accountCategoryEnum = z.enum([
  "Aset",
  "Liabilitas",
  "Ekuitas",
  "Pendapatan",
  "Beban",
]);
export type AccountCategory = z.infer<typeof accountCategoryEnum>;

export const normalBalanceEnum = z.enum(["debit", "credit"]);
export type NormalBalance = z.infer<typeof normalBalanceEnum>;

export const accountFormSchema = z.object({
  code: z
    .string()
    .min(3, "Kode akun minimal 3 karakter")
    .max(50, "Kode akun maksimal 50 karakter")
    .regex(/^\d+$/, "Kode akun harus berupa angka/digit (contoh: 11100, 51100)"),
  name: z
    .string()
    .min(2, "Nama akun minimal 2 karakter")
    .max(255, "Nama akun maksimal 255 karakter"),
  category: accountCategoryEnum,
  normal_balance: normalBalanceEnum,
  parent_id: z.string().optional().or(z.literal("")).nullable(),
  is_active: z.boolean().default(true),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
