"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Save,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Shield,
  Plus,
  Trash2,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { createInvoice, type ClientWithSites } from "@/app/dashboard/invoices/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InvoiceFormProps {
  clients: ClientWithSites[];
}

export function InvoiceForm({ clients }: InvoiceFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7);
  // Default due date: 14 days from now
  const defaultDueDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client_id: clients.length > 0 ? clients[0].id : "",
      period_month: currentMonthStr,
      due_date: defaultDueDate,
      ppn_rate: 11,
      pph23_amount: 0,
      lines:
        clients.length > 0 && clients[0].sites.length > 0
          ? clients[0].sites.map((s) => ({
              site_id: s.id,
              personnel_count: s.active_personnel_count || 1,
              rate_per_personnel: s.monthly_rate_per_personnel || 6500000,
              line_total:
                (s.active_personnel_count || 1) *
                (s.monthly_rate_per_personnel || 6500000),
            }))
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedClientId = watch("client_id");
  const currentClient = clientMap.get(selectedClientId);
  const linesWatch = watch("lines") || [];
  const ppnRate = Number(watch("ppn_rate")) || 0;
  const pph23Amount = Number(watch("pph23_amount")) || 0;

  // Recalculate Subtotal
  const subtotal = linesWatch.reduce((acc, l) => {
    const qty = Number(l.personnel_count) || 0;
    const rate = Number(l.rate_per_personnel) || 0;
    return acc + qty * rate;
  }, 0);

  const ppnAmount = Math.round(subtotal * (ppnRate / 100));
  const totalAmount = subtotal + ppnAmount - pph23Amount;

  // When client changes, auto-populate lines from client's sites
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setValue("client_id", cId);
    const client = clientMap.get(cId);
    if (client && client.sites.length > 0) {
      const newLines = client.sites.map((s) => ({
        site_id: s.id,
        personnel_count: s.active_personnel_count || 1,
        rate_per_personnel: s.monthly_rate_per_personnel || 6500000,
        line_total:
          (s.active_personnel_count || 1) *
          (s.monthly_rate_per_personnel || 6500000),
      }));
      setValue("lines", newLines);
    } else {
      setValue("lines", []);
    }
  };

  const handleLineValueChange = (index: number, count?: number, rate?: number) => {
    const currentCount = count !== undefined ? count : Number(linesWatch[index]?.personnel_count) || 0;
    const currentRate = rate !== undefined ? rate : Number(linesWatch[index]?.rate_per_personnel) || 0;
    setValue(`lines.${index}.line_total`, currentCount * currentRate);
  };

  const submitWithAutoPost = async (autoPost: boolean) => {
    setServerError(null);
    handleSubmit(async (values) => {
      try {
        const res = await createInvoice(values, autoPost);
        if (!res.success) {
          setServerError(res.error || "Gagal membuat invoice");
          return;
        }
        router.push("/dashboard/invoices");
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
      }
    })();
  };

  return (
    <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] max-w-4xl mx-auto shadow-xl">
      <CardHeader className="border-b border-[#374151]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-[#f9fafb]">
              <FileText className="h-5 w-5 text-[#f59e0b]" />
              Buat Faktur Tagihan Jasa Pengamanan (Invoice)
            </CardTitle>
            <CardDescription className="text-[#9ca3af]">
              Pilih klien mitra untuk menarik otomatis seluruh pos jaga aktif, alokasi satpam, dan tarif bulanan.
            </CardDescription>
          </div>
          <Link href="/dashboard/invoices">
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

        <form className="space-y-6">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="client_id" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Klien Mitra Pembayar <span className="text-[#ef4444]">*</span>
              </Label>
              <select
                id="client_id"
                {...register("client_id")}
                onChange={handleClientChange}
                className="w-full h-10 px-3 rounded-md bg-[#030712] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.company_name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-xs text-[#ef4444]">{errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_month" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Periode Tagihan <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="period_month"
                type="month"
                {...register("period_month")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.period_month && (
                <p className="text-xs text-[#ef4444]">{errors.period_month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Jatuh Tempo Pembayaran <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.due_date && (
                <p className="text-xs text-[#ef4444]">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Line Items: Pos Jaga & Manpower */}
          <div className="space-y-3 pt-4 border-t border-[#374151]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Rincian Pos Jaga & Tarif Penempatan Satpam
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Kalkulasi subtotal: Jumlah Personel Aktif $\times$ Tarif Bulanan per Personel.
                </p>
              </div>
              {currentClient && currentClient.sites.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      site_id: currentClient.sites[0].id,
                      personnel_count: 1,
                      rate_per_personnel: currentClient.sites[0].monthly_rate_per_personnel || 6500000,
                      line_total: currentClient.sites[0].monthly_rate_per_personnel || 6500000,
                    })
                  }
                  className="border-[#374151] hover:bg-[#1f2937] text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 text-[#f59e0b]" />
                  Tambah Pos Jaga
                </Button>
              )}
            </div>

            {errors.lines && (
              <p className="text-xs text-[#ef4444]">{errors.lines.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const availableSites = currentClient?.sites || [];
                const lineCount = Number(watch(`lines.${index}.personnel_count`)) || 0;
                const lineRate = Number(watch(`lines.${index}.rate_per_personnel`)) || 0;
                const lineTotal = lineCount * lineRate;

                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-lg bg-[#030712] border border-[#374151] flex flex-col md:flex-row items-center gap-3"
                  >
                    {/* Site selector */}
                    <div className="flex-1 w-full">
                      <Label className="text-[10px] uppercase text-[#9ca3af] block mb-1">
                        Pos Jaga / Site Pengamanan
                      </Label>
                      <select
                        {...register(`lines.${index}.site_id`)}
                        onChange={(e) => {
                          const s = availableSites.find((st) => st.id === e.target.value);
                          if (s) {
                            setValue(`lines.${index}.rate_per_personnel`, s.monthly_rate_per_personnel || 6500000);
                            handleLineValueChange(index, undefined, s.monthly_rate_per_personnel);
                          }
                        }}
                        className="w-full h-10 px-3 rounded-md bg-[#111827] border border-[#374151] text-[#f9fafb] text-sm focus:border-[#f59e0b] focus:outline-none"
                      >
                        {availableSites.map((st) => (
                          <option key={st.id} value={st.id}>
                            [{st.code}] {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Personnel count */}
                    <div className="w-full md:w-32">
                      <Label className="text-[10px] uppercase text-[#9ca3af] block mb-1">
                        Jumlah Satpam
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`lines.${index}.personnel_count`, {
                          onChange: (e) =>
                            handleLineValueChange(index, Number(e.target.value), undefined),
                        })}
                        className="bg-[#111827] border-[#374151] text-[#f9fafb] font-mono text-right focus:border-[#f59e0b]"
                      />
                    </div>

                    {/* Rate per personnel */}
                    <div className="w-full md:w-44">
                      <Label className="text-[10px] uppercase text-[#9ca3af] block mb-1">
                        Tarif / Satpam / Bulan
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        {...register(`lines.${index}.rate_per_personnel`, {
                          onChange: (e) =>
                            handleLineValueChange(index, undefined, Number(e.target.value)),
                        })}
                        className="bg-[#111827] border-[#374151] text-[#f9fafb] font-mono text-right focus:border-[#f59e0b]"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="w-full md:w-40 text-right">
                      <div className="text-[10px] uppercase text-[#9ca3af] mb-1">Total Site</div>
                      <div className="font-mono text-sm font-semibold text-[#10b981] pt-2">
                        Rp {lineTotal.toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="shrink-0 pt-4">
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

          {/* Tax Breakdown & Final Summary */}
          <div className="p-4 rounded-lg bg-[#1f2937]/50 border border-[#374151] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ppn_rate" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                  Tarif PPN (%)
                </Label>
                <Input
                  id="ppn_rate"
                  type="number"
                  min={0}
                  max={100}
                  {...register("ppn_rate")}
                  className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono w-24 focus:border-[#f59e0b]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pph23_amount" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                  Potongan PPh Pasal 23 (Jika Ada, Rp)
                </Label>
                <Input
                  id="pph23_amount"
                  type="number"
                  min={0}
                  {...register("pph23_amount")}
                  className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono focus:border-[#f59e0b]"
                />
              </div>
            </div>

            <div className="border-t border-[#374151] pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#9ca3af]">
                <span>Subtotal DPP:</span>
                <span className="font-mono text-[#f9fafb]">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[#9ca3af]">
                <span>PPN Keluaran ({ppnRate}%):</span>
                <span className="font-mono text-[#f9fafb]">Rp {ppnAmount.toLocaleString("id-ID")}</span>
              </div>
              {pph23Amount > 0 && (
                <div className="flex justify-between text-[#ef4444]">
                  <span>Potongan PPh 23:</span>
                  <span className="font-mono">- Rp {pph23Amount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#10b981] pt-2 border-t border-[#374151]/50">
                <span>Total Nilai Faktur Tagihan:</span>
                <span className="font-mono text-xl">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="text-xs text-[#9ca3af] flex items-start gap-2 border-t border-[#374151]/50 pt-2">
              <ShieldCheck className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <span>
                <strong>Jurnal Akuntansi:</strong> Saat faktur diterbitkan, sistem atomik mencatat:{" "}
                <span className="text-[#f9fafb]">Debit Piutang Usaha (11200)</span> sebesar Total Tagihan,{" "}
                <span className="text-[#f9fafb]">Kredit Pendapatan Jasa Satpam (41100)</span> sebesar Subtotal, dan{" "}
                <span className="text-[#f9fafb]">Kredit Utang PPN Keluaran (21400)</span>.
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#374151]">
            <Link href="/dashboard/invoices" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-[#374151] hover:bg-[#1f2937]">
                Batal
              </Button>
            </Link>
            <Button
              type="button"
              disabled={isSubmitting || fields.length === 0}
              onClick={() => submitWithAutoPost(false)}
              className="w-full sm:w-auto bg-[#1f2937] text-[#f9fafb] border border-[#374151] hover:bg-[#374151]"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Sebagai Draf
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || fields.length === 0}
              onClick={() => submitWithAutoPost(true)}
              className="w-full sm:w-auto bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706] min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menerbitkan...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Terbitkan Faktur & Posting Jurnal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
