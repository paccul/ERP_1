"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveBko, rejectBko } from "../actions";

interface BkoActionButtonsProps {
  requestId: string;
  personnelName: string;
  targetSiteName: string;
}

export function BkoActionButtons({
  requestId,
  personnelName,
  targetSiteName,
}: BkoActionButtonsProps) {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const handleApprove = async () => {
    const confirmed = window.confirm(
      `Setujui penugasan BKO untuk ${personnelName} ke ${targetSiteName}? Tindakan ini akan secara atomik memutakhirkan jadwal jaga di pos tujuan.`
    );
    if (!confirmed) return;

    setLoadingApprove(true);
    try {
      const res = await approveBko(requestId);
      if (!res.success) {
        alert(res.error || "Gagal menyetujui BKO");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menyetujui BKO");
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Masukkan alasan penolakan BKO:");
    if (reason === null) return;

    setLoadingReject(true);
    try {
      const res = await rejectBko(requestId, reason);
      if (!res.success) {
        alert(res.error || "Gagal menolak BKO");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menolak BKO");
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={loadingApprove || loadingReject}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
      >
        {loadingApprove ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Setujui BKO
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={loadingApprove || loadingReject}
        className="border-red-900/40 text-red-400 hover:bg-red-950/40 text-xs"
      >
        {loadingReject ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Tolak
          </>
        )}
      </Button>
    </div>
  );
}
