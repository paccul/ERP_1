import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Edit,
  Send,
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getItemById } from "@/app/dashboard/logistics/actions";
import { itemCategoryLabels, type ItemCategory } from "@/lib/validations/item";
import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DetailItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailItemPage({ params }: DetailItemPageProps) {
  const { id } = await params;
  const { item, movements, error } = await getItemById(id);

  if (error || !item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <LogisticsSubnav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/logistics">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#9ca3af] hover:text-[#f9fafb]">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
              <Package className="h-6 w-6 text-[#f59e0b]" />
              Kartu Stok: {item.name}
            </h1>
          </div>
          <p className="text-sm text-[#9ca3af] mt-1">
            Riwayat kronologis mutasi masuk/keluar kaporlap dan rekonsiliasi saldo fisik gudang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/logistics/edit/${item.id}`}>
            <Button variant="outline" className="border-[#374151] hover:bg-[#1f2937]">
              <Edit className="h-4 w-4 mr-2 text-[#f59e0b]" />
              Edit Spesifikasi
            </Button>
          </Link>
          <Link href="/dashboard/logistics/distribution">
            <Button className="bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706]">
              <Send className="h-4 w-4 mr-2" />
              Distribusi Kaporlap
            </Button>
          </Link>
        </div>
      </div>

      {/* Item Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Kode SKU</CardTitle>
            <Boxes className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f59e0b]">{item.code}</div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Kategori: {itemCategoryLabels[item.category as ItemCategory] || item.category}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Stok Fisik Tersedia</CardTitle>
            <Package className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              {item.current_stock ?? 0}{" "}
              <span className="text-sm font-normal text-[#9ca3af]">{item.unit}</span>
            </div>
            <div className="text-xs text-[#9ca3af] mt-1 flex items-center gap-1">
              {item.is_low_stock ? (
                <span className="text-[#ef4444] font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Di bawah batas min ({item.minimum_stock ?? 0})
                </span>
              ) : (
                <span className="text-[#10b981]">Aman (Batas Min: {item.minimum_stock ?? 0})</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Harga Beli Satuan</CardTitle>
            <DollarSign className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              Rp {(item.unit_price ?? 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">Per {item.unit} {item.size ? `(${item.size})` : ""}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">Total Nilai Aset</CardTitle>
            <DollarSign className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              Rp {item.stock_valuation.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">Stok Fisik $\times$ Harga Satuan</p>
          </CardContent>
        </Card>
      </div>

      {/* Kartu Stok Table */}
      <Card className="bg-[#111827] border-[#374151] text-[#f9fafb] overflow-hidden">
        <CardHeader className="border-b border-[#374151]">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#f59e0b]" />
            Buku Kartu Stok (Running Ledger Mutasi Gudang)
          </CardTitle>
          <CardDescription className="text-[#9ca3af]">
            Daftar seluruh transaksi penerimaan, mutasi awal, dan pengeluaran distribusi kaporlap.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#030712] border-b border-[#374151]">
              <TableRow className="border-b border-[#374151] hover:bg-transparent">
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Tanggal / Waktu</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Tipe</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Mutasi Qty</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Saldo Akhir</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">No. Dokumen Ref</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Keterangan / Penerima</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-[#9ca3af]">
                    Belum ada riwayat mutasi stok untuk barang ini.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((mov) => {
                  const isOut = mov.movement_type === "out";
                  return (
                    <TableRow
                      key={mov.id}
                      className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-[#9ca3af]">
                        {mov.created_at
                          ? format(new Date(mov.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isOut
                              ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40"
                              : "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                          }`}
                        >
                          {isOut ? (
                            <>
                              <ArrowUpRight className="h-3 w-3" /> Keluar
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="h-3 w-3" /> Masuk
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono text-sm font-bold ${
                          isOut ? "text-[#ef4444]" : "text-[#10b981]"
                        }`}
                      >
                        {isOut ? `-${mov.quantity}` : `+${mov.quantity}`} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-[#f9fafb]">
                        {mov.balance_after} {item.unit}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#f59e0b]">
                        {mov.reference_number || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#f9fafb]">
                        {mov.notes || "-"}
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
