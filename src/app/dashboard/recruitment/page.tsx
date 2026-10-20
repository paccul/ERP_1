import Link from "next/link";
import {
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Phone,
  Shield,
  FileCheck,
} from "lucide-react";
import { getApplicants } from "./actions";
import { getSites } from "../sites/actions";
import { RosterSubnav } from "@/components/layout/RosterSubnav";
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
import { NewApplicantModal } from "./components/NewApplicantModal";
import { UpdateStatusModal } from "./components/UpdateStatusModal";
import { ConvertApplicantModal } from "./components/ConvertApplicantModal";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const dynamic = "force-dynamic";

interface RecruitmentPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function RecruitmentPage({ searchParams }: RecruitmentPageProps) {
  const { allowed } = await requirePermission("recruitment", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Rekrutmen Calon Satpam (PSB)" />;
  }

  const params = await searchParams;
  const status = params.status || "all";
  const search = params.search || "";

  const [{ data: applicants, error }, { data: sites }] = await Promise.all([
    getApplicants({ status, search }),
    getSites(),
  ]);

  const totalApplicants = applicants.length;
  const newCount = applicants.filter((a) => a.status === "new").length;
  const inProgressCount = applicants.filter(
    (a) => a.status === "document_review" || a.status === "fitness_test" || a.status === "interview"
  ).length;
  const acceptedCount = applicants.filter((a) => a.status === "accepted").length;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <RosterSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-[#f59e0b]" />
            Rekrutmen Satpam Baru (PSB - Modul Penerimaan)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Pipeline seleksi berkas, tes kesamaptaan fisik, wawancara, dan konversi pelamar diterima menjadi personel aktif.
          </p>
        </div>
        <NewApplicantModal />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pelamar Terdata</CardTitle>
            <Users className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalApplicants}</div>
            <p className="text-xs text-gray-400 mt-1">Seluruh pipeline seleksi</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Berkas Masuk Baru</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{newCount}</div>
            <p className="text-xs text-gray-400 mt-1">Belum diproses seleksi</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tahap Uji Fisik & Wawancara</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{inProgressCount}</div>
            <p className="text-xs text-gray-400 mt-1">Sedang proses uji samapta</p>
          </CardContent>
        </Card>

        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Lulus / Siap Penempatan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{acceptedCount}</div>
            <p className="text-xs text-gray-400 mt-1">Dapat dikonversi ke Personel</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4 space-y-3">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Cari nama pelamar, NIK, atau no telepon..."
                className="pl-9 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
              />
            </div>
            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827]">
              Cari Pelamar
            </Button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#374151]">
            {[
              { label: "Semua", val: "all" },
              { label: "1. Berkas Baru", val: "new" },
              { label: "2. Seleksi Dokumen", val: "document_review" },
              { label: "3. Tes Fisik (Samapta)", val: "fitness_test" },
              { label: "4. Wawancara", val: "interview" },
              { label: "5. Lulus Diterima", val: "accepted" },
              { label: "6. Ditolak", val: "rejected" },
            ].map((tab) => (
              <Link
                key={tab.val}
                href={`/dashboard/recruitment?status=${tab.val}${search ? `&search=${search}` : ""}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  status === tab.val
                    ? "bg-[#1f2937] text-[#f59e0b] border border-[#f59e0b]/40 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-[#111827]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada pelamar pada tahapan ini</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Daftarkan kandidat pelamar satpam baru untuk memulai proses seleksi.
              </p>
              <NewApplicantModal />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="text-gray-300">Nama & NIK Pelamar</TableHead>
                    <TableHead className="text-gray-300">Kontak</TableHead>
                    <TableHead className="text-gray-300">Sertifikasi Gada</TableHead>
                    <TableHead className="text-gray-300">Nilai Tes Fisik</TableHead>
                    <TableHead className="text-gray-300">Status Seleksi</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi & Konversi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((app) => {
                    let statusBadge = (
                      <Badge className="bg-gray-800 text-gray-300">Berkas Baru</Badge>
                    );
                    if (app.status === "document_review") {
                      statusBadge = (
                        <Badge className="bg-blue-950 text-blue-300 border-blue-800">
                          Review Dokumen
                        </Badge>
                      );
                    } else if (app.status === "fitness_test") {
                      statusBadge = (
                        <Badge className="bg-amber-950 text-amber-300 border-amber-800">
                          Uji Samapta
                        </Badge>
                      );
                    } else if (app.status === "interview") {
                      statusBadge = (
                        <Badge className="bg-purple-950 text-purple-300 border-purple-800">
                          Wawancara
                        </Badge>
                      );
                    } else if (app.status === "accepted") {
                      statusBadge = (
                        <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800">
                          Lulus Diterima
                        </Badge>
                      );
                    } else if (app.status === "rejected") {
                      statusBadge = (
                        <Badge className="bg-red-950 text-red-400 border-red-800">
                          Ditolak
                        </Badge>
                      );
                    }

                    return (
                      <TableRow key={app.id} className="border-[#374151] hover:bg-[#111827]/50">
                        <TableCell>
                          <div className="font-semibold text-white">{app.full_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            NIK: {app.nik} • {app.gender}
                          </div>
                          {app.notes && (
                            <div className="text-[11px] text-gray-400 italic mt-1 line-clamp-1">
                              &ldquo;{app.notes}&rdquo;
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-gray-300 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-[#f59e0b]" />
                            {app.phone}
                          </div>
                          {app.email && (
                            <div className="text-[11px] text-gray-500 mt-0.5">{app.email}</div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge className="bg-[#1f2937] text-gray-300 border-[#374151]">
                            {app.gada_level || "Belum Ada"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {app.score !== null ? (
                            <span className="font-mono text-sm font-bold text-white flex items-center gap-1">
                              <Award className="h-3.5 w-3.5 text-amber-400" />
                              {app.score} / 100
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Belum diuji</span>
                          )}
                        </TableCell>

                        <TableCell>{statusBadge}</TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <UpdateStatusModal applicant={app} />

                            {app.status === "accepted" && !app.converted_to_personnel_id && (
                              <ConvertApplicantModal
                                applicantId={app.id}
                                applicantName={app.full_name}
                                sitesList={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
                              />
                            )}

                            {app.converted_to_personnel_id && (
                              <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px]">
                                Telah Menjadi Personel
                              </Badge>
                            )}
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
