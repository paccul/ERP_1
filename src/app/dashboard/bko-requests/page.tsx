import Link from "next/link";
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getBkoRequests } from "./actions";
import { getPersonnelForRoster } from "../roster/actions";
import { getSites } from "../sites/actions";
import { RosterSubnav } from "@/components/layout/RosterSubnav";
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
import { BkoActionButtons } from "./components/BkoActionButtons";
import { BkoRequestModal } from "./components/BkoRequestModal";

export const dynamic = "force-dynamic";

interface BkoPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function BkoRequestsPage({ searchParams }: BkoPageProps) {
  const params = await searchParams;
  const status = params.status || "all";

  const [
    { data: requests, error },
    personnelList,
    { data: sites },
  ] = await Promise.all([
    getBkoRequests({ status }),
    getPersonnelForRoster(),
    getSites(),
  ]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <RosterSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-[#f59e0b]" />
            Persetujuan BKO (Bantuan Kendali Operasi - SEC-10)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Pengelolaan mutasi penugasan temporer satpam ke pos jaga lain karena keadaan darurat atau event khusus.
          </p>
        </div>
        <BkoRequestModal
          personnelList={personnelList}
          sitesList={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Menunggu Persetujuan</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
            <p className="text-xs text-gray-400 mt-1">Perlu tindakan manajer operasional</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">BKO Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{approvedCount}</div>
            <p className="text-xs text-gray-400 mt-1">Jadwal pos tujuan telah terupdate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">BKO Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
            <p className="text-xs text-gray-400 mt-1">Tidak memenuhi syarat operasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { label: "Semua Permohonan", val: "all" },
          { label: "Menunggu (Pending)", val: "pending" },
          { label: "Disetujui (Approved)", val: "approved" },
          { label: "Ditolak (Rejected)", val: "rejected" },
        ].map((tab) => (
          <Link
            key={tab.val}
            href={`/dashboard/bko-requests?status=${tab.val}`}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === tab.val
                ? "bg-[#1f2937] text-[#f59e0b] border border-[#f59e0b]/40 font-semibold"
                : "text-gray-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table Data */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <GitCompare className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada permohonan BKO</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Buat permohonan bantuan kendali operasi untuk satpam saat ada kebutuhan darurat di pos tertentu.
              </p>
              <BkoRequestModal
                personnelList={personnelList}
                sitesList={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Personel Satpam</TableHead>
                    <TableHead className="text-gray-300">Perpindahan Pos Jaga</TableHead>
                    <TableHead className="text-gray-300">Rentang Waktu BKO</TableHead>
                    <TableHead className="text-gray-300">Alasan Kebutuhan</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi Persetujuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className="border-[#374151] hover:bg-[#111827]/50">
                      <TableCell>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-[#f59e0b]" />
                          {req.personnel?.full_name || "-"}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          NIK: {req.personnel?.nik} • {req.personnel?.position}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-300">
                            {req.origin_site?.name || "Pos Asal"}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                          <span className="font-semibold text-[#f59e0b]">
                            {req.target_site?.name || "Pos Tujuan"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-300 flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          {req.start_date} s.d {req.end_date}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-300 max-w-xs line-clamp-2">
                          {req.reason}
                        </div>
                      </TableCell>

                      <TableCell>
                        {req.status === "pending" ? (
                          <Badge className="bg-amber-950 text-amber-300 border-amber-800">
                            Menunggu
                          </Badge>
                        ) : req.status === "approved" ? (
                          <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">
                            Disetujui
                          </Badge>
                        ) : (
                          <Badge className="bg-red-950 text-red-400 border-red-800">
                            Ditolak
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {req.status === "pending" ? (
                          <BkoActionButtons
                            requestId={req.id}
                            personnelName={req.personnel?.full_name || "Anggota"}
                            targetSiteName={req.target_site?.name || "Pos Tujuan"}
                          />
                        ) : (
                          <span className="text-xs text-gray-500 italic">Selesai diproses</span>
                        )}
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
