"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  accountFormSchema,
  type AccountFormValues,
} from "@/lib/validations/account";
import { createAccount } from "@/app/dashboard/accounting/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tables } from "@/types/database.types";

interface AccountFormProps {
  parentAccounts: Tables<"accounts">[];
}

export function AccountForm({ parentAccounts }: AccountFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "Aset",
      normal_balance: "debit",
      parent_id: "",
      is_active: true,
    },
  });

  const selectedCategory = watch("category");

  // Auto-set normal balance based on category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value as "Aset" | "Liabilitas" | "Ekuitas" | "Pendapatan" | "Beban";
    if (cat === "Aset" || cat === "Beban") {
      setValue("normal_balance", "debit");
    } else {
      setValue("normal_balance", "credit");
    }
  };

  const onSubmit = async (values: AccountFormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createAccount(values);
      if (!res.success) {
        setServerError(res.error || "Gagal membuat akun baru");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/accounting/coa");
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan akun");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {serverError && (
        <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{serverError}</p>
        </div>
      )}

      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#f59e0b]" />
            Spesifikasi Akun Buku Besar
          </CardTitle>
          <CardDescription className="text-gray-400">
            Penetapan kode numerik, nama akun, klasifikasi SAK, dan saldo normal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-gray-300">
                Klasifikasi Kategori Akun <span className="text-red-400">*</span>
              </Label>
              <select
                id="category"
                {...register("category")}
                onChange={(e) => {
                  register("category").onChange(e);
                  handleCategoryChange(e);
                }}
                className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="Aset">1 - Aset (Harta / Kas / Piutang)</option>
                <option value="Liabilitas">2 - Liabilitas (Utang / BPJS / PPN)</option>
                <option value="Ekuitas">3 - Ekuitas (Modal / Saldo Laba)</option>
                <option value="Pendapatan">4 - Pendapatan (Jasa Satpam)</option>
                <option value="Beban">5 - Beban (Gaji / Logistik / Operasional)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="normal_balance" className="text-gray-300">
                Saldo Normal <span className="text-red-400">*</span>
              </Label>
              <select
                id="normal_balance"
                {...register("normal_balance")}
                className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="debit">Debit</option>
                <option value="credit">Kredit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code" className="text-gray-300">
                Nomor Kode Akun <span className="text-red-400">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Contoh: 11130"
                {...register("code")}
                className="mt-1 bg-[#111827] border-[#374151] text-white font-mono focus-visible:ring-[#f59e0b]"
              />
              {errors.code && (
                <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="parent_id" className="text-gray-300">
                Akun Induk (Parent)
              </Label>
              <select
                id="parent_id"
                {...register("parent_id")}
                className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="">Tidak Ada (Jadikan Akun Utama)</option>
                {parentAccounts
                  .filter((p) => p.category === selectedCategory)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-gray-300">
              Nama Akun Rekening <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Kas Kecil Operasional Pos Sudirman"
              {...register("name")}
              className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
        <Link href="/dashboard/accounting/coa">
          <Button
            type="button"
            variant="outline"
            className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Bagan Akun
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Akun COA
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
