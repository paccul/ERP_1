"use client";

import { useState } from "react";
import {
  Scale,
  TrendingUp,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { ReportPrintButton } from "./ReportPrintButton";
import type { FinancialStatementsResult } from "../actions";

export function FinancialStatementsClient({ data }: { data: FinancialStatementsResult }) {
  const [activeTab, setActiveTab] = useState<"balance-sheet" | "income-statement" | "equity-change" | "cash-flow">(
    "balance-sheet"
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const { balanceSheet, incomeStatement, equityChange, cashFlow } = data;

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Print Control */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 border-b border-[#374151] pb-4">
        <div className="flex flex-wrap items-center gap-2 w-full max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("balance-sheet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "balance-sheet"
                ? "bg-[#f59e0b] text-[#000000] shadow-md"
                : "bg-[#111827] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]"
            }`}
          >
            <Scale className="h-4 w-4" />
            Neraca (Posisi Keuangan)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income-statement")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "income-statement"
                ? "bg-[#f59e0b] text-[#000000] shadow-md"
                : "bg-[#111827] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Laba Rugi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("equity-change")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "equity-change"
                ? "bg-[#f59e0b] text-[#000000] shadow-md"
                : "bg-[#111827] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]"
            }`}
          >
            <Coins className="h-4 w-4" />
            Perubahan Ekuitas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cash-flow")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "cash-flow"
                ? "bg-[#f59e0b] text-[#000000] shadow-md"
                : "bg-[#111827] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1f2937]"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Arus Kas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ReportPrintButton label="Cetak Laporan SAK" />
        </div>
      </div>

      {/* Main Document Body (Clean Printable Layout) */}
      <div className="bg-[#111827] border border-[#374151] rounded-xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Document Letterhead */}
        <div className="border-b border-[#374151] pb-6 text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#f9fafb] tracking-wide uppercase">
            PT Garda BUJP Utama Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af]">
            Sistem Akuntansi Keuangan BUJP Sesuai Standar Akuntansi Keuangan (SAK)
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-[#1f2937] border border-[#374151] text-[#f59e0b] text-xs font-bold rounded-full uppercase tracking-wider">
              {activeTab === "balance-sheet" && "Laporan Posisi Keuangan (Neraca) — RPT-03"}
              {activeTab === "income-statement" && "Laporan Laba Rugi Komprehensif — RPT-04"}
              {activeTab === "equity-change" && "Laporan Perubahan Ekuitas — RPT-05"}
              {activeTab === "cash-flow" && "Laporan Arus Kas (Metode Tidak Langsung) — RPT-06"}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af] pt-1">
            Periode Berjalan: <span className="text-[#f9fafb] font-medium">Per 18 Oktober 2026</span>
          </p>
        </div>

        {/* 1. NERACA (BALANCE SHEET) */}
        {activeTab === "balance-sheet" && (
          <div className="space-y-6">
            {/* Balance Status Banner */}
            <div
              className={`p-4 rounded-lg flex items-center justify-between border ${
                balanceSheet.isBalanced
                  ? "bg-[#064e3b]/20 border-[#10b981]/40 text-[#34d399]"
                  : "bg-[#7f1d1d]/20 border-[#ef4444]/40 text-[#f87171]"
              }`}
            >
              <div className="flex items-center gap-3">
                {balanceSheet.isBalanced ? (
                  <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {balanceSheet.isBalanced
                      ? "Neraca Seimbang (Balanced) SAK"
                      : "Peringatan: Terdapat Selisih Neraca"}
                  </h4>
                  <p className="text-xs text-[#9ca3af]">
                    Total Aset = Liabilitas + Ekuitas (Prinsip Persamaan Akuntansi Double-Entry)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase block">Selisih (Variance)</span>
                <span className="text-sm font-bold font-mono">
                  {formatRupiah(balanceSheet.variance)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Kolom Kiri: ASET */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2 mb-3">
                    A. Aset Lancar
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.currentAssets.map((acc) => (
                      <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]/50">
                        <span className="text-[#d1d5db]">
                          <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                          {acc.name}
                        </span>
                        <span className="font-mono font-medium text-[#f9fafb]">
                          {formatRupiah(acc.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t border-[#374151] text-[#93c5fd]">
                      <span>Total Aset Lancar</span>
                      <span className="font-mono">{formatRupiah(balanceSheet.totalCurrentAssets)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2 mb-3">
                    B. Aset Tetap
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.fixedAssets.length > 0 ? (
                      balanceSheet.fixedAssets.map((acc) => (
                        <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]/50">
                          <span className="text-[#d1d5db]">
                            <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                            {acc.name}
                          </span>
                          <span className="font-mono font-medium text-[#f9fafb]">
                            {formatRupiah(acc.balance)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#9ca3af] italic py-1">Belum ada mutasi perolehan aset tetap.</p>
                    )}
                    <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t border-[#374151] text-[#93c5fd]">
                      <span>Total Aset Tetap</span>
                      <span className="font-mono">{formatRupiah(balanceSheet.totalFixedAssets)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#1f2937] border border-[#374151] rounded-lg flex justify-between items-center text-sm sm:text-base font-black text-[#10b981]">
                  <span>TOTAL ASET</span>
                  <span className="font-mono">{formatRupiah(balanceSheet.totalAssets)}</span>
                </div>
              </div>

              {/* Kolom Kanan: LIABILITAS & EKUITAS */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2 mb-3">
                    C. Liabilitas Jangka Pendek
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.currentLiabilities.map((acc) => (
                      <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]/50">
                        <span className="text-[#d1d5db]">
                          <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                          {acc.name}
                        </span>
                        <span className="font-mono font-medium text-[#f9fafb]">
                          {formatRupiah(acc.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t border-[#374151] text-[#fca5a5]">
                      <span>Total Liabilitas</span>
                      <span className="font-mono">{formatRupiah(balanceSheet.totalCurrentLiabilities)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2 mb-3">
                    D. Ekuitas Pemilik
                  </h3>
                  <div className="space-y-2">
                    {balanceSheet.equityAccounts.map((acc) => (
                      <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]/50">
                        <span className="text-[#d1d5db]">
                          <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                          {acc.name}
                        </span>
                        <span className="font-mono font-medium text-[#f9fafb]">
                          {formatRupiah(acc.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]/50 text-[#34d399]">
                      <span>Laba Bersih Periode Berjalan</span>
                      <span className="font-mono font-medium">
                        {formatRupiah(balanceSheet.currentPeriodNetProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t border-[#374151] text-[#fef08a]">
                      <span>Total Ekuitas</span>
                      <span className="font-mono">{formatRupiah(balanceSheet.totalEquity)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#1f2937] border border-[#374151] rounded-lg flex justify-between items-center text-sm sm:text-base font-black text-[#10b981]">
                  <span>TOTAL LIABILITAS & EKUITAS</span>
                  <span className="font-mono">{formatRupiah(balanceSheet.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LABA RUGI (INCOME STATEMENT) */}
        {activeTab === "income-statement" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* A. Pendapatan */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2">
                I. Pendapatan Jasa Operasional
              </h3>
              <div className="space-y-2">
                {incomeStatement.revenues.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]">
                    <span className="text-[#d1d5db]">
                      <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                      {acc.name}
                    </span>
                    <span className="font-mono font-medium text-[#f9fafb]">
                      {formatRupiah(acc.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-[#34d399] pt-2 border-t border-[#374151]">
                  <span>TOTAL PENDAPATAN JASA</span>
                  <span className="font-mono">{formatRupiah(incomeStatement.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* B. Beban Langsung */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2">
                II. Beban Langsung Pengamanan (Direct Operational Costs)
              </h3>
              <div className="space-y-2">
                {incomeStatement.directCosts.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]">
                    <span className="text-[#d1d5db]">
                      <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                      {acc.name}
                    </span>
                    <span className="font-mono font-medium text-[#fca5a5]">
                      {formatRupiah(acc.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-[#f87171] pt-2 border-t border-[#374151]">
                  <span>TOTAL BEBAN LANGSUNG</span>
                  <span className="font-mono">{formatRupiah(incomeStatement.totalDirectCosts)}</span>
                </div>
              </div>
            </div>

            {/* Laba Kotor Card */}
            <div className="p-4 bg-[#1f2937]/70 border border-[#374151] rounded-lg flex justify-between items-center text-sm sm:text-base font-bold text-[#f59e0b]">
              <div>
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="block text-xs font-normal text-[#9ca3af]">
                  Gross Margin: {incomeStatement.grossProfitMargin.toFixed(1)}%
                </span>
              </div>
              <span className="font-mono text-lg">{formatRupiah(incomeStatement.grossProfit)}</span>
            </div>

            {/* C. Beban Umum & Operasional Kantor */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2">
                III. Beban Administrasi & Umum
              </h3>
              <div className="space-y-2">
                {incomeStatement.operatingExpenses.length > 0 ? (
                  incomeStatement.operatingExpenses.map((acc) => (
                    <div key={acc.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#1f2937]">
                      <span className="text-[#d1d5db]">
                        <span className="font-mono text-[#9ca3af] mr-2">[{acc.code}]</span>
                        {acc.name}
                      </span>
                      <span className="font-mono font-medium text-[#fca5a5]">
                        {formatRupiah(acc.balance)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#9ca3af] italic py-1">Belum ada beban administrasi & umum periode ini.</p>
                )}
                <div className="flex justify-between text-sm font-bold text-[#f87171] pt-2 border-t border-[#374151]">
                  <span>TOTAL BEBAN ADMINISTRASI & UMUM</span>
                  <span className="font-mono">{formatRupiah(incomeStatement.totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Laba Bersih */}
            <div className="p-4 bg-[#064e3b]/30 border border-[#10b981]/50 rounded-lg flex justify-between items-center text-base sm:text-lg font-black text-[#10b981]">
              <div>
                <span>LABA BERSIH BERJALAN (NET INCOME)</span>
                <span className="block text-xs font-normal text-[#9ca3af]">
                  Net Profit Margin: {incomeStatement.netProfitMargin.toFixed(1)}%
                </span>
              </div>
              <span className="font-mono text-xl">{formatRupiah(incomeStatement.netOperatingIncome)}</span>
            </div>
          </div>
        )}

        {/* 3. PERUBAHAN EKUITAS */}
        {activeTab === "equity-change" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2">
              Rekapitulasi Mutasi Ekuitas Pemilik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-[#1f2937]">
                <span className="text-[#d1d5db]">1. Modal Awal Disetor (31100)</span>
                <span className="font-mono text-[#f9fafb] font-medium">
                  {formatRupiah(equityChange.beginningCapital)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-[#1f2937]">
                <span className="text-[#d1d5db]">2. Saldo Laba Ditahan Awal (32100)</span>
                <span className="font-mono text-[#f9fafb] font-medium">
                  {formatRupiah(equityChange.beginningRetainedEarnings)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-[#1f2937] text-[#34d399]">
                <span className="font-semibold">3. Ditambah: Laba Bersih Periode Berjalan</span>
                <span className="font-mono font-bold">
                  + {formatRupiah(equityChange.currentPeriodNetProfit)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-[#1f2937] text-[#9ca3af]">
                <span>4. Dikurangi: Dividen / Prive Pemilik</span>
                <span className="font-mono">- Rp 0</span>
              </div>

              <div className="p-4 bg-[#1f2937] border border-[#374151] rounded-lg flex justify-between items-center text-base font-black text-[#10b981] mt-4">
                <span>TOTAL EKUITAS AKHIR PERIODE</span>
                <span className="font-mono text-lg">{formatRupiah(equityChange.endingEquity)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. ARUS KAS (CASH FLOW - METODE TIDAK LANGSUNG) */}
        {activeTab === "cash-flow" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider border-b border-[#374151] pb-2">
              Arus Kas dari Aktivitas Operasi (Metode Tidak Langsung)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-1 font-semibold text-[#f9fafb]">
                <span>Laba Bersih Sebelum Pajak</span>
                <span className="font-mono">{formatRupiah(cashFlow.operatingActivities.netIncome)}</span>
              </div>

              <div className="pl-4 space-y-2 border-l-2 border-[#374151]">
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af]">
                  <span>(Kenaikan) / Penurunan Piutang Usaha</span>
                  <span className="font-mono">
                    {formatRupiah(cashFlow.operatingActivities.accountsReceivableChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af]">
                  <span>(Kenaikan) / Penurunan Persediaan Seragam & Logistik</span>
                  <span className="font-mono">
                    {formatRupiah(cashFlow.operatingActivities.inventoryChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af]">
                  <span>Kenaikan / (Penurunan) Utang Gaji Personel Satpam</span>
                  <span className="font-mono">
                    {formatRupiah(cashFlow.operatingActivities.salaryPayableChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af]">
                  <span>Kenaikan / (Penurunan) Utang Potongan BPJS & Pajak</span>
                  <span className="font-mono">
                    {formatRupiah(cashFlow.operatingActivities.bpjsTaxPayableChange)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af]">
                  <span>Kenaikan / (Penurunan) Utang PPN Keluaran</span>
                  <span className="font-mono">
                    {formatRupiah(cashFlow.operatingActivities.vatPayableChange)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#93c5fd] pt-2 border-t border-[#374151]">
                <span>Kas Bersih Dihasilkan dari Aktivitas Operasi</span>
                <span className="font-mono">
                  {formatRupiah(cashFlow.operatingActivities.netCashFromOperations)}
                </span>
              </div>

              <div className="pt-4 border-t border-[#374151]">
                <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-2">
                  Arus Kas dari Aktivitas Investasi & Pendanaan
                </h4>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af] py-1">
                  <span>Kas untuk Perolehan Aset Tetap</span>
                  <span className="font-mono">{formatRupiah(cashFlow.investingActivities.netCashFromInvesting)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#9ca3af] py-1">
                  <span>Kas dari Setoran Modal Pemilik</span>
                  <span className="font-mono">{formatRupiah(cashFlow.financingActivities.netCashFromFinancing)}</span>
                </div>
              </div>

              <div className="p-4 bg-[#1f2937] border border-[#374151] rounded-lg space-y-2 mt-4">
                <div className="flex justify-between text-sm font-semibold text-[#f9fafb]">
                  <span>Kenaikan Bersih Kas & Setara Kas</span>
                  <span className="font-mono">{formatRupiah(cashFlow.netCashIncrease)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#10b981] pt-2 border-t border-[#374151]">
                  <span>SALDO AKHIR KAS & BANK (11100)</span>
                  <span className="font-mono text-base">{formatRupiah(cashFlow.endingCash)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer & Signature Box */}
        <div className="border-t border-[#374151] pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-center text-xs text-[#9ca3af]">
          <div>
            <p>Disusun oleh,</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#f9fafb]">
              Staf Akuntansi & Pajak BUJP
            </div>
            <p className="border-t border-[#374151] pt-1 w-full max-w-[192px] mx-auto font-medium">Bagian Keuangan</p>
          </div>
          <div>
            <p>Disetujui oleh,</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#f9fafb]">
              Direktur Utama BUJP
            </div>
            <p className="border-t border-[#374151] pt-1 w-full max-w-[192px] mx-auto font-medium">Manajemen Operasional</p>
          </div>
        </div>
      </div>
    </div>
  );
}
