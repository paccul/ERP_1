import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Clock,
  User,
  Shield,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { getRoster, getShifts, getPersonnelForRoster } from "./actions";
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
import { ShiftPlotModal } from "./components/ShiftPlotModal";
import { DeleteAssignmentButton } from "./components/DeleteAssignmentButton";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const dynamic = "force-dynamic";

interface RosterPageProps {
  searchParams: Promise<{
    siteId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const { allowed } = await requirePermission("security", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Jadwal Jaga & Plotting Roster" />;
  }

  const params = await searchParams;

  // Defaults: 7 days window starting from 3 days ago
  const now = new Date();
  const startDefault = new Date(now);
  startDefault.setDate(now.getDate() - 2);
  const endDefault = new Date(now);
  endDefault.setDate(now.getDate() + 7);

  const startDate = params.startDate || startDefault.toISOString().split("T")[0];
  const endDate = params.endDate || endDefault.toISOString().split("T")[0];
  const siteId = params.siteId || "all";

  const [
    { data: assignments, error },
    shifts,
    personnelList,
    { data: sites },
  ] = await Promise.all([
    getRoster({ siteId, startDate, endDate }),
    getShifts(),
    getPersonnelForRoster(siteId !== "all" ? siteId : undefined),
    getSites(),
  ]);

  const activeSite = sites.find((s) => s.id === siteId);

  // Quick stats
  const totalAssignments = assignments.length;
  const presentCount = assignments.filter((a) => a.status === "present").length;
  const scheduledCount = assignments.filter((a) => a.status === "scheduled").length;
  const offCount = assignments.filter((a) => a.status === "off").length;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <RosterSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-[#f59e0b]" />
            Jadwal Jaga & Plotting Shift Satpam (SEC-08)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Matriks penugasan shift harian satpam (Pagi, Siang, Malam, Off) per pos jaga dan deteksi bentrok jadwal.
          </p>
        </div>
        <ShiftPlotModal
          personnelList={personnelList}
          sitesList={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
          shiftsList={shifts}
          defaultSiteId={siteId !== "all" ? siteId : undefined}
          defaultDate={now.toISOString().split("T")[0]}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Slot Shift</CardTitle>
            <CalendarDays className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAssignments}</div>
            <p className="text-xs text-gray-400 mt-1">Periode {startDate} s.d {endDate}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Terjadwal (Scheduled)</CardTitle>
            <Badge className="bg-blue-950 text-blue-400 border-blue-800">Ready</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{scheduledCount}</div>
            <p className="text-xs text-gray-400 mt-1">Menunggu waktu dinas</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Hadir Dinas (Present)</CardTitle>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">Hadir</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{presentCount}</div>
            <p className="text-xs text-gray-400 mt-1">Konfirmasi dinas di pos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Libur / Off Duty</CardTitle>
            <Badge className="bg-gray-800 text-gray-400 border-gray-700">Off</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{offCount}</div>
            <p className="text-xs text-gray-400 mt-1">Hari istirahat anggota</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label htmlFor="siteId" className="text-xs text-gray-400 block mb-1">
                Lokasi Pos Jaga (Site)
              </label>
              <select
                id="siteId"
                name="siteId"
                defaultValue={siteId}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="all">Semua Pos Jaga</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name}
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

            <div>
              <label htmlFor="endDate" className="text-xs text-gray-400 block mb-1">
                Sampai Tanggal
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={endDate}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              />
            </div>

            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827] h-10">
              <Filter className="h-4 w-4 mr-2" />
              Tampilkan Roster
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Roster Table */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#f59e0b]" />
              Matriks Penugasan Shift Satpam
            </CardTitle>
            <CardDescription className="text-gray-400">
              {activeSite ? `Menampilkan jadwal pos jaga ${activeSite.name}` : "Menampilkan jadwal di seluruh pos"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada penugasan shift pada rentang ini</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Klik tombol &quot;Plot Jadwal Shift&quot; di atas untuk mulai menempatkan satpam ke shift jaga.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Tanggal Dinas</TableHead>
                    <TableHead className="text-gray-300">Personel Satpam</TableHead>
                    <TableHead className="text-gray-300">Pos Jaga (Site)</TableHead>
                    <TableHead className="text-gray-300">Shift & Jam Tugas</TableHead>
                    <TableHead className="text-gray-300">Status Kehadiran</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asg) => {
                    const shiftName = asg.shift?.name || (asg.status === "off" ? "Off / Libur" : "-");

                    let shiftBadgeColor = "bg-gray-800 text-gray-300 border-gray-700";
                    if (shiftName.includes("Pagi")) {
                      shiftBadgeColor = "bg-blue-950 text-blue-300 border-blue-800";
                    } else if (shiftName.includes("Siang")) {
                      shiftBadgeColor = "bg-amber-950 text-amber-300 border-amber-800";
                    } else if (shiftName.includes("Malam")) {
                      shiftBadgeColor = "bg-purple-950 text-purple-300 border-purple-800";
                    }

                    return (
                      <TableRow key={asg.id} className="border-[#374151] hover:bg-[#111827]/50">
                        <TableCell>
                          <div className="font-semibold text-white text-sm">
                            {new Date(asg.date).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-white flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-[#f59e0b]" />
                            {asg.personnel?.full_name || "-"}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f2937] text-gray-300">
                              {asg.personnel?.position || "Anggota"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">NIK: {asg.personnel?.nik}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-gray-200 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-400" />
                            {asg.site?.name || "-"}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{asg.site?.code}</div>
                        </TableCell>

                        <TableCell>
                          <Badge className={`${shiftBadgeColor} font-semibold`}>{shiftName}</Badge>
                          {asg.shift && (
                            <div className="text-xs text-gray-400 font-mono mt-1">
                              {asg.shift.start_time.substring(0, 5)} - {asg.shift.end_time.substring(0, 5)} WIB
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          {asg.status === "present" ? (
                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">
                              Hadir
                            </Badge>
                          ) : asg.status === "scheduled" ? (
                            <Badge className="bg-blue-950 text-blue-400 border-blue-800">
                              Terjadwal
                            </Badge>
                          ) : asg.status === "off" ? (
                            <Badge className="bg-gray-800 text-gray-400 border-gray-700">
                              Off / Libur
                            </Badge>
                          ) : (
                            <Badge className="bg-red-950 text-red-400 border-red-800">
                              {asg.status}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <DeleteAssignmentButton id={asg.id} />
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
