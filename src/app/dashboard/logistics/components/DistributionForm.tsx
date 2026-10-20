"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  distributionFormSchema,
  type DistributionFormValues,
} from "@/lib/validations/distribution";
import { createDistribution } from "@/app/dashboard/logistics/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tables } from "@/types/database.types";

interface DistributionFormProps {
  items: Tables<"items">[];
  personnel: Array<{ id: string; full_name: string; kta_number: string | null }>;
  sites: Array<{ id: string; name: string; code: string }>;
}

export function DistributionForm({ items, personnel, sites }: DistributionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ distributionNumber?: string } | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      distribution_date: todayStr,
      target_type: "personnel",
      personnel_id: "",
      site_id: "",
      recipient_name: "",
      notes: "",
      lines: items.length > 0 ? [{ item_id: items[0].id, quantity: 1, unit_cost: items[0].unit_price ?? 0 }] : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const targetType = watch("target_type");
  const linesWatch = watch("lines");

  // Calculate live total cost
  const totalCost = (linesWatch || []).reduce((acc, line) => {
    return acc + (Number(line.quantity) || 0) * (Number(line.unit_cost) || 0);
  }, 0);

  const handleTargetTypeChange = (type: "personnel" | "site") => {
    setValue("target_type", type);
    setValue("personnel_id", "");
    setValue("site_id", "");
    setValue("recipient_name", "");
  };

  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setValue("personnel_id", pId, { shouldValidate: true, shouldDirty: true });
    const selected = personnel.find((p) => p.id === pId);
    if (selected) {
      setValue("recipient_name", selected.full_name, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setValue("site_id", sId, { shouldValidate: true, shouldDirty: true });
    const selected = sites.find((s) => s.id === sId);
    if (selected) {
      setValue("recipient_name", `Kepala Pos Jaga - ${selected.name}`, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    setValue(`lines.${index}.item_id`, itemId, { shouldValidate: true, shouldDirty: true });
    const item = itemMap.get(itemId);
    if (item) {
      setValue(`lines.${index}.unit_cost`, item.unit_price ?? 0, { shouldValidate: true, shouldDirty: true });
    }
  };

  const onSubmit = async (values: DistributionFormValues) => {
    setServerError(null);
    try {
      const res = await createDistribution(values);
      if (!res.success) {
        setServerError(res.error || "Gagal memproses pengeluaran barang");
        return;
      }

      setSuccessInfo({ distributionNumber: res.distributionId });
      setTimeout(() => {
        router.push("/dashboard/logistics/history");
      }, 1500);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    }
  };

  return (
    <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] max-w-4xl mx-auto shadow-xl">
      <CardHeader className="border-b border-[#374151]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-[#f9fafb]">
              <Send className="h-5 w-5 text-[#f59e0b]" />
              Formulir Distribusi Kaporlap & Perlengkapan Jaga
            </CardTitle>
            <CardDescription className="text-[#9ca3af]">
              Pengeluaran seragam dan perlengkapan satpam terintegrasi langsung dengan mutasi stok fisik dan jurnal akuntansi otomatis.
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

        {successInfo && (
          <div className="mb-6 p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center gap-3 text-[#10b981] text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Distribusi berhasil diproses! Stok terpotong dan jurnal akuntansi telah diposting. Mengalihkan...</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Tujuan Penyerahan <span className="text-[#ef4444]">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTargetTypeChange("personnel")}
                  className={`border-[#374151] text-sm ${
                    targetType === "personnel"
                      ? "bg-[#1f2937] text-[#f59e0b] border-[#f59e0b]"
                      : "hover:bg-[#1f2937] text-[#9ca3af]"
                  }`}
                >
                  Personel Satpam
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTargetTypeChange("site")}
                  className={`border-[#374151] text-sm ${
                    targetType === "site"
                      ? "bg-[#1f2937] text-[#f59e0b] border-[#f59e0b]"
                      : "hover:bg-[#1f2937] text-[#9ca3af]"
                  }`}
                >
                  Pos Jaga / Site
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distribution_date" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Tanggal Distribusi <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="distribution_date"
                type="date"
                {...register("distribution_date")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.distribution_date && (
                <p className="text-xs text-[#ef4444]">{errors.distribution_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetType === "personnel" ? (
              <div className="space-y-2">
                <Label htmlFor="personnel_id" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                  Pilih Anggota Satpam <span className="text-[#ef4444]">*</span>
                </Label>
                <select
                  id="personnel_id"
                  {...register("personnel_id")}
                  onChange={handlePersonnelChange}
                  value={watch("personnel_id") || ""}
                  className="w-full h-10 px-3 rounded-md bg-[#030712] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
                >
                  <option value="">-- Pilih Personel Satpam --</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} {p.kta_number ? `(KTA: ${p.kta_number})` : ""}
                    </option>
                  ))}
                </select>
                {errors.personnel_id && (
                  <p className="text-xs text-[#ef4444]">{errors.personnel_id.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="site_id" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                  Pilih Pos Jaga / Site <span className="text-[#ef4444]">*</span>
                </Label>
                <select
                  id="site_id"
                  {...register("site_id")}
                  onChange={handleSiteChange}
                  value={watch("site_id") || ""}
                  className="w-full h-10 px-3 rounded-md bg-[#030712] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
                >
                  <option value="">-- Pilih Pos Jaga / Site --</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
                {errors.site_id && (
                  <p className="text-xs text-[#ef4444]">{errors.site_id.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient_name" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Nama Lengkap Penerima <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="recipient_name"
                placeholder="Nama pihak yang menerima kaporlap"
                {...register("recipient_name")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.recipient_name && (
                <p className="text-xs text-[#ef4444]">{errors.recipient_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-[#9ca3af]">
              Catatan / Keperluan Pengeluaran
            </Label>
            <Input
              id="notes"
              placeholder="Contoh: Pembagian Kaporlap semester ganjil 2026 / Perlengkapan BKO"
              {...register("notes")}
              className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-3 pt-4 border-t border-[#374151]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  Rincian Barang yang Didistribusikan
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Pilih barang dari gudang logistik beserta kuantitas pengeluaran.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    item_id: items[0]?.id || "",
                    quantity: 1,
                    unit_cost: items[0]?.unit_price ?? 0,
                  })
                }
                className="border-[#374151] hover:bg-[#1f2937] text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-[#f59e0b]" />
                Tambah Baris Barang
              </Button>
            </div>

            {errors.lines && (
              <p className="text-xs text-[#ef4444]">{errors.lines.message}</p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => {
                const currentItemId = watch(`lines.${index}.item_id`);
                const selectedItem = itemMap.get(currentItemId);
                const currentQty = Number(watch(`lines.${index}.quantity`)) || 0;
                const currentCost = Number(watch(`lines.${index}.unit_cost`)) || 0;
                const lineTotal = currentQty * currentCost;
                const stockAvailable = selectedItem?.current_stock ?? 0;
                const isOverStock = currentQty > stockAvailable;

                return (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg bg-[#030712] border border-[#374151] flex flex-col md:flex-row items-center gap-3"
                  >
                    <input type="hidden" {...register(`lines.${index}.item_id`)} />
                    <input type="hidden" {...register(`lines.${index}.unit_cost`)} />
                    {/* Item selector */}
                    <div className="flex-1 w-full">
                      <select
                        value={currentItemId}
                        onChange={(e) => handleItemSelect(index, e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-[#111827] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            [{it.code}] {it.name} (Tersedia: {it.current_stock ?? 0} {it.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-full md:w-32">
                      <Input
                        type="number"
                        min={1}
                        max={stockAvailable}
                        placeholder="Qty"
                        {...register(`lines.${index}.quantity`)}
                        className={`bg-[#111827] border-[#374151] text-[#f9fafb] font-mono text-right focus:border-[#f59e0b] ${
                          isOverStock ? "border-[#ef4444] text-[#ef4444]" : ""
                        }`}
                      />
                      {isOverStock && (
                        <p className="text-[10px] text-[#ef4444] mt-0.5">
                          Melebihi stok ({stockAvailable})
                        </p>
                      )}
                    </div>

                    {/* Unit Cost (Read-only) */}
                    <div className="w-full md:w-36 text-right font-mono text-sm text-[#9ca3af]">
                      <div className="text-[10px] uppercase">Harga Satuan</div>
                      <div>Rp {currentCost.toLocaleString("id-ID")}</div>
                    </div>

                    {/* Line Subtotal */}
                    <div className="w-full md:w-40 text-right font-mono text-sm font-semibold text-[#10b981]">
                      <div className="text-[10px] uppercase text-[#9ca3af]">Subtotal</div>
                      <div>Rp {lineTotal.toLocaleString("id-ID")}</div>
                    </div>

                    {/* Delete button */}
                    <div className="shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="h-9 w-9 p-0 text-[#ef4444] hover:bg-[#ef4444]/10 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accounting Integration Summary */}
          <div className="p-4 rounded-lg bg-[#1f2937]/50 border border-[#374151] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#9ca3af]">
                Total Valuasi Pengeluaran Perlengkapan:
              </span>
              <span className="text-xl font-bold font-mono text-[#10b981]">
                Rp {totalCost.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-xs text-[#9ca3af] flex items-start gap-2 border-t border-[#374151]/50 pt-2">
              <ShieldCheck className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <span>
                <strong>Integrasi Otomatis:</strong> Saat dikonfirmasi, sistem secara atomik akan memotong stok fisik gudang dan membuat voucher jurnal umum:{" "}
                <span className="text-[#f9fafb]">Debit Beban Perlengkapan Satpam (51300)</span> dan{" "}
                <span className="text-[#f9fafb]">Kredit Persediaan Seragam & Kaporlap (11300)</span>.
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#374151]">
            <Link href="/dashboard/logistics" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-[#374151] hover:bg-[#1f2937]">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !!successInfo || items.length === 0}
              className="w-full sm:w-auto bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706] min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses Distribusi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Posting Distribusi & Jurnal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
