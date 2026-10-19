import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Banknote,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Printer,
  Eye,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getPayrollRunById } from "@/app/dashboard/payroll/actions";
import { PayrollSubnav } from "@/components/layout/PayrollSubnav";
import { PayrollActionsClient } from "@/app/dashboard/payroll/components/PayrollActionsClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PayrollDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PayrollDetailPage({ params }: PayrollDetailPageProps) {
  const { id } = await params;
  const { run, payslips, error } = await getPayrollRunById(id);

  if (error || !run) {
    notFound();
  }

  const isPosted = run.status === "posted";
  const gross = (run.total_basic_salary || 0) + (run.total_allowances || 0) + (run.total_overtime || 0);

  return (
    <div className="space-y-6">
      <PayrollSubnav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/payroll">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#9ca3af] hover:text-[#f9fafb]">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
              <Banknote className="h-6 w-6 text-[#f59e0b]" />
              Penggajian Periode:{" "}
              {run.period_month
                ? format(new Date(run.period_month), "MMMM yyyy", { locale: localeId })
                : "-"}
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isPosted
                  ? "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40"
                  : "bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]/40"
              }`}
            >
              {isPosted ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Jurnal Posted
                </>
              ) : (
                "Draft"
              )}
            </span>
          </div>
          <p className="text-sm text-[#9ca3af] mt-1">
            Tanggal Pemrosesan: {run.run_date ? format(new Date(run.run_date), "dd MMMM yyyy", { locale: localeId }) : "-"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PayrollActionsClient
            payrollRunId={run.id}
            periodMonth={run.period_month}
            status={run.status}
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Beban Gaji Bruto (51100)</CardTitle>
            <DollarSign className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              Rp {gross.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Gaji pokok + tunjangan regu + lembur
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Potongan BPJS & Pajak (21200)</CardTitle>
            <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#ef4444]">
              - Rp {(run.total_deductions || 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Kewajiban setor iuran & PPh21
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Total Utang Gaji Netto (21100)</CardTitle>
            <Banknote className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              Rp {(run.net_payroll_amount || 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Gaji bersih yang ditransfer ke rekening satpam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payslips Table */}
      <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#030712] border-b border-[#374151]">
              <TableRow className="border-b border-[#374151] hover:bg-transparent">
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Nama Anggota Satpam</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Pos Jaga / Site</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Gaji Pokok</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Tunjangan</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Lembur</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Potongan</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Gaji Netto</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Slip Gaji</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((ps) => {
                const totalDeduct =
                  (ps.bpjs_kesehatan || 0) +
                  (ps.bpjs_ketenagakerjaan || 0) +
                  (ps.pph21_amount || 0) +
                  (ps.uniform_deduction || 0);

                return (
                  <TableRow
                    key={ps.id}
                    className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                  >
                    <TableCell>
                      <div className="font-medium text-sm text-[#f9fafb]">
                        {ps.personnel?.full_name || "Anggota Satpam"}
                      </div>
                      <div className="text-xs text-[#9ca3af]">
                        KTA: {ps.personnel?.kta_number || "-"} | Rek: {ps.personnel?.bank_name || "Bank"}{" "}
                        {ps.personnel?.bank_account_number || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#9ca3af]">
                      {ps.site ? `[${ps.site.code}] ${ps.site.name}` : "Kantor Pusat / Cadangan"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      Rp {(ps.basic_salary || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#f9fafb]">
                      Rp {(ps.allowance_position || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#f9fafb]">
                      Rp {(ps.overtime_amount || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#ef4444]">
                      - Rp {totalDeduct.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold text-[#10b981]">
                      Rp {(ps.net_salary || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/dashboard/payroll/payslip/${ps.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-[#60a5fa] hover:bg-[#60a5fa]/10"
                          title="Cetak Slip Gaji PDF"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Slip
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
