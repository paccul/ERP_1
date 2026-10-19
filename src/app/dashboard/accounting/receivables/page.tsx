import Link from "next/link";
import {
  Receipt,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getReceivablesLedger } from "../actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReceivablesLedgerPage() {
  const { clients, totalReceivables, error } = await getReceivablesLedger();

  const totalInvoiced = clients.reduce((acc, c) => acc + c.total_invoiced, 0);
  const totalPaid = clients.reduce((acc, c) => acc + c.total_paid, 0);

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#f59e0b]" />
            Buku Pembantu Piutang Usaha (RPT-02)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Rincian saldo piutang tagihan per masing-masing perusahaan mitra, total faktur diterbitkan, dan pelunasan pembayaran.
          </p>
        </div>
        <Link href="/dashboard/invoices">
          <Button variant="outline" className="border-[#374151] text-white hover:bg-[#111827]">
            <ExternalLink className="h-4 w-4 mr-2" />
            Buka Modul Invoicing & Billing
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Faktur Diterbitkan</CardTitle>
            <Receipt className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              Rp {totalInvoiced.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-400 mt-1">Akumulasi tagihan jasa pengamanan</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pembayaran Diterima (Lunas)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              Rp {totalPaid.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-400 mt-1">Telah masuk ke Kas & Bank BUJP</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Sisa Piutang Berjalan (Outstanding)</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-400">
              Rp {totalReceivables.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-400 mt-1">Saldo akun 11200 Piutang Usaha</p>
          </CardContent>
        </Card>
      </div>

      {/* Receivables Table */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#f59e0b]" />
            Daftar Saldo Piutang per Perusahaan Mitra
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs">
            Subledger buku pembantu piutang yang mengontrol saldo per entitas klien
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada data klien terdaftar</h3>
              <p className="text-sm text-gray-500 mt-1">
                Daftarkan perusahaan rekanan pada modul Klien & Pos Jaga untuk mulai menata pembantu piutang.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Kode & Nama Mitra Klien</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Faktur Terbit (Rp)</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Pembayaran Diterima (Rp)</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Sisa Piutang (Rp)</TableHead>
                    <TableHead className="text-center text-gray-300">Status Kelancaran</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const hasOutstanding = client.outstanding_balance > 0;

                    return (
                      <TableRow key={client.client_id} className="border-[#374151] hover:bg-[#111827]/40">
                        <TableCell>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {client.client_name}
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2937] text-gray-300 border border-[#374151]">
                              {client.client_code}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm text-gray-300">
                          Rp {client.total_invoiced.toLocaleString("id-ID")}
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm text-emerald-400">
                          Rp {client.total_paid.toLocaleString("id-ID")}
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm font-bold text-amber-400">
                          Rp {client.outstanding_balance.toLocaleString("id-ID")}
                        </TableCell>

                        <TableCell className="text-center">
                          {hasOutstanding ? (
                            <Badge className="bg-amber-950 text-amber-300 border-amber-800 text-xs">
                              Tertunda Tagihan
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-xs">
                              Lancar / Nihil
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Link href={`/dashboard/invoices?search=${client.client_code}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#374151] text-gray-300 hover:bg-[#111827] text-xs h-7"
                            >
                              Rincian Faktur
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
