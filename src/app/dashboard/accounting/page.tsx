import Link from "next/link";
import {
  BookOpen,
  Layers,
  FileSpreadsheet,
  PlusCircle,
  Receipt,
  Scale,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getAccounts, getJournalEntries } from "./actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AccountingOverviewPage() {
  const [{ data: accounts }, { data: journals }] = await Promise.all([
    getAccounts(),
    getJournalEntries(),
  ]);

  const totalAccounts = accounts.length;
  const assetAccounts = accounts.filter((a) => a.category === "Aset").length;
  const liabilityAccounts = accounts.filter((a) => a.category === "Liabilitas").length;
  const expenseAccounts = accounts.filter((a) => a.category === "Beban").length;

  const totalEntries = journals.length;
  const totalVolume = journals.reduce((acc, j) => acc + j.total_debit, 0);

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#f59e0b]" />
            Modul Akuntansi & Jurnal Umum BUJP
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Engine pembukuan double-entry berstandar SAK, bagan akun hierarkis, buku besar, dan buku pembantu piutang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/accounting/journals/new">
            <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
              <PlusCircle className="h-4 w-4 mr-2" />
              Input Jurnal Manual (ACC-04)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Akun COA</CardTitle>
            <Layers className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAccounts}</div>
            <p className="text-xs text-gray-400 mt-1">
              {assetAccounts} Aset, {liabilityAccounts} Liabilitas, {expenseAccounts} Beban
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Voucher Jurnal</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{totalEntries}</div>
            <p className="text-xs text-gray-400 mt-1">Transaksi terposting immutable</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Volume Transaksi Buku</CardTitle>
            <Scale className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Rp {totalVolume.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-400 mt-1">Debit = Kredit Seimbang 100%</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Integritas Double-Entry</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-xs">
              Terverifikasi Otomatis
            </Badge>
            <p className="text-xs text-gray-400 mt-1.5">Validasi PostgreSQL RPC aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/accounting/coa" className="block group">
          <Card className="bg-[#030712] border-[#374151] group-hover:border-[#f59e0b]/50 transition-colors h-full">
            <CardHeader>
              <Layers className="h-8 w-8 text-[#f59e0b] mb-2" />
              <CardTitle className="text-white group-hover:text-[#f59e0b] transition-colors">
                Bagan Akun (COA)
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Pohon hierarki 5 klasifikasi akun: Aset, Kewajiban, Ekuitas, Pendapatan Jasa Satpam, dan Beban Operasional.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/accounting/journals" className="block group">
          <Card className="bg-[#030712] border-[#374151] group-hover:border-[#f59e0b]/50 transition-colors h-full">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                Jurnal Umum & Voucher
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Riwayat kronologis seluruh entri transaksi (Otomatis dari Invoice, Payroll, Logistik, dan Penyesuaian Manual).
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/accounting/ledger" className="block group">
          <Card className="bg-[#030712] border-[#374151] group-hover:border-[#f59e0b]/50 transition-colors h-full">
            <CardHeader>
              <FileSpreadsheet className="h-8 w-8 text-emerald-400 mb-2" />
              <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
                Buku Besar (General Ledger)
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Mutasi debit/kredit dan saldo berjalan per akun COA untuk keperluan audit dan penyusunan laporan keuangan.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/accounting/receivables" className="block group">
          <Card className="bg-[#030712] border-[#374151] group-hover:border-[#f59e0b]/50 transition-colors h-full">
            <CardHeader>
              <Receipt className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                Buku Pembantu Piutang
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Rincian saldo piutang tagihan per masing-masing klien mitra, riwayat pembayaran, dan status pelunasan.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Journal Entries Preview */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#f59e0b]" />
              Transaksi Jurnal Terkini
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              5 transaksi pembukuan terakhir yang tercatat di sistem
            </CardDescription>
          </div>
          <Link href="/dashboard/accounting/journals">
            <Button variant="ghost" size="sm" className="text-xs text-[#f59e0b] hover:text-[#d97706]">
              Lihat Semua Jurnal
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {journals.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-4">Belum ada transaksi jurnal yang terposting.</p>
          ) : (
            <div className="space-y-3">
              {journals.slice(0, 5).map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-lg bg-[#111827] border border-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2937] text-gray-200 border border-[#374151]">
                        {j.entry_number}
                      </span>
                      <Badge className="bg-[#1f2937] text-gray-300 border-[#374151] text-[10px]">
                        {j.source_type}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">{j.entry_date}</span>
                    </div>
                    <p className="text-sm text-white font-medium mt-1">{j.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-emerald-400">
                      Rp {j.total_debit.toLocaleString("id-ID")}
                    </span>
                    <div className="text-[11px] text-gray-500">{j.lines.length} baris akun</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
