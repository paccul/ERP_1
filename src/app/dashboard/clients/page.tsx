import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { getClients } from "./actions";
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
import { DeleteClientButton } from "./components/DeleteClientButton";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const dynamic = "force-dynamic";

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { allowed } = await requirePermission("security", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Klien Mitra & Pos Jaga" />;
  }

  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "all";

  const { data: clients, error } = await getClients({
    search,
    status,
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalSites = clients.reduce((acc, c) => acc + c.site_count, 0);

  // Check contracts expiring in <= 60 days
  const now = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(now.getDate() + 60);

  const expiringContracts = clients.filter((c) => {
    if (!c.contract_end_date) return false;
    const endDate = new Date(c.contract_end_date);
    return endDate <= sixtyDaysFromNow && endDate >= now;
  }).length;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <ClientSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#f59e0b]" />
            Data Klien Mitra (Pengguna Jasa)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Kelola data perusahaan mitra, masa berlaku kontrak, kontak PIC, dan alokasi pos jaga satpam.
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Klien Mitra
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Mitra Terdaftar</CardTitle>
            <Building2 className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalClients}</div>
            <p className="text-xs text-gray-400 mt-1">Perusahaan rekanan BUJP</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Mitra Kontrak Aktif</CardTitle>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">Aktif</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{activeClients}</div>
            <p className="text-xs text-gray-400 mt-1">Operasional pengamanan aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pos Jaga (Sites)</CardTitle>
            <MapPin className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{totalSites}</div>
            <p className="text-xs text-gray-400 mt-1">Titik pengamanan tercover</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Kontrak Berakhir Segera</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{expiringContracts}</div>
            <p className="text-xs text-gray-400 mt-1">Masa kontrak ≤ 60 hari</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Cari nama perusahaan, kode klien, atau nama PIC..."
                className="pl-9 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827]">
              Terapkan Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada data klien mitra</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Mulai daftarkan perusahaan klien mitra untuk mulai mengalokasikan pos jaga satpam.
              </p>
              <Link href="/dashboard/clients/new">
                <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Klien Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Kode & Perusahaan</TableHead>
                    <TableHead className="text-gray-300">Kontak PIC</TableHead>
                    <TableHead className="text-gray-300">Pos Jaga (Sites)</TableHead>
                    <TableHead className="text-gray-300">Masa Kontrak</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const isExpiring =
                      client.contract_end_date &&
                      new Date(client.contract_end_date) <= sixtyDaysFromNow &&
                      new Date(client.contract_end_date) >= now;

                    return (
                      <TableRow key={client.id} className="border-[#374151] hover:bg-[#111827]/50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {client.company_name}
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2937] text-gray-300 border border-[#374151]">
                                {client.code}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {client.billing_address}
                            </div>
                            {client.npwp && (
                              <div className="text-xs text-gray-500 mt-0.5">NPWP: {client.npwp}</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-gray-200 font-medium">{client.pic_name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {client.pic_phone}
                          </div>
                          {client.pic_email && (
                            <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3 text-gray-500" />
                              {client.pic_email}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Link
                            href={`/dashboard/sites?clientId=${client.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            {client.site_count} Lokasi Pos
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                          </Link>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            {new Date(client.contract_end_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          {isExpiring && (
                            <Badge className="mt-1 bg-amber-950/80 text-amber-400 border-amber-800 text-[10px]">
                              Segera Berakhir
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {client.status === "active" ? (
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
                            <Link href={`/dashboard/clients/${client.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
                              >
                                Edit / Detail
                              </Button>
                            </Link>
                            <DeleteClientButton id={client.id} companyName={client.company_name} />
                          </div>
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
