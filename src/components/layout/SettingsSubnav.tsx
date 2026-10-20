"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Network, Users, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Profil BUJP & SIO Polri",
      href: "/dashboard/settings/institution",
      icon: Building2,
      active:
        pathname === "/dashboard/settings" ||
        pathname === "/dashboard/settings/institution",
    },
    {
      name: "Struktur Organisasi",
      href: "/dashboard/settings/org-chart",
      icon: Network,
      active: pathname === "/dashboard/settings/org-chart",
    },
    {
      name: "Manajemen Pengguna",
      href: "/dashboard/settings/users",
      icon: Users,
      active: pathname.startsWith("/dashboard/settings/users"),
    },
    {
      name: "Role & Matriks Izin (RBAC)",
      href: "/dashboard/settings/roles",
      icon: KeyRound,
      active: pathname.startsWith("/dashboard/settings/roles"),
    },
    {
      name: "Pajak, Sistem & Backup",
      href: "/dashboard/settings/backup",
      icon: ShieldCheck,
      active: pathname === "/dashboard/settings/backup",
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
