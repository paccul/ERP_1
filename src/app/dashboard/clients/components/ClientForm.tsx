"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validations/client";
import { createClient, updateClient } from "../actions";
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

interface ClientFormProps {
  initialData?: Tables<"clients"> | null;
  mode: "create" | "edit";
}

export function ClientForm({ initialData, mode }: ClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: Partial<ClientFormValues> = initialData
    ? {
        code: initialData.code,
        company_name: initialData.company_name,
        npwp: initialData.npwp || "",
        billing_address: initialData.billing_address,
        pic_name: initialData.pic_name,
        pic_phone: initialData.pic_phone,
        pic_email: initialData.pic_email || "",
        contract_end_date: initialData.contract_end_date,
        status: (initialData.status as "active" | "inactive") || "active",
      }
    : {
        code: "",
        company_name: "",
        npwp: "",
        billing_address: "",
        pic_name: "",
        pic_phone: "",
        pic_email: "",
        contract_end_date: "",
        status: "active",
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues as ClientFormValues,
  });

  const onSubmit = async (values: ClientFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createClient(values);
        if (!result.success) {
          setServerError(result.error || "Gagal menyimpan data klien mitra");
          setSubmitting(false);
          return;
        }
      } else if (initialData) {
        const result = await updateClient(initialData.id, values);
        if (!result.success) {
          setServerError(result.error || "Gagal memperbarui data klien mitra");
          setSubmitting(false);
          return;
        }
      }

      router.push("/dashboard/clients");
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
        {/* Card 1: Data Perusahaan */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#f59e0b]" />
              Identitas Klien Perusahaan
            </CardTitle>
            <CardDescription className="text-gray-400">
              Informasi legalitas dan kontrak kerjasama mitra pengamanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="text-gray-300">
                  Kode Klien <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Contoh: CLI-BCA"
                  {...register("code")}
                  className="mt-1 bg-[#111827] border-[#374151] text-white uppercase focus-visible:ring-[#f59e0b]"
                />
                {errors.code && (
                  <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-300">
                  Status Kerjasama
                </Label>
                <select
                  id="status"
                  {...register("status")}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="active">Aktif (Berjalan)</option>
                  <option value="inactive">Nonaktif (Selesai/Putus)</option>
                </select>
                {errors.status && (
                  <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="company_name" className="text-gray-300">
                Nama Perusahaan Mitra <span className="text-red-400">*</span>
              </Label>
              <Input
                id="company_name"
                placeholder="PT Sumber Rejeki Tbk"
                {...register("company_name")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.company_name && (
                <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="npwp" className="text-gray-300 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-gray-400" />
                Nomor NPWP Perusahaan
              </Label>
              <Input
                id="npwp"
                placeholder="01.234.567.8-901.000"
                {...register("npwp")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.npwp && (
                <p className="text-red-400 text-xs mt-1">{errors.npwp.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contract_end_date" className="text-gray-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#f59e0b]" />
                Tanggal Berakhir Kontrak <span className="text-red-400">*</span>
              </Label>
              <Input
                id="contract_end_date"
                type="date"
                {...register("contract_end_date")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.contract_end_date && (
                <p className="text-red-400 text-xs mt-1">{errors.contract_end_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="billing_address" className="text-gray-300 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                Alamat Penagihan & Faktur <span className="text-red-400">*</span>
              </Label>
              <textarea
                id="billing_address"
                rows={3}
                placeholder="Gedung Menara Batavia Lt. 12, Jl. KH Mas Mansyur Kav. 126, Jakarta Pusat"
                {...register("billing_address")}
                className="mt-1 flex w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              />
              {errors.billing_address && (
                <p className="text-red-400 text-xs mt-1">{errors.billing_address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Kontak Person (PIC) */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#f59e0b]" />
              Kontak Person In Charge (PIC)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Penanggung jawab operasional atau pengadaan jasa dari pihak mitra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pic_name" className="text-gray-300">
                Nama Lengkap PIC <span className="text-red-400">*</span>
              </Label>
              <Input
                id="pic_name"
                placeholder="Bpk. Hendra Gunawan (Building Manager)"
                {...register("pic_name")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.pic_name && (
                <p className="text-red-400 text-xs mt-1">{errors.pic_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pic_phone" className="text-gray-300 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-gray-400" />
                Nomor Telepon / WhatsApp PIC <span className="text-red-400">*</span>
              </Label>
              <Input
                id="pic_phone"
                placeholder="081234567890"
                {...register("pic_phone")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.pic_phone && (
                <p className="text-red-400 text-xs mt-1">{errors.pic_phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pic_email" className="text-gray-300 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-gray-400" />
                Alamat Email PIC
              </Label>
              <Input
                id="pic_email"
                type="email"
                placeholder="hendra.g@sumberrejeki.co.id"
                {...register("pic_email")}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
              {errors.pic_email && (
                <p className="text-red-400 text-xs mt-1">{errors.pic_email.message}</p>
              )}
            </div>

            <div className="pt-6 border-t border-[#374151] text-xs text-gray-400 space-y-2">
              <p className="font-semibold text-gray-300">Catatan Operasional BUJP:</p>
              <p>
                Setelah mendaftarkan klien mitra, Anda dapat menambahkan satu atau lebih{" "}
                <span className="text-[#f59e0b]">Titik Pos Jaga (Sites)</span> untuk penempatan anggota satpam dan penagihan invoice per pos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
        <Link href="/dashboard/clients">
          <Button
            type="button"
            variant="outline"
            className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Klien
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan Data...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === "create" ? "Daftarkan Klien Mitra" : "Simpan Perubahan"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
