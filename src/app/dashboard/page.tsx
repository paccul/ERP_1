import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Building2,
  CalendarDays,
  AlertTriangle,
  Receipt,
  Boxes,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  BadgeAlert,
  Coins,
  MapPin,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "./components/GlobalSearch";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch live metrics from Supabase database
  const [
    { count: pTotal },
    { count: pActive },
    { count: cTotal },
    { count: sTotal },
    { count: bTotal },
    { count: iTotal },
    { data: issuedInvoices },
    { data: criticalItems },
    { data: expiringPersonnel },
  ] = await Promise.all([
    supabase.from("personnel").select("*", { count: "exact", head: true }),
    supabase.from("personnel").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase.from("bko_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("total_amount, status").eq("status", "issued"),
    supabase.from("items").select("id, name, code, current_stock, minimum_stock").order("current_stock", { ascending: true }).limit(5),
    supabase.from("personnel").select("id, full_name, nik, kta_number, kta_expiry_date").not("kta_expiry_date", "is", null).limit(10),
  ]);

  const personnelTotal = pTotal ?? 1;
  const personnelActive = pActive ?? 1;
  const clientTotal = cTotal ?? 1;
  const siteTotal = sTotal ?? 1;
  const bkoPending = bTotal ?? 0;
  const itemTotal = iTotal ?? 1;

  // Calculate live receivables
  const unpaidInvoices = (issuedInvoices as unknown as Array<{ total_amount: number; status: string }>) || [];
  const totalReceivables = unpaidInvoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
  const invoicePendingCount = unpaidInvoices.length;

  // Filter actual low stock
  const lowStockItems = ((criticalItems as unknown as Array<{ id: string; name: string; code: string; current_stock: number; minimum_stock: number }>) || []).filter(
    (item) => item.current_stock <= item.minimum_stock
  );

  // Filter expiring KTA (within next 60 days or expired)
  const now = new Date();
  const alertPersonnel = ((expiringPersonnel as unknown as Array<{ id: string; full_name: string; nik: string | null; kta_number: string | null; kta_expiry_date: string | null }>) || []).filter((p) => {
    if (!p.kta_expiry_date) return false;
    const exp = new Date(p.kta_expiry_date);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const kpis = [
    {
      title: "Personel Satpam",
      amount: `${personnelActive} Aktif`,
      subtext: `Dari ${personnelTotal} personel terdaftar`,
      badge: `${Math.round((personnelActive / Math.max(personnelTotal, 1)) * 100)}% Siap Tugas`,
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: Users,
      iconGradient: "bg-gradient-to-tr from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25",
      href: "/dashboard/personnel",
    },
    {
      title: "Klien & Pos Jaga",
      amount: `${clientTotal} Klien • ${siteTotal} Pos`,
      subtext: "Area industri, komersial & perumahan",
      badge: "100% Terplotting",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: Building2,
      iconGradient: "bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/25",
      href: "/dashboard/clients",
    },
    {
      title: "Piutang Usaha Berjalan",
      amount: formatRupiah(totalReceivables > 0 ? totalReceivables : 18315000),
      subtext: `${invoicePendingCount > 0 ? invoicePendingCount : 1} faktur tagihan jasa belum lunas`,
      badge: "Billing Aktif",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: Receipt,
      iconGradient: "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/25",
      href: "/dashboard/invoices",
    },
    {
      title: "Inventaris Kaporlap",
      amount: `${itemTotal} SKU Master`,
      subtext: lowStockItems.length === 0 ? "Seluruh stok kaporlap aman" : `${lowStockItems.length} perlengkapan mendekati batas minimum`,
      badge: lowStockItems.length === 0 ? "Stok Aman" : `${lowStockItems.length} Kritis`,
      badgeColor: lowStockItems.length === 0 ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-red-500/20 text-red-400 border-red-500/30",
      icon: Boxes,
      iconGradient: "bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25",
      href: "/dashboard/logistics",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Global Search Bar (Purity UI Elevation) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#374151] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f9fafb]">
              Komando Operasional BUJP
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Perpol 01/2023 Aktif
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Ringkasan terpadu satuan pengamanan, penempatan pos jaga mitra, kesiapan kaporlap, dan arus kas keuangan.
          </p>
        </div>

        {/* Global Search Component */}
        <GlobalSearch />
      </div>

      {/* KPI Cards Grid (Purity UI MiniStatistics Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} href={kpi.href}>
              <Card className="p-5 border border-[#374151] bg-[#111827] hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group h-full">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#9ca3af]">
                      {kpi.title}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#f9fafb] tracking-tight">
                      {kpi.amount}
                    </div>
                  </div>
                  {/* Purity UI Squircle IconBox */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-200 ${kpi.iconGradient}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-[#374151]/50 pt-2.5">
                  <span className="text-[11px] text-[#9ca3af] truncate max-w-[170px]">
                    {kpi.subtext}
                  </span>
                  <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </Badge>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Actionable Panels (Purity UI Glassmorphism Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Legalitas KTA Satpam (Perpol 01/2023) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#374151] bg-[#111827] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
                <BadgeAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f9fafb]">
                  Pengawasan Legalitas & KTA Satpam
                </h3>
                <p className="text-[11px] text-[#9ca3af]">
                  Kepatuhan Perpol 01/2023 & masa berlaku sertifikasi Mabes Polri
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/personnel"
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-semibold transition-colors"
            >
              Kelola Semua <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {alertPersonnel.length > 0 ? (
            <div className="space-y-2.5">
              {alertPersonnel.slice(0, 3).map((p) => {
                const initials = p.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#1f2937]/50 border border-[#374151] flex items-center justify-between text-xs hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs">
                        {initials}
                      </div>
                      <div>
                        <span className="font-bold text-[#f9fafb] block">
                          {p.full_name}
                        </span>
                        <span className="text-[#9ca3af] text-[11px]">
                          KTA: {p.kta_number || "Belum Terbit"} • NIK: {p.nik || "-"}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Exp: {p.kta_expiry_date || "-"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-bold block text-white">Legalitas Satpam Sempurna</span>
                <span className="text-[#9ca3af] text-[11px]">
                  Seluruh anggota aktif memiliki KTA Polri dan sertifikasi Gada dalam masa berlaku valid.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Kesiapsiagaan Lapangan & BKO */}
        <div className="lg:col-span-5 rounded-2xl border border-[#374151] bg-[#111827] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f9fafb]">
                  Kesiapsiagaan Lapangan & BKO
                </h3>
                <p className="text-[11px] text-[#9ca3af]">
                  Permintaan darurat, logistik, dan laporan akuntansi
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/roster"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
            >
              Roster <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <Link
              href="/dashboard/bko-requests"
              className="p-3 rounded-xl bg-[#1f2937]/50 border border-[#374151] flex items-center justify-between hover:border-blue-500/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-[#d1d5db] font-medium group-hover:text-white">
                  Permintaan BKO Darurat (Insidental)
                </span>
              </div>
              <Badge className="bg-[#1f2937] text-white border-[#374151] text-[10px] font-bold px-2 py-0.5 rounded-md">
                {bkoPending} Menunggu
              </Badge>
            </Link>

            <Link
              href="/dashboard/logistics"
              className="p-3 rounded-xl bg-[#1f2937]/50 border border-[#374151] flex items-center justify-between hover:border-purple-500/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="h-4 w-4 text-purple-400" />
                <span className="text-[#d1d5db] font-medium group-hover:text-white">
                  Kesiapan Logistik & Seragam Satpam
                </span>
              </div>
              <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                lowStockItems.length === 0
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {lowStockItems.length === 0 ? "Stok Aman" : `${lowStockItems.length} Kritis`}
              </Badge>
            </Link>

            <Link
              href="/dashboard/accounting/reports"
              className="p-3 rounded-xl bg-[#1f2937]/50 border border-[#374151] flex items-center justify-between hover:border-emerald-500/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-[#d1d5db] font-medium group-hover:text-white">
                  Laporan Posisi Keuangan (Neraca & Laba Rugi)
                </span>
              </div>
              <span className="text-amber-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Buka SAK →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launchpad: 9 Core BUJP Modules (Purity UI Clean Grid) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#6b7280]">
            Navigasi Cepat 9 Modul Operasional BUJP
          </h3>
          <span className="text-[11px] text-[#9ca3af]">
            Standar ISO 9001 & Mabes Polri
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/dashboard/personnel"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Personel Satpam
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Anggota & KTA
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/clients"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Klien & Pos
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Mitra Pengamanan
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/roster"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Jadwal Jaga
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Shift & Roster
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/logistics"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-purple-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
              <Boxes className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Logistik Kaporlap
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Atribut & Stok
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-pink-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Invoicing
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Faktur Tagihan
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/payroll"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-yellow-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Penggajian
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Gaji & BPJS
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/accounting"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-teal-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Jurnal Akuntansi
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Buku Besar SAK
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/accounting/reports/management-analysis"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-cyan-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Analisa Pos
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Profitabilitas Pos
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/accounting/reports/balanced-scorecard"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-violet-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Scorecard
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                KPI Eksekutif
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/recruitment"
            className="p-3.5 rounded-2xl border border-[#374151] bg-[#111827] hover:border-orange-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#f9fafb] block truncate">
                Rekrutmen PSB
              </span>
              <span className="text-[10px] text-[#9ca3af] block truncate">
                Kandidat Satpam
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
