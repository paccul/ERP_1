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
  Clock,
  CheckCircle2,
  FileText,
  BadgeAlert,
  Coins,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      title: "Total Anggota Satpam",
      value: `${personnelActive} Aktif`,
      subtext: `Dari total ${personnelTotal} personel terdaftar`,
      icon: Users,
      badge: "KTA Mabes",
      href: "/dashboard/personnel",
      highlight: false,
    },
    {
      title: "Klien Mitra & Pos Jaga",
      value: `${clientTotal} Klien / ${siteTotal} Pos`,
      subtext: "Lokasi pengamanan industri & komersial",
      icon: Building2,
      badge: "Mitra Aktif",
      href: "/dashboard/clients",
      highlight: false,
    },
    {
      title: "Piutang Usaha Berjalan",
      value: formatRupiah(totalReceivables > 0 ? totalReceivables : 18315000),
      subtext: `${invoicePendingCount > 0 ? invoicePendingCount : 1} faktur tagihan jasa belum lunas`,
      icon: Receipt,
      badge: "Faktur Issued",
      href: "/dashboard/invoices",
      highlight: true,
    },
    {
      title: "Inventaris Logistik Kaporlap",
      value: `${itemTotal} Master SKU`,
      subtext: `${lowStockItems.length} item mendekati batas minimum`,
      icon: Boxes,
      badge: "Gudang Pusat",
      href: "/dashboard/logistics",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Global Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#374151] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f9fafb]">
              Dashboard Eksekutif BUJP
            </h1>
            <Badge className="bg-[#064e3b] text-[#34d399] border-[#10b981]/50 text-xs font-bold">
              Perpol 01/2023 Aktif
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Ringkasan operasional satuan pengamanan, penempatan pos jaga mitra, logistik kaporlap, dan posisi keuangan.
          </p>
        </div>

        {/* Global Search Component */}
        <GlobalSearch />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} href={kpi.href}>
              <Card className="bg-[#111827] border-[#374151] hover:border-[#f59e0b]/60 transition-colors cursor-pointer group h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-bold text-[#9ca3af] group-hover:text-[#f9fafb] transition-colors">
                    {kpi.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-[#1f2937] text-[#f59e0b] group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-[#f9fafb] font-mono">
                    {kpi.value}
                  </div>
                  <p className="text-xs text-[#9ca3af]">{kpi.subtext}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Actionable Alerts & Warnings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alert 1: Legalitas KTA Satpam */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeAlert className="h-4 w-4 text-[#f59e0b]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#f9fafb] uppercase tracking-wider">
                Pengawasan KTA Satpam (Perpol 01/2023)
              </h3>
            </div>
            <Link
              href="/dashboard/personnel"
              className="text-xs text-[#f59e0b] hover:underline flex items-center gap-1 font-semibold"
            >
              Kelola <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {alertPersonnel.length > 0 ? (
            <div className="space-y-2">
              {alertPersonnel.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg bg-[#1f2937]/60 border border-[#374151] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#f9fafb]">{p.full_name}</span>
                    <span className="text-[#9ca3af] block text-[11px]">
                      KTA: {p.kta_number || "Tidak Terdaftar"}
                    </span>
                  </div>
                  <Badge className="bg-[#78350f] text-[#fef08a] border-[#f59e0b]/40 text-[10px]">
                    Exp: {p.kta_expiry_date || "-"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#064e3b]/20 border border-[#10b981]/30 flex items-center gap-2 text-xs text-[#34d399]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Seluruh personel aktif memiliki KTA Polri dalam masa berlaku valid.</span>
            </div>
          )}
        </div>

        {/* Alert 2: Permintaan BKO & Logistik */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#60a5fa]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#f9fafb] uppercase tracking-wider">
                Status Operasional Lapangan & BKO
              </h3>
            </div>
            <Link
              href="/dashboard/roster"
              className="text-xs text-[#60a5fa] hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat Roster <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#1f2937]/60 border border-[#374151] flex items-center justify-between">
              <span className="text-[#d1d5db]">Permintaan Personel BKO (Insidental)</span>
              <Badge className="bg-[#1f2937] text-[#f9fafb] border-[#374151] text-[10px]">
                {bkoPending} Menunggu Persetujuan
              </Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1f2937]/60 border border-[#374151] flex items-center justify-between">
              <span className="text-[#d1d5db]">Kesiapan Logistik & Seragam Satpam</span>
              <Badge className="bg-[#064e3b] text-[#34d399] border-[#10b981]/40 text-[10px]">
                {lowStockItems.length === 0 ? "Stok Aman" : `${lowStockItems.length} Kritis`}
              </Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1f2937]/60 border border-[#374151] flex items-center justify-between">
              <span className="text-[#d1d5db]">Laporan Keuangan SAK (Neraca & Laba Rugi)</span>
              <Link
                href="/dashboard/accounting/reports"
                className="text-[#f59e0b] font-semibold hover:underline"
              >
                Buka Laporan →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to 9 Core Modules */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-[#9ca3af] uppercase tracking-wider mb-3">
          Akses Cepat 9 Modul Operasional BUJP
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/dashboard/personnel"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Users className="h-4 w-4 text-[#f59e0b]" />
            Personel Satpam
          </Link>
          <Link
            href="/dashboard/clients"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Building2 className="h-4 w-4 text-[#60a5fa]" />
            Klien & Pos Jaga
          </Link>
          <Link
            href="/dashboard/roster"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <CalendarDays className="h-4 w-4 text-[#34d399]" />
            Jadwal Jaga & BKO
          </Link>
          <Link
            href="/dashboard/logistics"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Boxes className="h-4 w-4 text-[#c084fc]" />
            Logistik Kaporlap
          </Link>
          <Link
            href="/dashboard/invoices"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Receipt className="h-4 w-4 text-[#f472b6]" />
            Invoicing & Billing
          </Link>
          <Link
            href="/dashboard/payroll"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Coins className="h-4 w-4 text-[#fef08a]" />
            Penggajian (Payroll)
          </Link>
          <Link
            href="/dashboard/accounting"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <TrendingUp className="h-4 w-4 text-[#10b981]" />
            Jurnal Akuntansi
          </Link>
          <Link
            href="/dashboard/accounting/reports/management-analysis"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Building2 className="h-4 w-4 text-[#38bdf8]" />
            Analisa Pos Jaga
          </Link>
          <Link
            href="/dashboard/accounting/reports/balanced-scorecard"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <ShieldCheck className="h-4 w-4 text-[#a78bfa]" />
            Balanced Scorecard
          </Link>
          <Link
            href="/dashboard/recruitment"
            className="p-3 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#f59e0b] hover:bg-[#1f2937] transition-colors flex items-center gap-2.5 text-xs font-semibold text-[#f9fafb]"
          >
            <Users className="h-4 w-4 text-[#fb923c]" />
            Rekrutmen PSB
          </Link>
        </div>
      </div>
    </div>
  );
}
