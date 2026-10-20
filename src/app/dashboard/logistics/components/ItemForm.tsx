"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  itemFormSchema,
  itemCategoryLabels,
  type ItemFormValues,
} from "@/lib/validations/item";
import { createItem, updateItem } from "@/app/dashboard/logistics/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tables } from "@/types/database.types";

interface ItemFormProps {
  initialData?: Tables<"items">;
}

export function ItemForm({ initialData }: ItemFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      category: (initialData?.category as any) || "uniform",
      unit: initialData?.unit || "Stel",
      size: initialData?.size || "",
      unit_price: initialData?.unit_price ?? 0,
      minimum_stock: initialData?.minimum_stock ?? 5,
      initial_stock: initialData?.initial_stock ?? 0,
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (values: ItemFormValues) => {
    setServerError(null);
    try {
      if (isEdit) {
        const res = await updateItem(initialData.id, values);
        if (!res.success) {
          setServerError(res.error || "Gagal memperbarui item barang");
          return;
        }
        router.push("/dashboard/logistics");
      } else {
        const res = await createItem(values);
        if (!res.success) {
          setServerError(res.error || "Gagal menambahkan item barang");
          return;
        }
        router.push("/dashboard/logistics");
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    }
  };

  return (
    <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] max-w-3xl mx-auto shadow-xl">
      <CardHeader className="border-b border-[#374151]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-[#f9fafb]">
              <Package className="h-5 w-5 text-[#f59e0b]" />
              {isEdit ? "Edit Spesifikasi Master Barang" : "Registrasi Item Logistik Baru"}
            </CardTitle>
            <CardDescription className="text-[#9ca3af]">
              {isEdit
                ? `Perbarui parameter stok, satuan, atau harga untuk kode: ${initialData.code}`
                : "Daftarkan seragam, perlengkapan taktis, atau senjata ke inventaris gudang logistik."}
            </CardDescription>
          </div>
          <Link href="/dashboard/logistics">
            <Button variant="outline" size="sm" className="border-[#374151] hover:bg-[#1f2937]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {serverError && (
          <div className="mb-6 p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center gap-3 text-[#ef4444] text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Kode Barang / SKU <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Contoh: SRG-PDH-01, HT-MOT-01"
                {...register("code")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono uppercase focus:border-[#f59e0b]"
              />
              {errors.code && <p className="text-xs text-[#ef4444]">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Kategori Perlengkapan <span className="text-[#ef4444]">*</span>
              </Label>
              <select
                id="category"
                {...register("category")}
                className="w-full h-10 px-3 rounded-md bg-[#030712] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
              >
                {Object.entries(itemCategoryLabels).map(([catKey, label]) => (
                  <option key={catKey} value={catKey}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-[#ef4444]">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-wider text-[#9ca3af]">
              Nama Lengkap Barang / Kaporlap <span className="text-[#ef4444]">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Kemeja PDH Satpam Putih Lengan Pendek"
              {...register("name")}
              className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
            />
            {errors.name && <p className="text-xs text-[#ef4444]">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Satuan Ukuran Fisik <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="unit"
                placeholder="Contoh: Stel, Pcs, Unit, Pasang, Botol"
                {...register("unit")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.unit && <p className="text-xs text-[#ef4444]">{errors.unit.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Ukuran / Dimensi (Opsional)
              </Label>
              <Input
                id="size"
                placeholder="Contoh: M, L, XL, 42, Standar"
                {...register("size")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.size && <p className="text-xs text-[#ef4444]">{errors.size.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Harga Beli Satuan (Rp) <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="unit_price"
                type="number"
                min={0}
                placeholder="0"
                {...register("unit_price")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono focus:border-[#f59e0b]"
              />
              {errors.unit_price && (
                <p className="text-xs text-[#ef4444]">{errors.unit_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Ambang Batas Stok Minimum <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="minimum_stock"
                type="number"
                min={0}
                placeholder="5"
                {...register("minimum_stock")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono focus:border-[#f59e0b]"
              />
              <p className="text-[11px] text-[#9ca3af]">
                Peringatan merah jika stok $\le$ batas ini.
              </p>
              {errors.minimum_stock && (
                <p className="text-xs text-[#ef4444]">{errors.minimum_stock.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="initial_stock" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                  Stok Awal Fisik (Gudang)
                </Label>
                <Input
                  id="initial_stock"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("initial_stock")}
                  className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono focus:border-[#f59e0b]"
                />
                <p className="text-[11px] text-[#9ca3af]">
                  Dicatat otomatis sebagai mutasi awal masuk.
                </p>
                {errors.initial_stock && (
                  <p className="text-xs text-[#ef4444]">{errors.initial_stock.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-[#9ca3af]">
              Catatan / Spesifikasi Tambahan
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Contoh: Bahan drill tebal sesuai standar Perpol 01/2023, bordir logo BUJP."
              {...register("notes")}
              className="w-full px-3 py-2 rounded-md bg-[#030712] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
            />
            {errors.notes && <p className="text-xs text-[#ef4444]">{errors.notes.message}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#374151]">
            <Link href="/dashboard/logistics" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-[#374151] hover:bg-[#1f2937]">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706] min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Simpan Perubahan" : "Daftarkan Barang"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
