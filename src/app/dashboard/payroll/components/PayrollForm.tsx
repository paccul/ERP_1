"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Save,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  payrollRunFormSchema,
  type PayrollRunFormValues,
} from "@/lib/validations/payroll";
import { createPayrollRun } from "@/app/dashboard/payroll/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PersonnelPayrollItem {
  id: string;
  full_name: string;
  kta_number: string | null;
  position: string | null;
  current_site_id: string | null;
  site_name: string | null;
  standard_basic_salary: number;
  standard_allowance: number;
}

interface PayrollFormProps {
  personnelList: PersonnelPayrollItem[];
}

export function PayrollForm({ personnelList }: PayrollFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const initialPayslips = personnelList.map((p) => {
    const basic = p.standard_basic_salary || 4800000;
    const allowance = p.standard_allowance || 250000;
    const bpjsKes = Math.round(basic * 0.01);
    const bpjsKet = Math.round(basic * 0.02);
    const deductions = bpjsKes + bpjsKet;
    const net = basic + allowance - deductions;

    return {
      personnel_id: p.id,
      site_id: p.current_site_id || "",
      basic_salary: basic,
      allowance_position: allowance,
      overtime_amount: 0,
      bpjs_kesehatan: bpjsKes,
      bpjs_ketenagakerjaan: bpjsKet,
      pph21_amount: 0,
      uniform_deduction: 0,
      net_salary: net,
    };
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PayrollRunFormValues>({
    resolver: zodResolver(payrollRunFormSchema),
    defaultValues: {
      period_month: currentMonthStr,
      run_date: todayStr,
      payslips: initialPayslips,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "payslips",
  });

  const payslipsWatch = watch("payslips") || [];

  // Recalculate row net salary when any component changes
  const handleSalaryComponentChange = (index: number) => {
    const row = payslipsWatch[index];
    if (!row) return;

    const basic = Number(row.basic_salary) || 0;
    const allowance = Number(row.allowance_position) || 0;
    const overtime = Number(row.overtime_amount) || 0;
    const bpjsKes = Number(row.bpjs_kesehatan) || 0;
    const bpjsKet = Number(row.bpjs_ketenagakerjaan) || 0;
    const pph21 = Number(row.pph21_amount) || 0;
    const uniform = Number(row.uniform_deduction) || 0;

    const deductions = bpjsKes + bpjsKet + pph21 + uniform;
    const net = basic + allowance + overtime - deductions;

    setValue(`payslips.${index}.net_salary`, net);
  };

  // Grand totals
  let grandGross = 0;
  let grandDeductions = 0;
  let grandNet = 0;

  for (const row of payslipsWatch) {
    const basic = Number(row.basic_salary) || 0;
    const allowance = Number(row.allowance_position) || 0;
    const overtime = Number(row.overtime_amount) || 0;
    const bpjsKes = Number(row.bpjs_kesehatan) || 0;
    const bpjsKet = Number(row.bpjs_ketenagakerjaan) || 0;
    const pph21 = Number(row.pph21_amount) || 0;
    const uniform = Number(row.uniform_deduction) || 0;

    const gross = basic + allowance + overtime;
    const deductions = bpjsKes + bpjsKet + pph21 + uniform;
    const net = gross - deductions;

    grandGross += gross;
    grandDeductions += deductions;
    grandNet += net;
  }

  const submitWithAutoPost = async (autoPost: boolean) => {
    setServerError(null);
    handleSubmit(async (values) => {
      try {
        const res = await createPayrollRun(values, autoPost);
        if (!res.success) {
          setServerError(res.error || "Gagal memproses payroll");
          return;
        }
        router.push("/dashboard/payroll");
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
      }
    })();
  };

  return (
    <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] max-w-6xl mx-auto shadow-xl">
      <CardHeader className="border-b border-[#374151]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-[#f9fafb]">
              <Banknote className="h-5 w-5 text-[#f59e0b]" />
              Formulir Pemrosesan Penggajian Satpam (Payroll)
            </CardTitle>
            <CardDescription className="text-[#9ca3af]">
              Perhitungan take-home pay seluruh anggota satpam aktif terintegrasi otomatis dengan jurnal beban gaji dan kewajiban BPJS.
            </CardDescription>
          </div>
          <Link href="/dashboard/payroll">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_month" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Periode Bulan Gaji <span className="text-[#ef4444]">*</span>
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
              <Label htmlFor="run_date" className="text-xs uppercase tracking-wider text-[#9ca3af]">
                Tanggal Pelaksanaan Payroll <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="run_date"
                type="date"
                {...register("run_date")}
                className="bg-[#030712] border-[#374151] text-[#f9fafb] focus:border-[#f59e0b]"
              />
              {errors.run_date && (
                <p className="text-xs text-[#ef4444]">{errors.run_date.message}</p>
              )}
            </div>
          </div>

          {/* Table of Personnel Payslips */}
          <div className="space-y-3 pt-4 border-t border-[#374151]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Daftar Anggota Satpam & Komponen Gaji ({fields.length} Personel)
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Sesuaikan tunjangan regu, jam lembur, dan potongan seragam jika diperlukan.
                </p>
              </div>
            </div>

            <div className="w-full border border-[#374151] rounded-lg overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-[#030712] border-b border-[#374151]">
                  <TableRow className="border-b border-[#374151] hover:bg-transparent text-xs">
                    <TableHead className="text-xs uppercase text-[#9ca3af]">Nama Anggota Satpam</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right">Gaji Pokok</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right">Tunjangan</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right">Lembur</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right">BPJS (1%+2%)</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right">Potongan Lain</TableHead>
                    <TableHead className="text-xs uppercase text-[#9ca3af] text-right font-bold text-[#10b981]">
                      Gaji Netto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const pMeta = personnelList[index];
                    const row = payslipsWatch[index] || {};
                    const basic = Number(row.basic_salary) || 0;
                    const allowance = Number(row.allowance_position) || 0;
                    const overtime = Number(row.overtime_amount) || 0;
                    const bpjsTotal = (Number(row.bpjs_kesehatan) || 0) + (Number(row.bpjs_ketenagakerjaan) || 0);
                    const otherDeduct = (Number(row.pph21_amount) || 0) + (Number(row.uniform_deduction) || 0);
                    const netSalary = basic + allowance + overtime - bpjsTotal - otherDeduct;

                    return (
                      <TableRow
                        key={field.id}
                        className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50"
                      >
                        <TableCell>
                          <input type="hidden" {...register(`payslips.${index}.personnel_id`)} />
                          <input type="hidden" {...register(`payslips.${index}.site_id`)} />
                          <div className="font-semibold text-sm text-[#f9fafb]">
                            {pMeta?.full_name || "Personel Satpam"}
                          </div>
                          <div className="text-xs text-[#9ca3af]">
                            {pMeta?.position || "Anggota"} | {pMeta?.site_name || "Pusat"}
                          </div>
                        </TableCell>

                        {/* Basic Salary */}
                        <TableCell className="w-36">
                          <Input
                            type="number"
                            min={0}
                            {...register(`payslips.${index}.basic_salary`, {
                              onChange: () => handleSalaryComponentChange(index),
                            })}
                            className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono text-xs text-right h-8 focus:border-[#f59e0b]"
                          />
                        </TableCell>

                        {/* Allowance */}
                        <TableCell className="w-32">
                          <Input
                            type="number"
                            min={0}
                            {...register(`payslips.${index}.allowance_position`, {
                              onChange: () => handleSalaryComponentChange(index),
                            })}
                            className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono text-xs text-right h-8 focus:border-[#f59e0b]"
                          />
                        </TableCell>

                        {/* Overtime */}
                        <TableCell className="w-32">
                          <Input
                            type="number"
                            min={0}
                            {...register(`payslips.${index}.overtime_amount`, {
                              onChange: () => handleSalaryComponentChange(index),
                            })}
                            className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono text-xs text-right h-8 focus:border-[#f59e0b]"
                          />
                        </TableCell>

                        {/* BPJS (Combined view, backed by fields) */}
                        <TableCell className="w-32 text-right">
                          <input type="hidden" {...register(`payslips.${index}.bpjs_kesehatan`)} />
                          <input type="hidden" {...register(`payslips.${index}.bpjs_ketenagakerjaan`)} />
                          <div className="font-mono text-xs text-[#ef4444] pt-2">
                            - Rp {bpjsTotal.toLocaleString("id-ID")}
                          </div>
                        </TableCell>

                        {/* Other deductions (Uniform / PPh) */}
                        <TableCell className="w-32">
                          <input type="hidden" {...register(`payslips.${index}.pph21_amount`)} />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Seragam"
                            {...register(`payslips.${index}.uniform_deduction`, {
                              onChange: () => handleSalaryComponentChange(index),
                            })}
                            className="bg-[#030712] border-[#374151] text-[#f9fafb] font-mono text-xs text-right h-8 focus:border-[#f59e0b]"
                          />
                        </TableCell>

                        {/* Net Salary */}
                        <TableCell className="w-36 text-right font-mono text-sm font-bold text-[#10b981]">
                          <input type="hidden" {...register(`payslips.${index}.net_salary`)} />
                          Rp {netSalary.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payroll Financial Summary & Accounting Prompt */}
          <div className="p-4 rounded-lg bg-[#1f2937]/50 border border-[#374151] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-[#030712] border border-[#374151]">
                <div className="text-xs uppercase text-[#9ca3af]">Beban Gaji Bruto (51100)</div>
                <div className="text-lg font-bold font-mono text-[#f9fafb] mt-1">
                  Rp {grandGross.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#030712] border border-[#374151]">
                <div className="text-xs uppercase text-[#9ca3af]">Kewajiban Potongan BPJS & Pajak (21200)</div>
                <div className="text-lg font-bold font-mono text-[#ef4444] mt-1">
                  - Rp {grandDeductions.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#030712] border border-[#374151]">
                <div className="text-xs uppercase text-[#9ca3af]">Total Utang Gaji Netto (21100)</div>
                <div className="text-lg font-bold font-mono text-[#10b981] mt-1">
                  Rp {grandNet.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="text-xs text-[#9ca3af] flex items-start gap-2 border-t border-[#374151]/50 pt-2">
              <ShieldCheck className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <span>
                <strong>Jurnal Akuntansi Otomatis:</strong> Saat diposting via RPC `post_payroll_to_journal`, sistem akan mencatat:{" "}
                <span className="text-[#f9fafb]">Debit Beban Gaji Satpam (51100)</span> sebesar Bruto,{" "}
                <span className="text-[#f9fafb]">Kredit Utang Gaji Netto (21100)</span>, dan{" "}
                <span className="text-[#f9fafb]">Kredit Utang Potongan BPJS & Pajak (21200)</span>.
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#374151]">
            <Link href="/dashboard/payroll" className="w-full sm:w-auto">
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
              Simpan Draft Payroll
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
                  Memproses...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Posting Gaji & Jurnal Akuntansi
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
