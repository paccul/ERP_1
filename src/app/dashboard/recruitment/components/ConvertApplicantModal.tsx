"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, X, Save, Loader2, ShieldCheck, MapPin } from "lucide-react";
import { convertApplicant } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConvertApplicantModalProps {
  applicantId: string;
  applicantName: string;
  sitesList: Array<{ id: string; name: string; code: string }>;
}

export function ConvertApplicantModal({
  applicantId,
  applicantName,
  sitesList,
}: ConvertApplicantModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [position, setPosition] = useState("Anggota");
  const [siteId, setSiteId] = useState(sitesList[0]?.id || "");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await convertApplicant(applicantId, {
        position,
        current_site_id: siteId || null,
        join_date: joinDate,
      });

      if (!res.success) {
        setError(res.error || "Gagal mengonversi kandidat menjadi personel");
        setSubmitting(false);
        return;
      }

      setOpen(false);
      router.push("/dashboard/personnel");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan sistem saat konversi");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
      >
        <UserCheck className="h-3.5 w-3.5 mr-1" />
        Konversi ke Satpam (RPC)
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Konversi Pelamar ke Personel Satpam
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConvert} className="space-y-4 pt-4">
              {error && (
                <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="p-3 rounded bg-[#111827] border border-[#374151] text-xs text-gray-300">
                Data identitas, NIK, kontak, dan sertifikasi Gada dari pelamar{" "}
                <span className="font-semibold text-white">{applicantName}</span> akan otomatis
                disalin ke tabel master <span className="text-[#f59e0b]">personnel</span> secara atomik via RPC.
              </div>

              <div>
                <Label htmlFor="position" className="text-gray-300">
                  Jabatan / Penugasan Pertama
                </Label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="Anggota">Anggota Regu Satpam</option>
                  <option value="Danru">Komandan Regu (Danru)</option>
                  <option value="Chief Security">Chief Security</option>
                  <option value="Koordinator Lapangan">Koordinator Lapangan (Korlap)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="siteId" className="text-gray-300">
                  Penempatan Pos Jaga Pertama (Site)
                </Label>
                <select
                  id="siteId"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="">Belum Ditentukan (Cadangan Pool)</option>
                  {sitesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="joinDate" className="text-gray-300">
                  Tanggal Efektif Bergabung
                </Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374151]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[#374151] text-gray-300 hover:bg-[#111827]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Eksekusi Konversi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
