import { Metadata } from "next";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { getBalancedScorecard, type BSCMetric } from "../actions";
import { ReportPrintButton } from "../components/ReportPrintButton";
import {
  Target,
  DollarSign,
  Users2,
  Cpu,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Balanced Scorecard BUJP | Garda BUJP ERP",
  description: "Dashboard 4 Perspektif Kinerja Strategis Badan Usaha Jasa Pengamanan (RPT-08)",
};

export default async function BalancedScorecardPage() {
  const result = await getBalancedScorecard();
  const { data } = result;

  const renderMetricCard = (metric: BSCMetric) => {
    return (
      <div
        key={metric.title}
        className="p-4 rounded-xl bg-[#1f2937]/50 border border-[#374151] space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#f9fafb] leading-tight">
              {metric.title}
            </h4>
            <p className="text-[11px] text-[#9ca3af] mt-1">{metric.description}</p>
          </div>
          {metric.status === "on_track" && (
            <Badge className="bg-[#064e3b] text-[#34d399] border-[#10b981]/40 text-[10px] shrink-0">
              Tercapai
            </Badge>
          )}
          {metric.status === "warning" && (
            <Badge className="bg-[#78350f] text-[#fef08a] border-[#f59e0b]/40 text-[10px] shrink-0">
              Waspada
            </Badge>
          )}
          {metric.status === "critical" && (
            <Badge className="bg-[#7f1d1d] text-[#fca5a5] border-[#ef4444]/40 text-[10px] shrink-0">
              Kritis
            </Badge>
          )}
        </div>

        <div className="flex items-baseline justify-between text-xs pt-1">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#9ca3af] block">Realisasi</span>
            <span className="text-base font-black text-[#f9fafb] font-mono">{metric.actual}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#9ca3af] block">Target KPI</span>
            <span className="text-xs font-semibold text-[#9ca3af] font-mono">{metric.target}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#9ca3af]">
            <span>Pencapaian:</span>
            <span className="font-bold text-[#f9fafb]">{metric.achievementPct}%</span>
          </div>
          <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-[#374151]">
            <div
              className={`h-full rounded-full transition-all ${
                metric.achievementPct >= 100
                  ? "bg-[#10b981]"
                  : metric.achievementPct >= 75
                  ? "bg-[#f59e0b]"
                  : "bg-[#ef4444]"
              }`}
              style={{ width: `${Math.min(100, metric.achievementPct)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
            Balanced Scorecard Operasional BUJP (RPT-08)
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Matriks 4 Perspektif Kinerja Strategis Sesuai Regulasi Perpol No 1/2023 & Standar Manajemen Mabes Polri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReportPrintButton label="Cetak Scorecard BUJP" />
        </div>
      </div>

      {result.error && (
        <div className="p-4 bg-[#7f1d1d]/30 border border-[#ef4444] rounded-lg flex items-center gap-3 text-[#f87171] text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {/* Global Score Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#111827] border border-[#f59e0b]/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-xl text-[#f59e0b]">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f9fafb]">
              Indeks Kinerja Komprehensif BUJP
            </h3>
            <p className="text-xs text-[#9ca3af] mt-0.5 max-w-xl">
              Agregasi capaian seluruh perspektif (Keuangan, Kemitraan Klien, Kepatuhan Patroli & SOP Jaga, serta Kualifikasi Gada Personel).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs uppercase font-semibold text-[#9ca3af] block">Skor Kinerja Total</span>
            <span className="text-3xl font-black text-[#10b981] font-mono">
              {data.overallScore}%
            </span>
          </div>
          <Badge className="bg-[#064e3b] text-[#34d399] border-[#10b981]/50 text-xs px-3 py-1 font-bold">
            Grade A (Prima)
          </Badge>
        </div>
      </div>

      {/* 4 Perspectives Grid */}
      <div className="space-y-8">
        {/* 1. Perspektif Keuangan */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#374151] pb-2">
            <DollarSign className="h-5 w-5 text-[#34d399]" />
            <h3 className="text-sm sm:text-base font-bold text-[#f9fafb] uppercase tracking-wider">
              1. Perspektif Keuangan (Financial Perspective)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.financial.map((m) => renderMetricCard(m))}
          </div>
        </div>

        {/* 2. Perspektif Pelanggan */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#374151] pb-2">
            <Users2 className="h-5 w-5 text-[#60a5fa]" />
            <h3 className="text-sm sm:text-base font-bold text-[#f9fafb] uppercase tracking-wider">
              2. Perspektif Klien & Mitra (Customer Perspective)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.customer.map((m) => renderMetricCard(m))}
          </div>
        </div>

        {/* 3. Perspektif Proses Internal */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#374151] pb-2">
            <Cpu className="h-5 w-5 text-[#f59e0b]" />
            <h3 className="text-sm sm:text-base font-bold text-[#f9fafb] uppercase tracking-wider">
              3. Perspektif Proses Bisnis Internal (Internal Process Perspective)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.internalProcess.map((m) => renderMetricCard(m))}
          </div>
        </div>

        {/* 4. Perspektif Pembelajaran & Pertumbuhan */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#374151] pb-2">
            <GraduationCap className="h-5 w-5 text-[#c084fc]" />
            <h3 className="text-sm sm:text-base font-bold text-[#f9fafb] uppercase tracking-wider">
              4. Perspektif Pembelajaran & Pertumbuhan (Learning & Growth)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.learningGrowth.map((m) => renderMetricCard(m))}
          </div>
        </div>
      </div>
    </div>
  );
}
