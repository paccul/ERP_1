"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Boxes,
  Receipt,
  Wallet,
  BookOpen,
  Settings,
  X,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavModule {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const bujpModules: NavModule[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Ringkasan Operasional & KPI",
  },
  {
    name: "Personel Satpam",
    href: "/dashboard/personnel",
    icon: Users,
    description: "Data Anggota, KTA & Gada",
  },
  {
    name: "Rekrutmen PSB",
    href: "/dashboard/recruitment",
    icon: UserPlus,
    description: "Kandidat Satpam & Samapta",
  },
  {
    name: "Klien & Pos Jaga",
    href: "/dashboard/clients",
    icon: Building2,
    description: "Mitra & Lokasi Pengamanan",
  },
  {
    name: "Jadwal Jaga / Roster",
    href: "/dashboard/roster",
    icon: CalendarDays,
    description: "Plotting Shift & BKO",
  },
  {
    name: "Logistik & Perlengkapan",
    href: "/dashboard/logistics",
    icon: Boxes,
    description: "Kaporlap, Seragam & Stok",
  },
  {
    name: "Invoicing & Billing",
    href: "/dashboard/invoices",
    icon: Receipt,
    description: "Tagihan Jasa Manpower",
  },
  {
    name: "Penggajian (Payroll)",
    href: "/dashboard/payroll",
    icon: Wallet,
    description: "Slip Gaji, Lembur & BPJS",
  },
  {
    name: "Jurnal Akuntansi",
    href: "/dashboard/accounting",
    icon: BookOpen,
    description: "Buku Besar & Double-Entry",
  },
  {
    name: "Pengaturan Sistem",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Legalitas, Role & Organisasi",
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex h-full flex-col bg-[#030712] text-white">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#374151] px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-lg"
          onClick={onClose}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f59e0b] text-black shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white">
              GARDA ERP
            </div>
            <div className="text-[10px] text-[#9ca3af] font-medium tracking-tight">
              Sistem Manajemen BUJP
            </div>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Menu Navigasi"
            className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-[#111827] hover:text-white focus-visible:ring-2 focus-visible:ring-[#f59e0b] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="shrink-0 px-3 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] px-3">
          9 Modul Operasional
        </span>
      </div>

      <nav
        aria-label="Navigasi Utama BUJP"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-1"
      >
        {bujpModules.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
                isActive
                  ? "bg-[#f59e0b]/15 text-[#f59e0b] shadow-sm ring-1 ring-[#f59e0b]/40 border-l-2 border-[#f59e0b]"
                  : "text-[#9ca3af] hover:bg-[#111827] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-[#f59e0b]" : "text-[#6b7280] group-hover:text-white"
                )}
              />
              <div className="flex flex-col truncate">
                <span className="truncate">{item.name}</span>
                <span className="text-[10px] font-normal text-[#6b7280] truncate">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="shrink-0 border-t border-[#374151] p-3">
        <div className="rounded-lg bg-[#111827] p-3 text-[11px] text-[#9ca3af]">
          <div className="flex items-center justify-between font-medium">
            <span className="text-white">Standar Mabes Polri</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
              Perpol 01/2023
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#6b7280]">
            Database Terenkripsi & RLS Aktif
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#374151] bg-[#030712] lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:self-start lg:z-30">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
