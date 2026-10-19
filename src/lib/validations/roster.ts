import { z } from "zod";

export const rosterStatusEnum = z.enum([
  "scheduled",
  "present",
  "absent",
  "replaced",
  "off",
]);
export type RosterStatus = z.infer<typeof rosterStatusEnum>;

export const rosterFormSchema = z.object({
  personnel_id: z.string().min(1, "Personel satpam wajib dipilih"),
  site_id: z.string().min(1, "Lokasi jaga (site) wajib dipilih"),
  shift_id: z.string().optional().or(z.literal("")).nullable(),
  date: z.string().min(1, "Tanggal penugasan wajib diisi"),
  status: rosterStatusEnum.default("scheduled"),
});

export type RosterFormValues = z.infer<typeof rosterFormSchema>;
