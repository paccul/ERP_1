"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postPayrollRun } from "@/app/dashboard/payroll/actions";

interface PayrollActionsClientProps {
  payrollRunId: string;
  periodMonth: string;
  status: string;
}

export function PayrollActionsClient({
  payrollRunId,
  periodMonth,
  status,
}: PayrollActionsClientProps) {
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (
      !confirm(
        `Posting beban penggajian periode ${periodMonth} ke jurnal umum? Sistem akan mencatat Beban Gaji Satpam (51100), Utang Gaji Netto (21100), dan Utang BPJS (21200).`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await postPayrollRun(payrollRunId);
      if (!res.success) {
        alert(res.error || "Gagal memposting penggajian");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (status === "draft") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handlePost}
        className="h-8 px-2 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/10"
        title="Posting Penggajian ke Jurnal"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-1" />
        )}
        Posting Jurnal
      </Button>
    );
  }

  return null;
}
