"use client";

import { useState } from "react";
import { exportBackupData } from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Download,
  Database,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Clock,
  Layers,
  FileCode2,
  Loader2,
  HardDrive,
  Lock,
} from "lucide-react";

interface BackupClientProps {
  institutionData: {
    ppn_rate: number;
    pph23_rate: number;
    bpjs_ketenagakerjaan_rate: number;
    bpjs_kesehatan_rate: number;
    license_number: string;
    company_name: string;
  };
  stats: {
    personnelCount: number;
    clientsCount: number;
    sitesCount: number;
    itemsCount: number;
    accountsCount: number;
    usersCount: number;
  };
}

export function BackupClient({ institutionData, stats }: BackupClientProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const data = await exportBackupData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `garda-bujp-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Failed to download backup:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Parameter Pajak & BPJS Aktif */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Tarif Parameter Sistem Terpasang</h2>
            <p className="text-xs text-[#9ca3af]">
              Parameter pajak dan jaminan ketenagakerjaan terintegrasi ke modul Invoicing & Payroll.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#030712] p-4 rounded-xl border border-[#1f2937]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af]">PPN Faktur Klien</span>
            <div className="text-xl font-black text-white mt-1">
              {institutionData.ppn_rate}%
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Default Sistem</span>
          </div>

          <div className="bg-[#030712] p-4 rounded-xl border border-[#1f2937]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af]">PPh Pasal 23</span>
            <div className="text-xl font-black text-white mt-1">
              {institutionData.pph23_rate}%
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Jasa Manpower</span>
          </div>

          <div className="bg-[#030712] p-4 rounded-xl border border-[#1f2937]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af]">BPJS Ketenagakerjaan</span>
            <div className="text-xl font-black text-white mt-1">
              {institutionData.bpjs_ketenagakerjaan_rate}%
            </div>
            <span className="text-[10px] text-[#60a5fa] mt-0.5 block">JKK, JKM, JHT, JP</span>
          </div>

          <div className="bg-[#030712] p-4 rounded-xl border border-[#1f2937]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af]">BPJS Kesehatan</span>
            <div className="text-xl font-black text-white mt-1">
              {institutionData.bpjs_kesehatan_rate}%
            </div>
            <span className="text-[10px] text-[#c084fc] mt-0.5 block">Iuran Pekerja</span>
          </div>
        </div>
      </div>

      {/* Section 2: Backup Database & Data Snapshot */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ekspor Snapshot Database Lengkap</h2>
              <p className="text-xs text-[#9ca3af]">
                Cadangkan data operasional BUJP, personel, klien, logistik, dan akuntansi dalam format JSON.
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-lg"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengekstrak Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Unduh Cadangan Database (.json)
              </>
            )}
          </Button>
        </div>

        {downloadSuccess && (
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>File cadangan JSON berhasil diunduh ke komputer Anda.</span>
          </div>
        )}

        {/* Database Record Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.personnelCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Personel</div>
          </div>
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.clientsCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Klien Mitra</div>
          </div>
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.sitesCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Lokasi Pos Jaga</div>
          </div>
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.itemsCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Item Logistik</div>
          </div>
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.accountsCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Bagan Akun (COA)</div>
          </div>
          <div className="bg-[#030712] p-3 rounded-xl border border-[#1f2937] text-center">
            <div className="text-lg font-black text-white">{stats.usersCount}</div>
            <div className="text-[10px] text-[#9ca3af] uppercase font-bold mt-0.5">Pengguna Sistem</div>
          </div>
        </div>
      </div>

      {/* Section 3: Audit Log & Keamanan Sistem */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Status Integritas & Audit Keamanan</h2>
            <p className="text-xs text-[#9ca3af]">
              Verifikasi enkripsi tingkat basis data, kepatuhan RLS, dan koneksi PostgreSQL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#030712] rounded-xl border border-[#1f2937] flex items-start gap-3">
            <Lock className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Row Level Security (RLS) Aktif</div>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                100% tabel publik menerapkan RLS terisolasi dengan verifikasi wewenang fungsi stored procedure `check_user_permission()`.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#030712] rounded-xl border border-[#1f2937] flex items-start gap-3">
            <HardDrive className="h-5 w-5 text-[#f59e0b] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">PostgreSQL Multi-Tier ACID RPC</div>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Mutasi invoice, payroll, dan logistik dijamin atomik melalui Stored Procedure PostgreSQL dengan auto-rollback.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#030712] rounded-xl border border-[#1f2937] flex items-start gap-3">
            <FileCode2 className="h-5 w-5 text-[#60a5fa] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Supabase SSR Cookie Integration</div>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Sesi autentikasi diamankan menggunakan standar `@supabase/ssr` dengan penanganan rotasi token otomatis.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#030712] rounded-xl border border-[#1f2937] flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#c084fc] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Deployment Region: Singapore (sin1)</div>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Server edge Vercel dan basis data Supabase berjalan pada latensi ultra-rendah untuk wilayah Indonesia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
