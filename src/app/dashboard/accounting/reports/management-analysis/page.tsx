import { Metadata } from "next";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { getManagementAnalysis } from "../actions";
import { ReportPrintButton } from "../components/ReportPrintButton";
import {
  Building2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Analisa Profitabilitas Pos Jaga | Garda BUJP ERP",
  description: "Analisa akuntansi manajemen laba kotor margin per lokasi pos jaga satpam (RPT-07)",
};

export default async function ManagementAnalysisPage() {
  const result = await getManagementAnalysis();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const { summary, records } = result;

  return (
    <div className="space-y-6">
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
            Analisa Manajemen Profitabilitas Pos Jaga (RPT-07)
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Evaluasi margin laba kotor per lokasi site mitra berdasarkan perbandingan penagihan (billing), biaya gaji personel, dan alokasi seragam/kaporlap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReportPrintButton label="Cetak Analisa Pos Jaga" />
        </div>
      </div>

      {result.error && (
        <div className="p-4 bg-[#7f1d1d]/30 border border-[#ef4444] rounded-lg flex items-center gap-3 text-[#f87171] text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-1">
          <div className="flex items-center justify-between text-[#9ca3af]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pos Jaga (Site)</span>
            <Building2 className="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f9fafb]">{summary.totalSites} Pos</div>
          <p className="text-[11px] text-[#9ca3af]">Lokasi pengamanan aktif</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-1">
          <div className="flex items-center justify-between text-[#9ca3af]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendapatan Tagihan Site</span>
            <DollarSign className="h-4 w-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-black text-[#34d399] font-mono">
            {formatRupiah(summary.totalRevenue)}
          </div>
          <p className="text-[11px] text-[#9ca3af]">Realisasi billing kontrak jasa satpam</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-1">
          <div className="flex items-center justify-between text-[#9ca3af]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Beban Langsung</span>
            <Briefcase className="h-4 w-4 text-[#fca5a5]" />
          </div>
          <div className="text-2xl font-black text-[#fca5a5] font-mono">
            {formatRupiah(summary.totalDirectCosts)}
          </div>
          <p className="text-[11px] text-[#9ca3af]">Gaji personel jaga + logistik seragam</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-1">
          <div className="flex items-center justify-between text-[#9ca3af]">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-rata Gross Margin</span>
            <TrendingUp className="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f59e0b] font-mono">
            {summary.averageMarginPct.toFixed(1)}%
          </div>
          <p className="text-[11px] text-[#9ca3af]">Laba kotor: {formatRupiah(summary.totalGrossMarginRp)}</p>
        </div>
      </div>

      {/* Main Table of Site Profitability */}
      <div className="border border-[#374151] rounded-xl overflow-hidden bg-[#111827]">
        <div className="p-4 border-b border-[#374151] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#f9fafb] uppercase tracking-wider">
            Tabel Profitabilitas Job-Order per Lokasi Pengamanan
          </h3>
          <span className="text-xs text-[#9ca3af]">Periode: {result.period}</span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead className="bg-[#1f2937] text-[#9ca3af] font-semibold text-[11px] uppercase tracking-wider border-b border-[#374151]">
              <tr>
                <th className="py-3 px-4">LOKASI POS JAGA / KLIEN</th>
                <th className="py-3 px-4 text-center">KUOTA / PLOTTING</th>
                <th className="py-3 px-4 text-right">TARIF BILLING</th>
                <th className="py-3 px-4 text-right">PENDAPATAN (A)</th>
                <th className="py-3 px-4 text-right">BEBAN GAJI (B1)</th>
                <th className="py-3 px-4 text-right">LOGISTIK (B2)</th>
                <th className="py-3 px-4 text-right">LABA KOTOR (A - B)</th>
                <th className="py-3 px-4 text-center">MARGIN %</th>
                <th className="py-3 px-4 text-center">EVALUASI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.siteId} className="hover:bg-[#1f2937]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#f9fafb]">{row.siteName}</div>
                      <div className="text-xs text-[#9ca3af] flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-[#f59e0b]" />
                        {row.clientName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1f2937] text-[#d1d5db] border border-[#374151]">
                        <Users className="h-3 w-3 text-[#f59e0b]" />
                        {row.actualGuards} / {row.requiredGuards} Satpam
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#d1d5db]">
                      {formatRupiah(row.billingRatePerGuard)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#34d399]">
                      {formatRupiah(row.monthlyRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#fca5a5]">
                      {formatRupiah(row.personnelCosts)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#fca5a5]">
                      {formatRupiah(row.logisticsCosts)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-[#f59e0b]">
                      {formatRupiah(row.grossMarginRp)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                      <span
                        className={
                          row.grossMarginPct >= 25
                            ? "text-[#34d399]"
                            : row.grossMarginPct >= 15
                            ? "text-[#fef08a]"
                            : "text-[#f87171]"
                        }
                      >
                        {row.grossMarginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.statusRecommendation === "high_profit" && (
                        <Badge className="bg-[#064e3b] text-[#34d399] border-[#10b981]/40 text-[11px] font-semibold">
                          Sangat Untung
                        </Badge>
                      )}
                      {row.statusRecommendation === "optimal" && (
                        <Badge className="bg-[#1f2937] text-[#fef08a] border-[#fef08a]/40 text-[11px] font-semibold">
                          Optimal
                        </Badge>
                      )}
                      {row.statusRecommendation === "underperforming" && (
                        <Badge className="bg-[#7f1d1d] text-[#fca5a5] border-[#ef4444]/40 text-[11px] font-semibold">
                          Evaluasi Tarif
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#9ca3af] italic">
                    Belum ada data pos jaga yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot className="bg-[#1f2937] font-bold text-xs sm:text-sm border-t-2 border-[#374151]">
                <tr>
                  <td className="py-3 px-4 text-[#f9fafb]" colSpan={3}>
                    TOTAL KONSOLIDASI SELURUH POS JAGA
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#34d399]">
                    {formatRupiah(summary.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#fca5a5]" colSpan={2}>
                    {formatRupiah(summary.totalDirectCosts)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#f59e0b]">
                    {formatRupiah(summary.totalGrossMarginRp)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[#f59e0b]">
                    {summary.averageMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className="bg-[#1f2937] text-[#f59e0b] border-[#f59e0b]/40 text-[10px]">
                      Margin Optimal
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
