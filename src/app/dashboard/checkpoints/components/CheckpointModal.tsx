"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save, Loader2, QrCode } from "lucide-react";
import {
  checkpointFormSchema,
  type CheckpointFormValues,
} from "@/lib/validations/checkpoint";
import { createCheckpoint } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckpointModalProps {
  sites: Array<{ id: string; name: string; code: string }>;
  defaultSiteId?: string;
}

export function CheckpointModal({ sites, defaultSiteId }: CheckpointModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckpointFormValues>({
    resolver: zodResolver(checkpointFormSchema),
    defaultValues: {
      site_id: defaultSiteId || (sites[0]?.id ?? ""),
      code: "",
      name: "",
      patrol_order: 1,
      qr_code_hash: "",
    },
  });

  const onSubmit = async (values: CheckpointFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createCheckpoint(values);
      if (!res.success) {
        setServerError(res.error || "Gagal membuat checkpoint");
        setSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan checkpoint");
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
        Tambah Titik Checkpoint
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#f59e0b]" />
                Tambah Titik Patroli (QR)
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
                <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                  {serverError}
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
                  <option value="">Pilih Pos Jaga...</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
                {errors.site_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.site_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="code" className="text-gray-300">
                    Kode Titik <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="Contoh: CP-01"
                    {...register("code")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white uppercase focus-visible:ring-[#f59e0b]"
                  />
                  {errors.code && (
                    <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="patrol_order" className="text-gray-300">
                    Urutan Patroli <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="patrol_order"
                    type="number"
                    min={1}
                    {...register("patrol_order")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.patrol_order && (
                    <p className="text-red-400 text-xs mt-1">{errors.patrol_order.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Nama Titik Patroli <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Ruang Genset Basement 2"
                  {...register("name")}
                  className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="pt-2 text-xs text-gray-500">
                * Kode QR unik akan di-generate otomatis oleh sistem dan dapat dicetak langsung untuk ditempel di lokasi pos.
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
                      Simpan Titik
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
