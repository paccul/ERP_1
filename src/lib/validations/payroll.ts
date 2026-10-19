import { z } from "zod";

export const payslipLineSchema = z.object({
  personnel_id: z.string().uuid("ID Personel tidak valid"),
  site_id: z.string().uuid().optional().nullable().or(z.literal("")),
  basic_salary: z.coerce.number().min(0, "Gaji pokok tidak boleh negatif"),
  allowance_position: z.coerce.number().min(0).default(0),
  overtime_amount: z.coerce.number().min(0).default(0),
  bpjs_kesehatan: z.coerce.number().min(0).default(0),
  bpjs_ketenagakerjaan: z.coerce.number().min(0).default(0),
  pph21_amount: z.coerce.number().min(0).default(0),
  uniform_deduction: z.coerce.number().min(0).default(0),
  net_salary: z.coerce.number().min(0),
});

export type PayslipLineFormValues = z.infer<typeof payslipLineSchema>;

export const payrollRunFormSchema = z.object({
  period_month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "Format periode tidak valid"),
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal proses harus YYYY-MM-DD"),
  payslips: z.array(payslipLineSchema).min(1, "Minimal pilih 1 personel satpam untuk digaji"),
});

export type PayrollRunFormValues = z.infer<typeof payrollRunFormSchema>;
