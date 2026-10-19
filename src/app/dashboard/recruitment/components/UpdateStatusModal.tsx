"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileEdit, X, Save, Loader2, Award } from "lucide-react";
import { updateApplicantStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/types/database.types";

interface UpdateStatusModalProps {
  applicant: Tables<"applicants">;
}

export function UpdateStatusModal({ applicant }: UpdateStatusModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(applicant.status);
  const [score, setScore] = useState<string>(applicant.score !== null ? String(applicant.score) : "");
  const [notes, setNotes] = useState(applicant.notes || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const parsedScore = score.trim() === "" ? null : parseFloat(score);
      const res = await updateApplicantStatus(applicant.id, status, parsedScore, notes);

      if (!res.success) {
        setError(res.error || "Gagal memperbarui status pelamar");
        setSubmitting(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan sistem saat memperbarui status");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-[#374151] text-gray-300 hover:bg-[#1f2937] text-xs"
      >
        <FileEdit className="h-3.5 w-3.5 mr-1" />
        Review / Nilai
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#374151] bg-[#030712] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#f59e0b]" />
                Verifikasi & Nilai Seleksi (PSB-02)
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              {error && (
                <div className="p-3 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-white">{applicant.full_name}</p>
                <p className="text-xs text-gray-400">
                  NIK: {applicant.nik} • Kualifikasi: {applicant.gada_level || "Belum Ada"}
                </p>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-300">
                  Tahapan Status Seleksi
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <option value="new">1. Berkas Baru (New)</option>
                  <option value="document_review">2. Seleksi Dokumen & SKCK</option>
                  <option value="fitness_test">3. Tes Kesamaptaan / Fisik</option>
                  <option value="interview">4. Wawancara Psikotes</option>
                  <option value="accepted">5. Diterima (Accepted - Siap Penempatan)</option>
                  <option value="rejected">6. Ditolak (Rejected)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="score" className="text-gray-300">
                  Nilai Kesamaptaan / Tes (0 - 100)
                </Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="Contoh: 85.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-gray-300">
                  Catatan Review Tim Rekrutmen
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Catatan postur fisik, verifikasi KTP/SKCK, atau kesiapan dinas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 flex w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
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
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Simpan Penilaian
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
