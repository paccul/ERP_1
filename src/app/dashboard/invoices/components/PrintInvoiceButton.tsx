"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="border-[#374151] hover:bg-[#1f2937] text-[#f9fafb]"
    >
      <Printer className="h-4 w-4 mr-2 text-[#f59e0b]" />
      Cetak Faktur PDF
    </Button>
  );
}
