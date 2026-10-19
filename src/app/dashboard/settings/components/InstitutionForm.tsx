"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  institutionSettingsSchema,
  type InstitutionSettingsInput,
} from "@/lib/validations/settings";
import { updateInstitutionSettings } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  FileCheck2,
  Receipt,
  MapPin,
  Phone,
  Mail,
  Percent,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

interface InstitutionFormProps {
  initialData: InstitutionSettingsInput;
}

export function InstitutionForm({ initialData }: InstitutionFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionSettingsInput>({
    resolver: zodResolver(institutionSettingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: InstitutionSettingsInput) => {
    setIsPending(true);
    setFeedback(null);
    try {
      const res = await updateInstitutionSettings(values);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Data profil BUJP & legalitas Mabes Polri berhasil diperbarui ke database.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan perubahan profil institusi.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan sistem saat menyimpan data.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
              : "bg-red-950/30 border-red-500/50 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Section 1: Identitas BUJP & Izin Mabes Polri */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Identitas Badan Usaha & Surat Izin Operasional (SIO)
            </h2>
            <p className="text-xs text-[#9ca3af]">
              Standarisasi Perpol No. 01 Tahun 2023 tentang Badan Usaha Jasa Pengamanan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#f59e0b]" />
              Nama Resmi BUJP (PT) *
            </Label>
            <Input
              id="company_name"
              {...register("company_name")}
              placeholder="PT Garda Utama Security Indonesia"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.company_name && (
              <p className="text-xs text-red-400">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
              Nomor SIO Mabes Polri / Polda *
            </Label>
            <Input
              id="license_number"
              {...register("license_number")}
              placeholder="SIO/542/BIN/X/2023/Mabes-Polri"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.license_number && (
              <p className="text-xs text-red-400">{errors.license_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="npwp" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-[#60a5fa]" />
              Nomor Pokok Wajib Pajak (NPWP) *
            </Label>
            <Input
              id="npwp"
              {...register("npwp")}
              placeholder="01.234.567.8-012.000"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.npwp && (
              <p className="text-xs text-red-400">{errors.npwp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#c084fc]" />
              Telepon Kantor Pusat *
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="021-52994400"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.phone && (
              <p className="text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#f472b6]" />
              Email Resmi Operasional *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="info@garda.bujp.id"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              Alamat Lengkap Kantor Pusat *
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Gedung Cyber 2 Tower Lt. 15, Jl. H.R. Rasuna Said Blok X-5 No. 13, Jakarta Selatan"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.address && (
              <p className="text-xs text-red-400">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Konfigurasi Perpajakan & BPJS Tenaga Kerja */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Konfigurasi Default Perpajakan & BPJS
            </h2>
            <p className="text-xs text-[#9ca3af]">
              Digunakan otomatis pada perhitungan Faktur Tagihan Klien (Invoicing) dan Penggajian Satpam (Payroll).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label htmlFor="ppn_rate" className="text-xs text-[#d1d5db] font-semibold">
              Tarif PPN Faktur (%) *
            </Label>
            <div className="relative">
              <Input
                id="ppn_rate"
                type="number"
                step="0.1"
                {...register("ppn_rate")}
                className="bg-[#030712] border-[#374151] text-white pr-8 focus:border-[#f59e0b] h-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">%</span>
            </div>
            {errors.ppn_rate && (
              <p className="text-xs text-red-400">{errors.ppn_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pph23_rate" className="text-xs text-[#d1d5db] font-semibold">
              Tarif PPh Pasal 23 (%) *
            </Label>
            <div className="relative">
              <Input
                id="pph23_rate"
                type="number"
                step="0.1"
                {...register("pph23_rate")}
                className="bg-[#030712] border-[#374151] text-white pr-8 focus:border-[#f59e0b] h-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">%</span>
            </div>
            {errors.pph23_rate && (
              <p className="text-xs text-red-400">{errors.pph23_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bpjs_ketenagakerjaan_rate" className="text-xs text-[#d1d5db] font-semibold">
              BPJS Ketenagakerjaan (%)
            </Label>
            <div className="relative">
              <Input
                id="bpjs_ketenagakerjaan_rate"
                type="number"
                step="0.01"
                {...register("bpjs_ketenagakerjaan_rate")}
                className="bg-[#030712] border-[#374151] text-white pr-8 focus:border-[#f59e0b] h-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bpjs_kesehatan_rate" className="text-xs text-[#d1d5db] font-semibold">
              BPJS Kesehatan (%)
            </Label>
            <div className="relative">
              <Input
                id="bpjs_kesehatan_rate"
                type="number"
                step="0.01"
                {...register("bpjs_kesehatan_rate")}
                className="bg-[#030712] border-[#374151] text-white pr-8 focus:border-[#f59e0b] h-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-6 h-11 rounded-xl shadow-lg transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Profil & Legalitas
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
