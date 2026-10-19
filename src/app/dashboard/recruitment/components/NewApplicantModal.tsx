"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save, Loader2, UserPlus, AlertCircle } from "lucide-react";
import {
  applicantFormSchema,
  type ApplicantFormValues,
} from "@/lib/validations/applicant";
import { createApplicant } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewApplicantModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      nik: "",
      full_name: "",
      phone: "",
      email: "",
      birth_place: "",
      birth_date: "",
      gender: "Laki-laki",
      address: "",
      gada_level: "Belum Ada",
      status: "new",
      notes: "",
    },
  });

  const onSubmit = async (values: ApplicantFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createApplicant(values);
      if (!res.success) {
        setServerError(res.error || "Gagal mendaftarkan pelamar");
        setSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan data pelamar");
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
        Daftar Pelamar Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#f59e0b]" />
                Registrasi Pelamar PSB Baru
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nik" className="text-gray-300">
                    NIK KTP <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nik"
                    placeholder="16 digit NIK"
                    {...register("nik")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.nik && (
                    <p className="text-red-400 text-xs mt-1">{errors.nik.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender" className="text-gray-300">
                    Jenis Kelamin
                  </Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name" className="text-gray-300">
                  Nama Lengkap Pelamar <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Nama sesuai KTP"
                  {...register("full_name")}
                  className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                />
                {errors.full_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-gray-300">
                    Nomor WhatsApp / HP <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="08123456789"
                    {...register("phone")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Alamat Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kandidat@gmail.com"
                    {...register("email")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="birth_place" className="text-gray-300">
                    Tempat Lahir
                  </Label>
                  <Input
                    id="birth_place"
                    placeholder="Jakarta"
                    {...register("birth_place")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date" className="text-gray-300">
                    Tanggal Lahir
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                    className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gada_level" className="text-gray-300">
                  Kualifikasi Sertifikasi Gada
                </Label>
                <select
                  id="gada_level"
                  {...register("gada_level")}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="Belum Ada">Belum Memiliki Ijazah Gada</option>
                  <option value="Pratama">Gada Pratama (Satpam Dasar)</option>
                  <option value="Madya">Gada Madya (Supervisor / Danru)</option>
                  <option value="Utama">Gada Utama (Manager Keamanan)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-300">
                  Alamat Domisili
                </Label>
                <textarea
                  id="address"
                  rows={2}
                  placeholder="Alamat tempat tinggal pelamar..."
                  {...register("address")}
                  className="mt-1 flex w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                />
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
                      Daftarkan Pelamar
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
