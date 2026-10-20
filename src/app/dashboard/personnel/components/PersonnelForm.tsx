"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  User,
  Phone,
  FileBadge2,
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  personnelFormSchema,
  type PersonnelFormValues,
} from "@/lib/validations/personnel";
import { createPersonnel, updatePersonnel } from "../actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SiteOption {
  id: string;
  name: string;
  code: string;
}

interface PersonnelFormProps {
  initialData?: Partial<PersonnelFormValues> & { id?: string };
  sites: SiteOption[];
}

export function PersonnelForm({ initialData, sites }: PersonnelFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"biodata" | "kontak" | "legalitas" | "penempatan">("biodata");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData?.id);

  const form = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      nik: initialData?.nik || "",
      full_name: initialData?.full_name || "",
      gender: (initialData?.gender as "Laki-laki" | "Perempuan") || "Laki-laki",
      birth_place: initialData?.birth_place || "",
      birth_date: initialData?.birth_date || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      kta_number: initialData?.kta_number || "",
      kta_expiry_date: initialData?.kta_expiry_date || "",
      gada_level: initialData?.gada_level || "Belum Ada",
      gada_certificate_number: initialData?.gada_certificate_number || "",
      position: initialData?.position || "Anggota",
      status: initialData?.status || "active",
      current_site_id: initialData?.current_site_id || "",
      join_date: initialData?.join_date || new Date().toISOString().split("T")[0],
      bank_name: initialData?.bank_name || "",
      bank_account_number: initialData?.bank_account_number || "",
      photo_url: initialData?.photo_url || "",
    },
  });

  const onSubmit = async (values: PersonnelFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      if (isEditing && initialData?.id) {
        const result = await updatePersonnel(initialData.id, values);
        if (!result.success) {
          setServerError(result.error || "Gagal memperbarui data personel");
          setLoading(false);
          return;
        }
      } else {
        const result = await createPersonnel(values);
        if (!result.success) {
          setServerError(result.error || "Gagal mendaftarkan personel baru");
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard/personnel");
      router.refresh();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  const onError = (errors: FieldErrors<PersonnelFormValues>) => {
    if (errors.nik || errors.full_name || errors.gender || errors.join_date || errors.birth_date || errors.birth_place) {
      setActiveTab("biodata");
    } else if (errors.phone || errors.email || errors.address) {
      setActiveTab("kontak");
    } else if (errors.gada_level || errors.gada_certificate_number || errors.kta_number || errors.kta_expiry_date) {
      setActiveTab("legalitas");
    } else if (errors.position || errors.status || errors.current_site_id || errors.bank_name || errors.bank_account_number) {
      setActiveTab("penempatan");
    }
  };

  const tabs = [
    { id: "biodata", label: "1. Biodata Pribadi", icon: User },
    { id: "kontak", label: "2. Kontak & Alamat", icon: Phone },
    { id: "legalitas", label: "3. Legalitas KTA & Gada", icon: FileBadge2 },
    { id: "penempatan", label: "4. Penempatan & Bank", icon: Building2 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/personnel">
            <Button
              variant="outline"
              size="sm"
              className="border-[#374151] bg-[#111827] text-white hover:bg-[#1f2937] text-xs h-9"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {isEditing ? "Perbarui Data Personil Satpam" : "Registrasi Personil Satpam Baru"}
          </h1>
        </div>
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-[#374151] gap-2 pb-2 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#f59e0b]/15 text-[#f59e0b] ring-1 ring-[#f59e0b]/30"
                  : "text-[#9ca3af] hover:bg-[#111827] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          <Card className="border-[#374151] bg-[#030712] p-6">
            <CardContent className="p-0">
              {/* TAB 1: BIODATA UTAMA */}
              <div className={activeTab === "biodata" ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Induk Kependudukan (NIK) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="16 digit NIK KTP..."
                          maxLength={16}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>16 digit sesuai e-KTP resmi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap (Sesuai KTP) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Budi Santoso"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? "Laki-laki"}
                          className="flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="join_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai Bergabung *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Lahir</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Kota kelahiran..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Lahir</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TAB 2: KONTAK & ALAMAT */}
              <div className={activeTab === "kontak" ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Handphone / WhatsApp *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="08xxxxxxxxxx"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>Nomor aktif untuk koordinasi darurat & shift</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nama@email.com (opsional)"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap Domisili</FormLabel>
                        <FormControl>
                          <textarea
                            rows={3}
                            placeholder="Alamat domisili saat ini (jalan, RT/RW, kelurahan, kecamatan)..."
                            {...field}
                            value={field.value ?? ""}
                            className="w-full rounded-lg border border-[#374151] bg-[#111827] p-3 text-sm text-[#f9fafb] placeholder-[#6b7280] focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* TAB 3: LEGALITAS KTA & GADA */}
              <div className={activeTab === "legalitas" ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
                <FormField
                  control={form.control}
                  name="gada_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kualifikasi Pendidikan Gada (Mabes Polri) *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? "Belum Ada"}
                          className="flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                        >
                          <option value="Belum Ada">Belum Ada</option>
                          <option value="Pratama">Gada Pratama (Dasar)</option>
                          <option value="Madya">Gada Madya (Supervisor/Danru)</option>
                          <option value="Utama">Gada Utama (Manajer/Chief)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gada_certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Ijazah / Sertifikat Gada</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor sertifikat kepolisian..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kta_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Kartu Tanda Anggota (KTA) Polri</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor KTA aktif..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Dikeluarkan oleh Polda/Ditbinmas setempat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kta_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Masa Berlaku KTA (Expiry Date)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-amber-400/90 font-medium">
                        Wajib diisi jika nomor KTA dicantumkan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TAB 4: PENEMPATAN & BANK */}
              <div className={activeTab === "penempatan" ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan / Penugasan *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? "Anggota"}
                          className="flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                        >
                          <option value="Anggota">Anggota Regu</option>
                          <option value="Danru">Komandan Regu (Danru)</option>
                          <option value="Korlap">Koordinator Lapangan (Korlap)</option>
                          <option value="Chief">Chief Security</option>
                          <option value="Staff">Staff Operasional</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Operasional *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? "active"}
                          className="flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                        >
                          <option value="active">Aktif Bertugas</option>
                          <option value="leave">Sedang Cuti</option>
                          <option value="inactive">Nonaktif</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_site_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penempatan Pos Jaga (Site)</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          className="flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                        >
                          <option value="">-- Belum Ditempatkan / Pool Pusat --</option>
                          {sites.map((site) => (
                            <option key={site.id} value={site.id}>
                              {site.code} - {site.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        Pilih lokasi klien tempat personel ditugaskan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank Pembayaran Gaji</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BCA / Mandiri / BRI / BNI"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening Bank</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor rekening transfer..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#374151] pt-5">
            <div className="flex flex-wrap gap-2">
              {activeTab !== "biodata" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                  }}
                  className="border-[#374151] bg-[#111827] text-white hover:bg-[#1f2937] text-xs"
                >
                  Sebelumnya
                </Button>
              )}
              {activeTab !== "penempatan" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                  }}
                  className="border-[#374151] bg-[#111827] text-white hover:bg-[#1f2937] text-xs"
                >
                  Selanjutnya
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#f59e0b] text-black hover:bg-[#d97706] font-bold text-xs px-6 h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>{isEditing ? "Simpan Perubahan" : "Simpan Personil Baru"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
