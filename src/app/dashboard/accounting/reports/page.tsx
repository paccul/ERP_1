import { Metadata } from "next";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { getFinancialStatements } from "./actions";
import { FinancialStatementsClient } from "./components/FinancialStatementsClient";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Laporan Keuangan SAK | Garda BUJP ERP",
  description: "Laporan Posisi Keuangan (Neraca), Laba Rugi, Perubahan Ekuitas, dan Arus Kas BUJP",
};

export default async function FinancialReportsPage() {
  const result = await getFinancialStatements(2026, 10);

  return (
    <div className="space-y-6">
      <AccountingSubnav />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Laporan Keuangan Standar Akuntansi (SAK)
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Laporan Posisi Keuangan (Neraca), Kinerja Usaha (Laba Rugi), Mutasi Ekuitas, dan Rekonsiliasi Arus Kas terintegrasi jurnal operasional BUJP.
        </p>
      </div>

      {result.error && (
        <div className="p-4 bg-[#7f1d1d]/30 border border-[#ef4444] rounded-lg flex items-center gap-3 text-[#f87171] text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {/* Interactive Tabs */}
      <FinancialStatementsClient data={result} />
    </div>
  );
}
