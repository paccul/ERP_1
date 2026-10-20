"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function InvoiceSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Daftar Faktur Tagihan",
      href: "/dashboard/invoices",
      icon: FileText,
      active: pathname === "/dashboard/invoices" || (pathname.startsWith("/dashboard/invoices/") && pathname !== "/dashboard/invoices/new"),
    },
    {
      name: "Buat Invoice Baru",
      href: "/dashboard/invoices/new",
      icon: PlusCircle,
      active: pathname === "/dashboard/invoices/new",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#374151] pb-3 mb-6 w-full max-w-full">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
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
