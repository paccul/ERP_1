"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, PlusCircle, Send, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogisticsSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Gudang Logistik Pusat",
      href: "/dashboard/logistics",
      icon: Package,
      active: pathname === "/dashboard/logistics" || pathname.startsWith("/dashboard/logistics/detail/"),
    },
    {
      name: "Registrasi Item Baru",
      href: "/dashboard/logistics/new",
      icon: PlusCircle,
      active: pathname === "/dashboard/logistics/new",
    },
    {
      name: "Distribusi Kaporlap",
      href: "/dashboard/logistics/distribution",
      icon: Send,
      active: pathname === "/dashboard/logistics/distribution",
    },
    {
      name: "Riwayat Distribusi",
      href: "/dashboard/logistics/history",
      icon: History,
      active: pathname === "/dashboard/logistics/history",
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
