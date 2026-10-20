import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Shield,
  FileText,
  Phone,
  Mail,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { getApplicantById } from "@/app/dashboard/recruitment/actions";
import { getSites } from "@/app/dashboard/sites/actions";
import { RosterSubnav } from "@/components/layout/RosterSubnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UpdateStatusModal } from "@/app/dashboard/recruitment/components/UpdateStatusModal";
import { ConvertApplicantModal } from "@/app/dashboard/recruitment/components/ConvertApplicantModal";

interface ApplicantDetailViewProps {
  id?: string;
}

export async function ApplicantDetailView({ id = "14" }: ApplicantDetailViewProps) {
  const [{ data: applicant }, { data: sites }] = await Promise.all([
    getApplicantById(id),
    getSites(),
  ]);

  if (!applicant) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-lg font-bold text-white">Data Pelamar Tidak Ditemukan</h2>
        <p className="mt-1 text-sm text-[#9ca3af]">
          ID pelamar tersebut tidak terdaftar di sistem seleksi PSB.
        </p>
        <div className="mt-6">
          <Link href="/psb/admin/applicants">
            <Button variant="outline" className="border-[#374151] bg-[#111827] text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Pelamar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Pelamar Baru</Badge>;
      case "seleksi_berkas":
        return <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">Seleksi Berkas</Badge>;
      case "tes_fisik_kesamaptaan":
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Tes Kesamaptaan</Badge>;
      case "wawancara":
        return <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Wawancara</Badge>;
      case "diterima":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Diterima (Lolos)</Badge>;
      case "ditolak":
        return <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30">Tidak Lolos</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <RosterSubnav />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#374151] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/psb/admin/applicants">
              <Button variant="ghost" size="sm" className="text-[#9ca3af] hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke PSB
              </Button>
            </Link>
            <span className="text-xs text-[#6b7280]">/</span>
            <span className="text-xs text-[#9ca3af]">Verifikasi Berkas & Nilai Seleksi</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-black tracking-tight text-white">{applicant.full_name}</h1>
            {getStatusBadge(applicant.status)}
          </div>
          <p className="text-xs text-[#9ca3af] mt-1">
            NIK: {applicant.nik} · Terdaftar sejak{" "}
            {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString("id-ID", { dateStyle: "long" }) : "-"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UpdateStatusModal applicant={applicant} />
          {applicant.status === "diterima" && (
            <ConvertApplicantModal
              applicantId={applicant.id}
              applicantName={applicant.full_name}
              sitesList={(sites || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                code: s.code || s.name,
              }))}
            />
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profil & Kontak */}
        <div className="space-y-6">
          <Card className="border-[#374151] bg-[#030712] text-white">
            <CardHeader className="pb-3 border-b border-[#1f2937]">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-500" />
                Data Pribadi & Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-[#9ca3af] block">Nama Lengkap</span>
                <span className="font-semibold text-white">{applicant.full_name}</span>
              </div>
              <div>
                <span className="text-[#9ca3af] block">Nomor Induk Kependudukan (NIK)</span>
                <span className="font-mono text-white">{applicant.nik}</span>
              </div>
              <div>
                <span className="text-[#9ca3af] block">Nomor Telepon / WhatsApp</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-white">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{applicant.phone || "-"}</span>
                </div>
              </div>
              <div>
                <span className="text-[#9ca3af] block">Alamat Email</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-white">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  <span>{applicant.email || "-"}</span>
                </div>
              </div>
              <div>
                <span className="text-[#9ca3af] block">Nilai Ujian / Tes Seleksi</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">
                    {applicant.score !== null ? `${applicant.score} / 100` : "Belum Dinilai"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#374151] bg-[#030712] text-white">
            <CardHeader className="pb-3 border-b border-[#1f2937]">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Catatan Seleksi Rekruter
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-[#d1d5db]">
              <p className="whitespace-pre-line leading-relaxed">
                {applicant.notes || "Belum ada catatan khusus dari tim penilai rekrutmen."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Center & Right Column: Verifikasi Berkas & Persyaratan Standar Polri */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#374151] bg-[#030712] text-white">
            <CardHeader className="pb-3 border-b border-[#1f2937]">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-emerald-400" />
                  Verifikasi Dokumen & Kualifikasi Satpam
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  Terverifikasi Tim HR
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-[#9ca3af]">
                Pemeriksaan kepatuhan Perpol No. 4 Tahun 2020 tentang Pam Swakarsa
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#374151] bg-[#111827] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">1. KTP Elektronik</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Status KTP Asli & Sesuai Dukcapil</p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-2">VALID ({applicant.nik})</p>
                </div>

                <div className="rounded-xl border border-[#374151] bg-[#111827] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">2. SKCK Mabes / Polres</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Bebas Catatan Kriminal Polri</p>
                  <p className="text-[11px] text-emerald-400 mt-2">Masa Berlaku Aktif</p>
                </div>

                <div className="rounded-xl border border-[#374151] bg-[#111827] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">3. Ijazah Pendidikan Formal</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Minimal SMA / SMK Sederajat</p>
                  <p className="text-[11px] text-emerald-400 mt-2">Ijazah Terverifikasi</p>
                </div>

                <div className="rounded-xl border border-[#374151] bg-[#111827] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">4. Ijazah / Sertifikasi Gada</span>
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1">Gada Pratama / Madya Polri</p>
                  <p className="text-[11px] text-amber-400 mt-2">Pratama - Siap Penempatan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hasil Penilaian Kesamaptaan & Fisik */}
          <Card className="border-[#374151] bg-[#030712] text-white">
            <CardHeader className="pb-3 border-b border-[#1f2937]">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                Hasil Uji Fisik Kesamaptaan & Standar Postur
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#111827] border border-[#374151]">
                  <span className="text-[11px] text-[#9ca3af] block">Tinggi Badan</span>
                  <span className="text-base font-bold text-white mt-1 block">172 cm</span>
                  <span className="text-[10px] text-emerald-400">Memenuhi Syarat</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#374151]">
                  <span className="text-[11px] text-[#9ca3af] block">Berat Badan</span>
                  <span className="text-base font-bold text-white mt-1 block">68 kg</span>
                  <span className="text-[10px] text-emerald-400">Ideal (BMI 23)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#374151]">
                  <span className="text-[11px] text-[#9ca3af] block">Lari 12 Menit</span>
                  <span className="text-base font-bold text-white mt-1 block">2.400 m</span>
                  <span className="text-[10px] text-emerald-400">Nilai A (Baik)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#374151]">
                  <span className="text-[11px] text-[#9ca3af] block">Bebas Narkoba</span>
                  <span className="text-base font-bold text-white mt-1 block">Negatif</span>
                  <span className="text-[10px] text-emerald-400">Surat Bebas Narkoba</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
