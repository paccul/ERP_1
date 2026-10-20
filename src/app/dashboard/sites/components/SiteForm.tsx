"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Building2,
  Users,
  DollarSign,
  Compass,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  siteFormSchema,
  type SiteFormValues,
} from "@/lib/validations/site";
import { createSite, updateSite } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/types/database.types";

interface SiteFormProps {
  initialData?: Tables<"sites"> | null;
  clients: Array<{ id: string; company_name: string; code: string }>;
  defaultClientId?: string;
  mode: "create" | "edit";
}

export function SiteForm({
  initialData,
  clients,
  defaultClientId,
  mode,
}: SiteFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: Partial<SiteFormValues> = initialData
    ? {
        client_id: initialData.client_id,
        code: initialData.code,
        name: initialData.name,
        address: initialData.address,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        required_personnel_per_shift: initialData.required_personnel_per_shift,
        monthly_rate_per_personnel: initialData.monthly_rate_per_personnel,
        status: (initialData.status as "active" | "inactive") || "active",
      }
    : {
        client_id: defaultClientId || (clients[0]?.id ?? ""),
        code: "",
        name: "",
        address: "",
        latitude: null,
        longitude: null,
        required_personnel_per_shift: 1,
        monthly_rate_per_personnel: 4500000,
        status: "active",
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: defaultValues as SiteFormValues,
  });

  const onSubmit = async (values: SiteFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createSite(values);
        if (!result.success) {
          setServerError(result.error || "Gagal menyimpan lokasi jaga");
          setSubmitting(false);
          return;
        }
      } else if (initialData) {
        const result = await updateSite(initialData.id, values);
        if (!result.success) {
          setServerError(result.error || "Gagal memperbarui lokasi jaga");
          setSubmitting(false);
          return;
        }
      }

      router.push("/dashboard/sites");
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan data");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="flex items-center gap-3 p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Informasi Pos Jaga & Klien */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#f59e0b]" />
              Identitas Pos Jaga (Site)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Penetapan lokasi fisik pos pengamanan satpam dan mitra pemilik aset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client_id" className="text-gray-300 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#f59e0b]" />
                Klien Mitra Pemilik Lokasi <span className="text-red-400">*</span>
              </Label>
              <select
                id="client_id"
                {...register("client_id")}
                className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="">Pilih Perusahaan Mitra...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.company_name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-red-400 text-xs mt-1">{errors.client_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="text-gray-300">
                  Kode Pos Jaga <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Contoh: SIT-MTR-01"
                  {...register("code")}
                  className="mt-1 bg-[#111827] border-[#374151] text-white uppercase focus-visible:ring-[#f59e0b]"
                />
                {errors.code && (
                  <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-300">
                  Status Operasional
                </Label>
                <select
                  id="status"
                  {...register("status")}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="active">Aktif (Operasional Dijaga)</option>
                  <option value="inactive">Nonaktif (Off Duty)</option>
                </select>
                {errors.status && (
                  <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nama Pos Jaga / Lokasi <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Pos Gerbang Utama & Lobby Barat"
                {...register("name")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="text-gray-300">
                Alamat Lengkap Pos Jaga <span className="text-red-400">*</span>
              </Label>
              <textarea
                id="address"
                rows={3}
                placeholder="Jl. Jend. Sudirman Kav. 52-53, Kawasan SCBD Lot 11, Jakarta Selatan"
                {...register("address")}
                className="mt-1 flex w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              />
              {errors.address && (
                <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Kuota Personel & Tarif Penagihan */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#f59e0b]" />
              Kebutuhan Kuota Satpam & Tarif Billing
            </CardTitle>
            <CardDescription className="text-gray-400">
              Parameter SLA pengamanan dan dasar perhitungan faktur penagihan bulanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="required_personnel_per_shift" className="text-gray-300 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-400" />
                Kuota Satpam per Shift (SLA) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="required_personnel_per_shift"
                type="number"
                min={1}
                {...register("required_personnel_per_shift")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jumlah minimal anggota satpam yang wajib bertugas pada tiap shift di pos ini.
              </p>
              {errors.required_personnel_per_shift && (
                <p className="text-red-400 text-xs mt-1">{errors.required_personnel_per_shift.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="monthly_rate_per_personnel" className="text-gray-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Tarif Kontrak Bulanan per Personel (Rp) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="monthly_rate_per_personnel"
                type="number"
                min={0}
                step={50000}
                {...register("monthly_rate_per_personnel")}
                className="mt-1 bg-[#111827] border-[#374151] text-white font-mono focus-visible:ring-[#f59e0b]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nilai dasar penagihan faktur bulanan: (Tarif Kontrak × Jumlah Satpam Aktif).
              </p>
              {errors.monthly_rate_per_personnel && (
                <p className="text-red-400 text-xs mt-1">{errors.monthly_rate_per_personnel.message}</p>
              )}
            </div>

            <div className="pt-4 border-t border-[#374151]">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-300">Koordinat Geografis Pos (GPS)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="latitude" className="text-xs text-gray-400">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="-6.2088"
                    {...register("latitude")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white text-xs font-mono focus-visible:ring-[#f59e0b]"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-xs text-gray-400">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="106.8456"
                    {...register("longitude")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white text-xs font-mono focus-visible:ring-[#f59e0b]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Digunakan untuk validasi titik absensi GPS mobile satpam dan radius radius patroli.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#374151]">
        <Link href="/dashboard/sites" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-[#374151] text-gray-300 hover:bg-[#1f2937]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Pos Jaga
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan Data...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === "create" ? "Daftarkan Pos Jaga Baru" : "Simpan Perubahan Pos"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
