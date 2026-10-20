import Link from "next/link";
import {
  Package,
  PlusCircle,
  AlertTriangle,
  Boxes,
  DollarSign,
  Search,
  Eye,
  Edit,
  Send,
} from "lucide-react";
import { getItems } from "@/app/dashboard/logistics/actions";
import { itemCategoryLabels, type ItemCategory } from "@/lib/validations/item";
import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { DeleteItemButton } from "@/app/dashboard/logistics/components/DeleteItemButton";
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
    category?: string;
    search?: string;
    lowStock?: string;
  }>;
}

export default async function LogisticsPage({ searchParams }: PageProps) {
  const { allowed } = await requirePermission("logistics", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Logistik & Perlengkapan Satpam" />;
  }

  const params = await searchParams;
  const currentCategory = params.category || "all";
  const currentSearch = params.search || "";
  const isLowStockOnly = params.lowStock === "true";

  const { data: items, stats, error } = await getItems({
    category: currentCategory,
    search: currentSearch,
    lowStockOnly: isLowStockOnly,
  });

  return (
    <div className="space-y-6">
      <LogisticsSubnav />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
            <Package className="h-6 w-6 text-[#f59e0b]" />
            Gudang Logistik & Kaporlap Satpam
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Manajemen inventaris seragam PDH/PDL, perlengkapan taktis, atribut, dan senjata terintegrasi jurnal akuntansi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/logistics/distribution">
            <Button className="bg-[#1f2937] text-[#f9fafb] border border-[#374151] hover:bg-[#374151]">
              <Send className="h-4 w-4 mr-2 text-[#f59e0b]" />
              Distribusi Kaporlap
            </Button>
          </Link>
          <Link href="/dashboard/logistics/new">
            <Button className="bg-[#f59e0b] text-[#000000] font-semibold hover:bg-[#d97706]">
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Master Item
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Total SKU Barang
            </CardTitle>
            <Boxes className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#f9fafb]">
              {stats.totalSku} Item
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Kaporlap terdaftar di master gudang
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Valuasi Persediaan Fisik
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              Rp {stats.totalStockValuation.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Nilai aset persediaan (Akun 11300)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#374151] text-[#f9fafb]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#9ca3af]">
              Peringatan Stok Kritis
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#ef4444]">
              {stats.criticalStockCount} Item
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Jumlah stok fisik $\le$ batas minimum gudang
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <Link
                href={`/dashboard/logistics?search=${currentSearch}&lowStock=${isLowStockOnly}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  currentCategory === "all"
                    ? "bg-[#f59e0b] text-[#000000] font-semibold"
                    : "text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]"
                }`}
              >
                Semua Kategori
              </Link>
              {Object.entries(itemCategoryLabels).map(([catKey, label]) => (
                <Link
                  key={catKey}
                  href={`/dashboard/logistics?category=${catKey}&search=${currentSearch}&lowStock=${isLowStockOnly}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    currentCategory === catKey
                      ? "bg-[#f59e0b] text-[#000000] font-semibold"
                      : "text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Low stock toggle */}
            <Link
              href={`/dashboard/logistics?category=${currentCategory}&search=${currentSearch}&lowStock=${!isLowStockOnly}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                isLowStockOnly
                  ? "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40"
                  : "text-[#9ca3af] border-[#374151] hover:bg-[#1f2937]"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Filter Stok Kritis Saja
            </Link>
          </div>

          {/* Search bar */}
          <form method="GET" action="/dashboard/logistics" className="flex items-center gap-2">
            <input type="hidden" name="category" value={currentCategory} />
            <input type="hidden" name="lowStock" value={String(isLowStockOnly)} />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
              <Input
                name="search"
                defaultValue={currentSearch}
                placeholder="Cari berdasarkan kode SKU atau nama barang..."
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
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Kode SKU</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Nama Barang & Ukuran</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af]">Kategori</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Stok Fisik</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Harga Satuan</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-right">Valuasi Stok</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-[#9ca3af] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-[#ef4444]">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-[#9ca3af]">
                    Belum ada data barang logistik yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-[#374151]/50 hover:bg-[#1f2937]/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-[#f59e0b]">
                      {item.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-[#f9fafb]">{item.name}</div>
                      <div className="text-xs text-[#9ca3af] flex items-center gap-2 mt-0.5">
                        {item.size && <span>Ukuran: {item.size}</span>}
                        <span>Satuan: {item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs bg-[#1f2937] text-[#9ca3af] border border-[#374151]">
                        {itemCategoryLabels[item.category as ItemCategory] || item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            item.is_low_stock
                              ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40"
                              : "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                          }`}
                        >
                          {item.current_stock ?? 0} {item.unit}
                        </span>
                        <span className="text-[11px] text-[#9ca3af] mt-0.5">
                          Min: {item.minimum_stock ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      Rp {(item.unit_price ?? 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-[#10b981]">
                      Rp {item.stock_valuation.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/logistics/detail/${item.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[#60a5fa] hover:bg-[#60a5fa]/10"
                            title="Lihat Kartu Stok"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/logistics/edit/${item.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[#f59e0b] hover:bg-[#f59e0b]/10"
                            title="Edit Master Barang"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteItemButton
                          id={item.id}
                          itemName={item.name}
                          stock={item.current_stock ?? 0}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
