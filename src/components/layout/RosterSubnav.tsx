"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GitCompare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function RosterSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Jadwal Roster Shift",
      href: "/dashboard/roster",
      icon: CalendarDays,
      active: pathname === "/dashboard/roster" || pathname.startsWith("/dashboard/roster/"),
    },
    {
      name: "Permohonan BKO",
      href: "/dashboard/bko-requests",
      icon: GitCompare,
      active: pathname === "/dashboard/bko-requests" || pathname.startsWith("/dashboard/bko-requests/"),
    },
    {
      name: "Rekrutmen PSB",
      href: "/dashboard/recruitment",
      icon: UserPlus,
      active: pathname === "/dashboard/recruitment" || pathname.startsWith("/dashboard/recruitment/"),
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
