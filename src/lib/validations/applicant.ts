import { z } from "zod";

export const applicantStatusEnum = z.enum([
  "new",
  "document_review",
  "fitness_test",
  "interview",
  "accepted",
  "rejected",
]);
export type ApplicantStatus = z.infer<typeof applicantStatusEnum>;

export const applicantFormSchema = z.object({
  nik: z
    .string()
    .min(16, "NIK harus terdiri dari 16 digit angka")
    .max(16, "NIK maksimal 16 digit angka")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(255, "Nama lengkap maksimal 255 karakter"),
  birth_place: z.string().optional().or(z.literal("")).nullable(),
  birth_date: z.string().optional().or(z.literal("")).nullable(),
  gender: z.enum(["Laki-laki", "Perempuan"]).default("Laki-laki"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(50, "Nomor telepon maksimal 50 digit"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  address: z.string().optional().or(z.literal("")).nullable(),
  gada_level: z.string().default("Belum Ada"),
  status: applicantStatusEnum.default("new"),
  score: z
    .number()
    .min(0, "Nilai minimal 0")
    .max(100, "Nilai maksimal 100")
    .optional()
    .nullable()
    .or(
      z
        .string()
        .transform((v) => (v === "" ? null : parseFloat(v)))
        .refine((v) => v === null || (!isNaN(v) && v >= 0 && v <= 100), {
          message: "Nilai harus antara 0 - 100",
        })
    ),
  notes: z.string().optional().or(z.literal("")).nullable(),
});

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;
