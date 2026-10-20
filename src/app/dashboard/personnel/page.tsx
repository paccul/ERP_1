import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Phone,
  Edit,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getPersonnel, getSitesList } from "./actions";
import { PersonnelFilter } from "./components/PersonnelFilter";
import { DeletePersonnelButton } from "./components/DeletePersonnelButton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const dynamic = "force-dynamic";

interface PersonnelPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    siteId?: string;
  }>;
}

export default async function PersonnelPage({ searchParams }: PersonnelPageProps) {
  const { allowed } = await requirePermission("security", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Data Personel Satpam" />;
  }

  const params = await searchParams;
  const [{ data: personnelList, error }, sites] = await Promise.all([
    getPersonnel({
      search: params.search,
      status: params.status,
      siteId: params.siteId,
    }),
    getSitesList(),
  ]);

  // Statistik KTA
  const totalCount = personnelList.length;
  const activeCount = personnelList.filter((p) => p.status === "active").length;
  const expiringKtaCount = personnelList.filter(
    (p) => p.kta_status === "expiring_soon"
  ).length;
  const expiredKtaCount = personnelList.filter(
    (p) => p.kta_status === "expired"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] ring-1 ring-[#f59e0b]/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Data Personil Security
              </h1>
              <p className="text-xs text-[#9ca3af]">
                Registrasi anggota satpam, legalitas KTA Mabes Polri, sertifikasi Gada, dan penempatan pos jaga.
              </p>
            </div>
          </div>
        </div>

        <Link href="/dashboard/personnel/new">
          <Button className="bg-[#f59e0b] text-black hover:bg-[#d97706] font-bold text-xs h-9">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Tambah Personil
          </Button>
        </Link>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#374151] bg-[#030712] p-3 text-xs">
          <span className="text-[#9ca3af]">Total Personil</span>
          <div className="mt-1 text-xl font-extrabold text-white">{totalCount}</div>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#030712] p-3 text-xs">
          <span className="text-[#9ca3af]">Personil Aktif</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-400">{activeCount}</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <span className="text-[#f59e0b] font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            KTA Expire &le; 30 Hari
          </span>
          <div className="mt-1 text-xl font-extrabold text-[#f59e0b]">{expiringKtaCount}</div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs">
          <span className="text-red-400 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            KTA Kedaluwarsa
          </span>
          <div className="mt-1 text-xl font-extrabold text-red-400">{expiredKtaCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#374151] bg-[#030712] p-4">
        <PersonnelFilter sites={sites} />
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-[#374151] bg-[#030712] overflow-hidden">
        {error && (
          <div className="p-4 text-xs text-red-400 bg-red-500/10 border-b border-red-500/20">
            Terjadi kendala memuat database: {error}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">NIK & Nama Personil</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Penempatan (Site)</TableHead>
              <TableHead>Kualifikasi Gada</TableHead>
              <TableHead>Status KTA Polri</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnelList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#9ca3af]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="h-8 w-8 text-[#6b7280]" />
                    <p className="text-sm font-medium text-white">Belum ada data personil</p>
                    <p className="text-xs text-[#6b7280]">
                      Mulai registrasikan anggota security pertama Anda ke dalam sistem.
                    </p>
                    <Link href="/dashboard/personnel/new" className="pt-2">
                      <Button size="sm" className="bg-[#f59e0b] text-black text-xs font-semibold">
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Tambah Personil Baru
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              personnelList.map((person) => {
                return (
                  <TableRow key={person.id}>
                    {/* NIK & Nama */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#111827] text-[#f59e0b] font-bold text-xs ring-1 ring-[#374151]">
                          {person.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-white truncate hover:text-[#f59e0b]">
                            <Link href={`/dashboard/personnel/${person.id}`}>
                              {person.full_name}
                            </Link>
                          </span>
                          <span className="font-mono text-[11px] text-[#9ca3af]">
                            {person.nik}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kontak */}
                    <TableCell>
                      <div className="flex flex-col text-xs text-[#9ca3af]">
                        <span className="flex items-center gap-1.5 text-white">
                          <Phone className="h-3 w-3 text-[#f59e0b]" />
                          {person.phone}
                        </span>
                        <span className="text-[11px] text-[#6b7280] truncate max-w-[150px]">
                          {person.email || "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Penempatan */}
                    <TableCell>
                      {person.sites ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Building2 className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-white truncate">
                              {person.sites.name}
                            </span>
                            <span className="text-[10px] text-[#6b7280] font-mono">
                              Pos: {person.sites.code}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6b7280] italic">
                          Belum Ditempatkan
                        </span>
                      )}
                    </TableCell>

                    {/* Level Gada */}
                    <TableCell>
                      <Badge
                        variant={
                          person.gada_level === "Utama"
                            ? "default"
                            : person.gada_level === "Madya"
                            ? "warning"
                            : person.gada_level === "Pratama"
                            ? "success"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {person.gada_level || "Belum Ada"}
                      </Badge>
                    </TableCell>

                    {/* Status KTA */}
                    <TableCell>
                      {person.kta_status === "valid" ? (
                        <div className="flex flex-col">
                          <Badge variant="success" className="w-fit text-[10px]">
                            KTA Aktif
                          </Badge>
                          <span className="mt-0.5 text-[10px] text-[#9ca3af]">
                            s/d {person.kta_expiry_date}
                          </span>
                        </div>
                      ) : person.kta_status === "expiring_soon" ? (
                        <div className="flex flex-col">
                          <Badge variant="warning" className="w-fit text-[10px] animate-pulse">
                            &le; 30 Hari Lagi
                          </Badge>
                          <span className="mt-0.5 text-[10px] text-amber-400">
                            Exp: {person.kta_expiry_date}
                          </span>
                        </div>
                      ) : person.kta_status === "expired" ? (
                        <div className="flex flex-col">
                          <Badge variant="destructive" className="w-fit text-[10px]">
                            KTA Kedaluwarsa
                          </Badge>
                          <span className="mt-0.5 text-[10px] text-red-400">
                            Exp: {person.kta_expiry_date}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="w-fit text-[10px] text-[#6b7280]">
                          Tanpa KTA
                        </Badge>
                      )}
                    </TableCell>

                    {/* Status Operasional */}
                    <TableCell>
                      <Badge
                        variant={
                          person.status === "active"
                            ? "success"
                            : person.status === "leave"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] capitalize"
                      >
                        {person.status === "active"
                          ? "Aktif"
                          : person.status === "leave"
                          ? "Cuti"
                          : "Nonaktif"}
                      </Badge>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/personnel/${person.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Edit ${person.full_name}`}
                            className="h-8 w-8 p-0 text-[#9ca3af] hover:bg-[#111827] hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <DeletePersonnelButton id={person.id} name={person.full_name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
