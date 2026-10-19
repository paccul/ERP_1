import { z } from "zod";

export const journalLineSchema = z.object({
  account_id: z.string().min(1, "Akun COA wajib dipilih"),
  debit: z.number().min(0, "Debit tidak boleh negatif").default(0),
  credit: z.number().min(0, "Kredit tidak boleh negatif").default(0),
  memo: z.string().optional().or(z.literal("")).nullable(),
}).refine(
  (line) => (line.debit > 0 && line.credit === 0) || (line.credit > 0 && line.debit === 0),
  {
    message: "Tiap baris harus memiliki salah satu dari Debit atau Kredit (tidak boleh keduanya atau keduanya nol)",
    path: ["debit"],
  }
);

export const journalEntryFormSchema = z.object({
  entry_number: z.string().min(3, "Nomor bukti jurnal minimal 3 karakter"),
  entry_date: z.string().min(1, "Tanggal jurnal wajib diisi"),
  description: z.string().min(5, "Deskripsi / keterangan transaksi minimal 5 karakter"),
  lines: z.array(journalLineSchema).min(2, "Jurnal double-entry minimal memerlukan 2 baris akun"),
}).superRefine((data, ctx) => {
  const totalDebit = data.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
  const totalCredit = data.lines.reduce((acc, l) => acc + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Jurnal tidak seimbang: Total Debit (Rp ${totalDebit.toLocaleString("id-ID")}) ≠ Total Kredit (Rp ${totalCredit.toLocaleString("id-ID")})`,
      path: ["lines"],
    });
  }

  if (totalDebit <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Total nilai transaksi jurnal harus lebih dari Rp 0",
      path: ["lines"],
    });
  }
});

export type JournalLineValues = z.infer<typeof journalLineSchema>;
export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;
