import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Search,
  Calendar,
  Filter,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { getJournalEntries } from "../actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface JournalsPageProps {
  searchParams: Promise<{
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>;
}

export default async function JournalsPage({ searchParams }: JournalsPageProps) {
  const params = await searchParams;
  const sourceType = params.sourceType || "all";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const search = params.search || "";

  const { data: entries, error } = await getJournalEntries({
    sourceType,
    startDate,
    endDate,
    search,
  });

  const totalEntries = entries.length;
  const totalDebitSum = entries.reduce((acc, e) => acc + e.total_debit, 0);

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#f59e0b]" />
            Daftar Jurnal Umum (General Journal - ACC-03)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Buku catatan kronologis seluruh mutasi debit-kredit akuntansi yang terposting secara *immutable*.
          </p>
        </div>
        <Link href="/dashboard/accounting/journals/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
            <PlusCircle className="h-4 w-4 mr-2" />
            Input Jurnal Manual (ACC-04)
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Voucher Terposting</CardTitle>
            <BookOpen className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEntries} Voucher</div>
            <p className="text-xs text-gray-400 mt-1">Seluruh sumber transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Akumulasi Debit/Kredit</CardTitle>
            <Scale className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Rp {totalDebitSum.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-400 mt-1">100% Saldo Balance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Status Pembukuan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-xs">
              Posted & Locked
            </Badge>
            <p className="text-xs text-gray-400 mt-1">Anti-Fraud & Audit Ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label htmlFor="search" className="text-xs text-gray-400 block mb-1">
                Pencarian No. Voucher / Keterangan
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari JV-..., Gaji Satpam, Invoice..."
                  className="pl-9 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sourceType" className="text-xs text-gray-400 block mb-1">
                Sumber Transaksi
              </label>
              <select
                id="sourceType"
                name="sourceType"
                defaultValue={sourceType}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="all">Semua Sumber</option>
                <option value="manual">Penyesuaian Manual (Manual)</option>
                <option value="invoice">Penagihan Klien (Invoice)</option>
                <option value="payroll">Penggajian Satpam (Payroll)</option>
                <option value="distribution">Distribusi Logistik (Distribution)</option>
              </select>
            </div>

            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827] h-10">
              <Filter className="h-4 w-4 mr-2" />
              Terapkan Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada transaksi jurnal umum</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Entri jurnal dicatat otomatis saat menerbitkan invoice, posting payroll, atau dapat diinput manual.
              </p>
              <Link href="/dashboard/accounting/journals/new">
                <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Buat Jurnal Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="w-32 text-gray-300">No. Voucher</TableHead>
                    <TableHead className="w-28 text-gray-300">Tanggal</TableHead>
                    <TableHead className="w-28 text-gray-300">Sumber</TableHead>
                    <TableHead className="text-gray-300">Keterangan / Rincian Rekening Baris</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Debit (Rp)</TableHead>
                    <TableHead className="text-right text-gray-300 font-mono">Kredit (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="border-[#374151] hover:bg-[#111827]/40 align-top">
                      <TableCell className="font-mono text-xs font-bold text-white pt-4">
                        {entry.entry_number}
                      </TableCell>

                      <TableCell className="text-xs text-gray-300 pt-4 font-mono">
                        {entry.entry_date}
                      </TableCell>

                      <TableCell className="pt-4">
                        <Badge className="bg-[#1f2937] text-gray-300 border-[#374151] text-[10px] capitalize">
                          {entry.source_type}
                        </Badge>
                      </TableCell>

                      <TableCell className="pt-4">
                        <p className="font-medium text-white text-sm mb-2">{entry.description}</p>

                        {/* Line details */}
                        <div className="space-y-1.5 pl-3 border-l-2 border-[#374151] text-xs">
                          {entry.lines.map((l) => (
                            <div key={l.id} className="flex items-center justify-between text-gray-400">
                              <span className={l.credit > 0 ? "pl-4 text-gray-300" : "text-white font-medium"}>
                                [{l.account?.code}] {l.account?.name}
                                {l.memo && <span className="text-gray-500 text-[11px] ml-2 italic">({l.memo})</span>}
                              </span>
                              <span className="font-mono">
                                {l.debit > 0
                                  ? `(D) Rp ${l.debit.toLocaleString("id-ID")}`
                                  : `(K) Rp ${l.credit.toLocaleString("id-ID")}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm font-semibold text-emerald-400 pt-4">
                        Rp {entry.total_debit.toLocaleString("id-ID")}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm font-semibold text-blue-400 pt-4">
                        Rp {entry.total_credit.toLocaleString("id-ID")}
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
