"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  Layers,
  Receipt,
  BarChart3,
  Building2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountingSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Bagan Akun (COA)",
      href: "/dashboard/accounting/coa",
      icon: Layers,
      active: pathname === "/dashboard/accounting" || pathname === "/dashboard/accounting/coa" || pathname.startsWith("/dashboard/accounting/coa/"),
    },
    {
      name: "Jurnal Umum",
      href: "/dashboard/accounting/journals",
      icon: BookOpen,
      active: pathname === "/dashboard/accounting/journals",
    },
    {
      name: "Input Jurnal Baru",
      href: "/dashboard/accounting/journals/new",
      icon: PlusCircle,
      active: pathname === "/dashboard/accounting/journals/new",
    },
    {
      name: "Buku Besar (Ledger)",
      href: "/dashboard/accounting/ledger",
      icon: FileSpreadsheet,
      active: pathname === "/dashboard/accounting/ledger",
    },
    {
      name: "Buku Pembantu Piutang",
      href: "/dashboard/accounting/receivables",
      icon: Receipt,
      active: pathname === "/dashboard/accounting/receivables",
    },
    {
      name: "Laporan Keuangan SAK",
      href: "/dashboard/accounting/reports",
      icon: BarChart3,
      active: pathname === "/dashboard/accounting/reports",
    },
    {
      name: "Analisa Pos Jaga",
      href: "/dashboard/accounting/reports/management-analysis",
      icon: Building2,
      active: pathname === "/dashboard/accounting/reports/management-analysis",
    },
    {
      name: "Balanced Scorecard",
      href: "/dashboard/accounting/reports/balanced-scorecard",
      icon: Target,
      active: pathname === "/dashboard/accounting/reports/balanced-scorecard",
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-[#374151] pb-3 mb-6 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
              item.active
                ? "bg-[#1f2937] text-[#f59e0b] border border-[#f59e0b]/40 font-semibold shadow-sm"
                : "text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#111827]"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
