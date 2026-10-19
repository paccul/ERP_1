"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportPrintButton({ label = "Cetak Laporan SAK" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.print()}
      className="border-[#374151] hover:bg-[#1f2937] text-[#f9fafb] text-xs sm:text-sm font-medium flex items-center gap-2"
    >
      <Printer className="h-4 w-4 text-[#f59e0b]" />
      {label}
    </Button>
  );
}
