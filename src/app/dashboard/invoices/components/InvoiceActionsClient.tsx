"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { issueInvoice, markInvoicePaid } from "@/app/dashboard/invoices/actions";

interface InvoiceActionsClientProps {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
}

export function InvoiceActionsClient({
  invoiceId,
  invoiceNumber,
  status,
}: InvoiceActionsClientProps) {
  const [loading, setLoading] = useState(false);

  const handleIssue = async () => {
    if (
      !confirm(
        `Terbitkan faktur ${invoiceNumber}? Sistem akan otomatis membuat Jurnal Piutang Usaha vs Pendapatan Jasa Satpam & PPN Keluaran.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await issueInvoice(invoiceId);
      if (!res.success) {
        alert(res.error || "Gagal menerbitkan faktur");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (
      !confirm(
        `Tandai lunas faktur ${invoiceNumber}? Sistem akan memposting jurnal penerimaan Kas/Bank dan melunasi piutang klien.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await markInvoicePaid(invoiceId);
      if (!res.success) {
        alert(res.error || "Gagal menandai lunas");
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
        onClick={handleIssue}
        className="h-8 px-2 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/10"
        title="Terbitkan & Posting Jurnal"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-1" />
        )}
        Terbitkan
      </Button>
    );
  }

  if (status === "issued") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleMarkPaid}
        className="h-8 px-2 border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/10"
        title="Tandai Pembayaran Lunas"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-1" />
        )}
        Set Lunas
      </Button>
    );
  }

  return null;
}
