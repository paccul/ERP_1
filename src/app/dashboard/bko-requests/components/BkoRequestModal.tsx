"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save, Loader2, GitCompare, AlertCircle } from "lucide-react";
import {
  bkoFormSchema,
  type BkoFormValues,
} from "@/lib/validations/bko";
import { createBkoRequest } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BkoRequestModalProps {
  personnelList: Array<{ id: string; full_name: string; nik: string; current_site_id: string | null }>;
  sitesList: Array<{ id: string; name: string; code: string }>;
}

export function BkoRequestModal({
  personnelList,
  sitesList,
}: BkoRequestModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BkoFormValues>({
    resolver: zodResolver(bkoFormSchema),
    defaultValues: {
      personnel_id: personnelList[0]?.id ?? "",
      origin_site_id: personnelList[0]?.current_site_id ?? (sitesList[0]?.id ?? ""),
      target_site_id: sitesList[1]?.id ?? (sitesList[0]?.id ?? ""),
      start_date: todayStr,
      end_date: todayStr,
      reason: "",
    },
  });

  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const person = personnelList.find((p) => p.id === selectedId);
    if (person && person.current_site_id) {
      setValue("origin_site_id", person.current_site_id);
    }
  };

  const onSubmit = async (values: BkoFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createBkoRequest(values);
      if (!res.success) {
        setServerError(res.error || "Gagal membuat permohonan BKO");
        setSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat membuat permohonan BKO");
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
        Ajukan Permohonan BKO
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-[#f59e0b]" />
                Permohonan Bantuan Kendali Operasi (BKO)
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
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <Label htmlFor="personnel_id" className="text-gray-300">
                  Pilih Anggota Satpam BKO <span className="text-red-400">*</span>
                </Label>
                <select
                  id="personnel_id"
                  {...register("personnel_id")}
                  onChange={(e) => {
                    register("personnel_id").onChange(e);
                    handlePersonnelChange(e);
                  }}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  {personnelList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} (NIK: {p.nik})
                    </option>
                  ))}
                </select>
                {errors.personnel_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.personnel_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="origin_site_id" className="text-gray-300">
                    Pos Asal (Origin) <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="origin_site_id"
                    {...register("origin_site_id")}
                    className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                  >
                    {sitesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.origin_site_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.origin_site_id.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="target_site_id" className="text-gray-300">
                    Pos Tujuan BKO <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="target_site_id"
                    {...register("target_site_id")}
                    className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                  >
                    {sitesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.target_site_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.target_site_id.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_date" className="text-gray-300">
                    Mulai Tanggal BKO <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.start_date && (
                    <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-gray-300">
                    Selesai Tanggal BKO <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register("end_date")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.end_date && (
                    <p className="text-red-400 text-xs mt-1">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-gray-300">
                  Alasan Permohonan Penugasan BKO <span className="text-red-400">*</span>
                </Label>
                <textarea
                  id="reason"
                  rows={3}
                  placeholder="Contoh: Penebalan pengamanan VVIP KTT / Event Konser / Pos tujuan kekurangan kuota satpam sakit."
                  {...register("reason")}
                  className="mt-1 flex w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                />
                {errors.reason && (
                  <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>
                )}
              </div>

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
                      Kirim Permohonan
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
