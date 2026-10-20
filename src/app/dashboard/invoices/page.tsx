import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  FileEdit,
  Eye,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getInvoices } from "@/app/dashboard/invoices/actions";
import { invoiceStatusLabels, type InvoiceStatus } from "@/lib/validations/invoice";
import { InvoiceSubnav } from "@/components/layout/InvoiceSubnav";
import { InvoiceActionsClient } from "@/app/dashboard/invoices/components/InvoiceActionsClient";
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
    status?: string;
    search?: string;
  }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const { allowed } = await requirePermission("finance", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Invoicing & Billing Manpower" />;
  }

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const currentSearch = params.search || "";

  const { data: invoices, stats, error } = await getInvoices({
    status: currentStatus,
    search: currentSearch,
  });

  return (
    <div className="space-y-6">
      <InvoiceSubnav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#f59e0b]" />
            Penagihan & Faktur Jasa Pengamanan (Invoicing)
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Manajemen tagihan bulanan jasa manpower satpam ke klien mitra terintegrasi jurnal piutang dan PPN keluaran.
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Buat Invoice Baru
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Total Akumulasi Tagihan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              Rp {stats.totalInvoiced.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Seluruh faktur dibuat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Piutang Berjalan (Unpaid)
            </CardTitle>
            <Clock className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f59e0b]">
              Rp {stats.totalUnpaid.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Faktur terbit belum terbayar
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Penerimaan Lunas (Paid)
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              Rp {stats.totalPaid.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Kas masuk terverifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Faktur Draf
            </CardTitle>
            <FileEdit className="h-4 w-4 text-[#9ca3af]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#9ca3af]">
              {stats.draftCount} Faktur
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Menunggu validasi & terbit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <Link
                href={`/dashboard/invoices?search=${currentSearch}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  currentStatus === "all"
                    ? "bg-[#f59e0b] text-[#000000] font-semibold"
                    : "text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]"
                }`}
              >
                Semua Status
              </Link>
              {Object.entries(invoiceStatusLabels).map(([statusKey, label]) => (
                <Link
                  key={statusKey}
                  href={`/dashboard/invoices?status=${statusKey}&search=${currentSearch}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    currentStatus === statusKey
                      ? "bg-[#f59e0b] text-[#000000] font-semibold"
                      : "text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <form method="GET" action="/dashboard/invoices" className="flex items-center gap-2">
              <input type="hidden" name="status" value={currentStatus} />
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                <Input
                  name="search"
                  defaultValue={currentSearch}
                  placeholder="Cari nomor faktur (INV-...)"
                  className="pl-9 bg-[#030712] border-[#374151] text-[#f9fafb] text-sm"
                />
              </div>
              <Button type="submit" variant="outline" className="border-[#374151] hover:bg-[#1f2937]">
                Cari
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#030712] border-b border-[#374151]">
              <TableRow className="border-b border-[#374151] hover:bg-transparent">
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">No. Faktur</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Klien Mitra</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Periode</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Jatuh Tempo</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Subtotal</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">PPN (11%)</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Total Tagihan</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Status</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-28 text-center text-[#ef4444]">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-28 text-center text-[#9ca3af]">
                    Belum ada faktur tagihan yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => {
                  let statusBadge = "bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]/40";
                  if (inv.status === "issued") {
                    statusBadge = "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40";
                  } else if (inv.status === "paid") {
                    statusBadge = "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40";
                  } else if (inv.status === "cancelled") {
                    statusBadge = "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40";
                  }

                  return (
                    <TableRow
                      key={inv.id}
                      className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-[#f59e0b]">
                        {inv.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-[#f9fafb] flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#3b82f6]" />
                          {inv.client?.company_name || "Klien Mitra"}
                        </div>
                        <div className="text-xs text-[#9ca3af]">
                          {inv.lines.length} Pos Jaga / Site
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#9ca3af]">
                        {inv.period_month
                          ? format(new Date(inv.period_month), "MMMM yyyy", { locale: localeId })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-[#9ca3af]">
                        {inv.due_date
                          ? format(new Date(inv.due_date), "dd MMM yyyy", { locale: localeId })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        Rp {(inv.subtotal || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#9ca3af]">
                        Rp {(inv.ppn_amount || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold text-[#10b981]">
                        Rp {(inv.total_amount || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge}`}
                        >
                          {invoiceStatusLabels[inv.status as InvoiceStatus] || inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/invoices/${inv.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#60a5fa] hover:bg-[#60a5fa]/10"
                              title="Lihat / Cetak Faktur PDF"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Faktur
                            </Button>
                          </Link>
                          <InvoiceActionsClient
                            invoiceId={inv.id}
                            invoiceNumber={inv.invoice_number}
                            status={inv.status}
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
