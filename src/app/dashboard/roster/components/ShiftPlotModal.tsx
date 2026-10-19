"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save, Loader2, CalendarDays, ShieldAlert } from "lucide-react";
import {
  rosterFormSchema,
  type RosterFormValues,
} from "@/lib/validations/roster";
import { assignShift } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/types/database.types";

interface ShiftPlotModalProps {
  personnelList: Array<{ id: string; full_name: string; nik: string; position: string }>;
  sitesList: Array<{ id: string; name: string; code: string }>;
  shiftsList: Tables<"shifts">[];
  defaultSiteId?: string;
  defaultDate?: string;
}

export function ShiftPlotModal({
  personnelList,
  sitesList,
  shiftsList,
  defaultSiteId,
  defaultDate,
}: ShiftPlotModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = defaultDate || new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RosterFormValues>({
    resolver: zodResolver(rosterFormSchema),
    defaultValues: {
      site_id: defaultSiteId || (sitesList[0]?.id ?? ""),
      personnel_id: personnelList[0]?.id ?? "",
      shift_id: shiftsList[0]?.id ?? "",
      date: todayStr,
      status: "scheduled",
    },
  });

  const selectedStatus = watch("status");

  const onSubmit = async (values: RosterFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await assignShift(values);
      if (!res.success) {
        setServerError(res.error || "Gagal menyimpan jadwal penugasan");
        setSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan jadwal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold"
      >
        <Plus className="h-4 w-4 mr-2" />
        Plot Jadwal Shift (SEC-09)
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#f59e0b]" />
                Plotting Jadwal Shift Satpam
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {serverError && (
                <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <Label htmlFor="site_id" className="text-gray-300">
                  Lokasi Pos Jaga (Site) <span className="text-red-400">*</span>
                </Label>
                <select
                  id="site_id"
                  {...register("site_id")}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  {sitesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
                {errors.site_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.site_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="personnel_id" className="text-gray-300">
                  Personel Satpam <span className="text-red-400">*</span>
                </Label>
                <select
                  id="personnel_id"
                  {...register("personnel_id")}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  {personnelList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.position} - NIK {p.nik})
                    </option>
                  ))}
                </select>
                {errors.personnel_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.personnel_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date" className="text-gray-300">
                    Tanggal Dinas <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.date && (
                    <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-gray-300">
                    Status Kehadiran
                  </Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                  >
                    <option value="scheduled">Terjadwal (Scheduled)</option>
                    <option value="present">Hadir (Present)</option>
                    <option value="absent">Absen (Absent)</option>
                    <option value="replaced">Digantikan (Replaced)</option>
                    <option value="off">Off / Libur</option>
                  </select>
                </div>
              </div>

              {selectedStatus !== "off" && (
                <div>
                  <Label htmlFor="shift_id" className="text-gray-300">
                    Pilihan Shift Jaga <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="shift_id"
                    {...register("shift_id")}
                    className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                  >
                    {shiftsList.map((sh) => (
                      <option key={sh.id} value={sh.id}>
                        {sh.name} ({sh.start_time.substring(0, 5)} - {sh.end_time.substring(0, 5)})
                      </option>
                    ))}
                  </select>
                  {errors.shift_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.shift_id.message}</p>
                  )}
                </div>
              )}

              <p className="text-[11px] text-gray-500 pt-1">
                * Sistem otomatis mendeteksi dan mencegah tumpang tindih shift di hari yang sama untuk personel yang sama (Database constraint UNIQUE(personnel_id, date)).
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374151]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[#374151] text-gray-300 hover:bg-[#111827]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Plot Jadwal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
