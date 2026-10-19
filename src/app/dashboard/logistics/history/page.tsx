import Link from "next/link";
import {
  History,
  Send,
  Search,
  CheckCircle2,
  Package,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getDistributions } from "@/app/dashboard/logistics/actions";
import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const currentSearch = params.search || "";

  const { data: distributions, error } = await getDistributions({
    search: currentSearch,
  });

  return (
    <div className="space-y-6">
      <LogisticsSubnav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
            <History className="h-6 w-6 text-[#f59e0b]" />
            Riwayat Distribusi Kaporlap Satpam
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Arsip dokumen bukti serah terima perlengkapan jaga satpam yang telah diposting ke jurnal akuntansi.
          </p>
        </div>
        <Link href="/dashboard/logistics/distribution">
          <Button className="bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706]">
            <Send className="h-4 w-4 mr-2" />
            Distribusi Kaporlap Baru
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" action="/dashboard/logistics/history" className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
              <Input
                name="search"
                defaultValue={currentSearch}
                placeholder="Cari nomor dokumen distribusi atau nama penerima..."
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
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">No. Dokumen</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Tanggal</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Tujuan & Penerima</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Item Kaporlap</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Total Qty</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Valuasi Biaya</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Status Jurnal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-[#ef4444]">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : distributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-[#9ca3af]">
                    Belum ada riwayat dokumen distribusi yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                distributions.map((dist) => {
                  return (
                    <TableRow
                      key={dist.id}
                      className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-[#f59e0b]">
                        {dist.distribution_number}
                      </TableCell>
                      <TableCell className="text-xs text-[#9ca3af] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#f59e0b]" />
                          {format(new Date(dist.distribution_date), "dd MMM yyyy", { locale: localeId })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-[#f9fafb] flex items-center gap-1.5">
                          {dist.target_type === "personnel" ? (
                            <User className="h-3.5 w-3.5 text-[#60a5fa]" />
                          ) : (
                            <Shield className="h-3.5 w-3.5 text-[#10b981]" />
                          )}
                          {dist.recipient_name}
                        </div>
                        <div className="text-xs text-[#9ca3af]">
                          {dist.target_type === "personnel"
                            ? "Personel Satpam"
                            : `Pos Jaga: ${dist.site?.name || "-"}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {dist.lines.map((l) => (
                            <span
                              key={l.id}
                              className="px-2 py-0.5 rounded text-[11px] bg-[#1f2937] text-[#f9fafb] border border-[#374151]"
                            >
                              {l.quantity}x {l.item?.name || "Item"}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm font-semibold text-[#f9fafb]">
                        {dist.total_quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-[#10b981]">
                        Rp {dist.total_cost.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                          <CheckCircle2 className="h-3 w-3" /> Posted
                        </span>
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
