import Link from "next/link";
import {
  Banknote,
  PlusCircle,
  Search,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getPayrollRuns } from "@/app/dashboard/payroll/actions";
import { PayrollSubnav } from "@/components/layout/PayrollSubnav";
import { PayrollActionsClient } from "@/app/dashboard/payroll/components/PayrollActionsClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function PayrollPage({ searchParams }: PageProps) {
  const { allowed } = await requirePermission("finance", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Penggajian (Payroll Satpam)" />;
  }

  const params = await searchParams;
  const currentSearch = params.search || "";

  const { data: runs, stats, error } = await getPayrollRuns({
    search: currentSearch,
  });

  return (
    <div className="space-y-6">
      <PayrollSubnav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
            <Banknote className="h-6 w-6 text-[#f59e0b]" />
            Penggajian Anggota Satpam (Payroll)
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Pemrosesan gaji bulanan personel, tunjangan regu, lembur, dan potongan BPJS terintegrasi jurnal akuntansi.
          </p>
        </div>
        <Link href="/dashboard/payroll/new">
          <Button className="bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Proses Payroll Baru
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Total Gaji Netto Dibayarkan
            </CardTitle>
            <Banknote className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              Rp {stats.totalNetPayroll.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Take-home pay personel satpam
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Total Beban Gaji Bruto
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              Rp {stats.totalGrossSalary.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Beban pokok + tunjangan + lembur (51100)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Potongan BPJS & Pajak
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f59e0b]">
              Rp {stats.totalDeductions.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Kewajiban utang BPJS & PPh 21
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Status Penggajian
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              {stats.postedRunsCount} Periode
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Diposting ke buku besar akuntansi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" action="/dashboard/payroll" className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
              <Input
                name="search"
                defaultValue={currentSearch}
                placeholder="Cari berdasarkan periode (YYYY-MM)..."
                className="pl-9 bg-[#030712] border-[#374151] text-[#f9fafb] text-sm"
              />
            </div>
            <Button type="submit" variant="outline" className="border-[#374151] hover:bg-[#1f2937]">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#030712] border-b border-[#374151]">
              <TableRow className="border-b border-[#374151] hover:bg-transparent">
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Periode Penggajian</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Tanggal Proses</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Personel</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Beban Gaji Bruto</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Potongan</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Gaji Netto</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Status Jurnal</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-[#ef4444]">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-[#9ca3af]">
                    Belum ada proses penggajian yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((r) => {
                  const gross = (r.total_basic_salary || 0) + (r.total_allowances || 0) + (r.total_overtime || 0);
                  const isPosted = r.status === "posted";

                  return (
                    <TableRow
                      key={r.id}
                      className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                    >
                      <TableCell className="font-semibold text-sm text-[#f59e0b] flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {r.period_month
                          ? format(new Date(r.period_month), "MMMM yyyy", { locale: localeId })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-[#9ca3af]">
                        {r.run_date
                          ? format(new Date(r.run_date), "dd MMM yyyy", { locale: localeId })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1f2937] text-[#9ca3af] border border-[#374151]">
                          <Users className="h-3 w-3 text-[#60a5fa]" />
                          {r.payslips_count} Satpam
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#f9fafb]">
                        Rp {gross.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#ef4444]">
                        - Rp {(r.total_deductions || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold text-[#10b981]">
                        Rp {(r.net_payroll_amount || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
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
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/payroll/${r.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#60a5fa] hover:bg-[#60a5fa]/10"
                              title="Lihat Rincian Slip Gaji"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Rincian
                            </Button>
                          </Link>
                          <PayrollActionsClient
                            payrollRunId={r.id}
                            periodMonth={r.period_month}
                            status={r.status}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
