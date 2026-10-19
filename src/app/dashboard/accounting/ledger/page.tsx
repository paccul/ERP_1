import Link from "next/link";
import {
  FileSpreadsheet,
  Filter,
  Layers,
  Scale,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { getAccounts, getGeneralLedger } from "../actions";
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

interface LedgerPageProps {
  searchParams: Promise<{
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function GeneralLedgerPage({ searchParams }: LedgerPageProps) {
  const params = await searchParams;
  const { data: accounts } = await getAccounts();

  // Default to first asset account (e.g. Kas 11100 or Piutang 11200)
  const defaultAccountId = accounts[0]?.id || "";
  const selectedAccountId = params.accountId || defaultAccountId;
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";

  const ledger = selectedAccountId
    ? await getGeneralLedger(selectedAccountId, startDate, endDate)
    : {
        account: null,
        lines: [],
        totalDebit: 0,
        totalCredit: 0,
        endingBalance: 0,
        error: null,
      };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-[#f59e0b]" />
            Buku Besar Akun (General Ledger - RPT-01)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Mutasi transaksi debit/kredit dan saldo berjalan (*running balance*) per akun COA untuk audit dan analisis keuangan.
          </p>
        </div>
      </div>

      {/* Filter Selector */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label htmlFor="accountId" className="text-xs text-gray-400 block mb-1">
                Pilih Akun Rekening COA
              </label>
              <select
                id="accountId"
                name="accountId"
                defaultValue={selectedAccountId}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    [{acc.code}] {acc.name} ({acc.category} - {acc.normal_balance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="text-xs text-gray-400 block mb-1">
                Dari Tanggal
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={startDate}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              />
            </div>

            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827] h-10">
              <Filter className="h-4 w-4 mr-2" />
              Tampilkan Buku Besar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info & Running Balance Summary */}
      {ledger.account && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#030712] border-[#374151]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-400 font-medium">Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span className="font-mono text-[#f59e0b]">{ledger.account.code}</span>
                <span>{ledger.account.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-[#1f2937] text-gray-300 border-[#374151] text-[10px]">
                  {ledger.account.category}
                </Badge>
                <Badge
                  className={
                    ledger.account.normal_balance === "debit"
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]"
                      : "bg-blue-950 text-blue-400 border-blue-800 text-[10px]"
                  }
                >
                  Saldo Normal: {ledger.account.normal_balance.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#030712] border-[#374151]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-400 font-medium">Total Mutasi Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm font-mono mt-1">
                <span className="text-gray-400">Total Debit:</span>
                <span className="font-semibold text-emerald-400">
                  Rp {ledger.totalDebit.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-mono mt-1">
                <span className="text-gray-400">Total Kredit:</span>
                <span className="font-semibold text-blue-400">
                  Rp {ledger.totalCredit.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#030712] border-[#374151]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-400 font-medium">Saldo Akhir Berjalan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                Rp {ledger.endingBalance.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-gray-400 mt-1">Saldo posisi akun terkini</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ledger Table */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {ledger.error ? (
            <div className="p-8 text-center text-red-400">{ledger.error}</div>
          ) : ledger.lines.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada mutasi transaksi pada akun ini</h3>
              <p className="text-sm text-gray-500 mt-1">
                Mutasi debit dan kredit akan muncul secara otomatis saat ada transaksi jurnal yang melibatkan akun ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="w-28 text-gray-300 font-mono">Tanggal</TableHead>
                    <TableHead className="w-32 text-gray-300 font-mono">No. Voucher</TableHead>
                    <TableHead className="text-gray-300">Keterangan / Uraian Transaksi</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Debit (Rp)</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Kredit (Rp)</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Saldo Berjalan (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.lines.map((row) => (
                    <TableRow key={row.id} className="border-[#374151] hover:bg-[#111827]/40">
                      <TableCell className="font-mono text-xs text-gray-300">
                        {row.entry_date}
                      </TableCell>

                      <TableCell className="font-mono text-xs font-semibold text-[#f59e0b]">
                        {row.entry_number}
                      </TableCell>

                      <TableCell className="text-sm text-white">
                        {row.description}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm text-emerald-400">
                        {row.debit > 0 ? `Rp ${row.debit.toLocaleString("id-ID")}` : "-"}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm text-blue-400">
                        {row.credit > 0 ? `Rp ${row.credit.toLocaleString("id-ID")}` : "-"}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm font-bold text-white bg-[#111827]/30">
                        Rp {row.running_balance.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
