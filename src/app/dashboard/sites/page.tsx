import Link from "next/link";
import {
  MapPin,
  Building2,
  Plus,
  Search,
  Users,
  QrCode,
  DollarSign,
  Compass,
} from "lucide-react";
import { getSites, getClientsDropdown } from "./actions";
import { ClientSubnav } from "@/components/layout/ClientSubnav";
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
} from "@/components/ui/card";
import { DeleteSiteButton } from "./components/DeleteSiteButton";

export const dynamic = "force-dynamic";

interface SitesPageProps {
  searchParams: Promise<{
    search?: string;
    clientId?: string;
    status?: string;
  }>;
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const clientId = params.clientId || "all";
  const status = params.status || "all";

  const [{ data: sites, error }, clients] = await Promise.all([
    getSites({ search, clientId, status }),
    getClientsDropdown(),
  ]);

  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.status === "active").length;
  const totalAssignedPersonnel = sites.reduce((acc, s) => acc + s.active_personnel_count, 0);
  const totalRequiredQuota = sites.reduce(
    (acc, s) => acc + s.required_personnel_per_shift * 3, // 3 shift per 24 jam
    0
  );
  const totalCheckpoints = sites.reduce((acc, s) => acc + s.checkpoint_count, 0);

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <ClientSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#f59e0b]" />
            Lokasi Pos Jaga Satpam (Sites - SEC-05)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Daftar titik pengamanan, kuota kebutuhan satpam per shift, koordinat GPS, dan tarif billing per pos.
          </p>
        </div>
        <Link href="/dashboard/sites/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pos Jaga Baru
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pos Jaga (Sites)</CardTitle>
            <MapPin className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSites}</div>
            <p className="text-xs text-gray-400 mt-1">Titik pos di semua mitra</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pos Jaga Aktif</CardTitle>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">Aktif</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{activeSites}</div>
            <p className="text-xs text-gray-400 mt-1">Operasional dijaga 24/7</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pemenuhan Kuota Satpam</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {totalAssignedPersonnel} <span className="text-sm font-normal text-gray-400">/ {totalRequiredQuota} SLA</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Personel aktif ditempatkan</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Titik Checkpoint</CardTitle>
            <QrCode className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{totalCheckpoints}</div>
            <p className="text-xs text-gray-400 mt-1">Rute barcode patroli QR</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Cari nama pos jaga, kode pos, atau alamat..."
                className="pl-9 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
            </div>

            <select
              name="clientId"
              defaultValue={clientId}
              className="h-10 rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
            >
              <option value="all">Semua Klien Mitra</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={status}
                className="h-10 flex-1 rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>

              <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827]">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada pos jaga terdaftar</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Tambahkan titik pos jaga satpam baru untuk mulai menjadwalkan shift dan patroli.
              </p>
              <Link href="/dashboard/sites/new">
                <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pos Jaga Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Kode & Nama Pos Jaga</TableHead>
                    <TableHead className="text-gray-300">Klien Mitra</TableHead>
                    <TableHead className="text-gray-300">Kuota SLA & Personel</TableHead>
                    <TableHead className="text-gray-300">Tarif Bulanan / Org</TableHead>
                    <TableHead className="text-gray-300">Checkpoint</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <TableRow key={site.id} className="border-[#374151] hover:bg-[#111827]/50">
                      <TableCell>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {site.name}
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2937] text-gray-300 border border-[#374151]">
                              {site.code}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">{site.address}</div>
                          {site.latitude && site.longitude && (
                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 font-mono">
                              <Compass className="h-3 w-3" />
                              {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#f59e0b]" />
                          {site.client?.company_name || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Kode: {site.client?.code}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-semibold text-white">
                          {site.active_personnel_count} Satpam Aktif
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          SLA: {site.required_personnel_per_shift} orang / shift
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-mono font-semibold text-emerald-400">
                          Rp {site.monthly_rate_per_personnel.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">per personel/bulan</div>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/dashboard/checkpoints?siteId=${site.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {site.checkpoint_count} Titik QR
                        </Link>
                      </TableCell>

                      <TableCell>
                        {site.status === "active" ? (
                          <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-800 text-gray-400 border-gray-700">
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/sites/${site.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
                            >
                              Detail / Edit
                            </Button>
                          </Link>
                          <DeleteSiteButton id={site.id} siteName={site.name} />
                        </div>
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
