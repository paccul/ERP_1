"use client";

import { Menu, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserProfileMenu } from "./UserProfileMenu";

interface HeaderProps {
  userEmail?: string | null;
  userRole?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  companyLogoUrl?: string | null;
  onOpenMobileSidebar?: () => void;
}

export function Header({
  userEmail,
  userRole = "Administrator BUJP",
  fullName,
  avatarUrl,
  companyLogoUrl,
  onOpenMobileSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 w-full items-center justify-between border-b border-[#374151] bg-[#030712]/95 px-4 backdrop-blur-md lg:px-8">
      {/* Left: Mobile Hamburger & Brand/Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu Navigasi"
          className="rounded-xl p-2 text-[#9ca3af] hover:bg-[#111827] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt="Logo Perusahaan"
                className="h-7 w-7 rounded-lg object-contain bg-[#111827] p-0.5 border border-[#374151]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-black shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
            )}
            <span className="font-bold text-white tracking-wide">GARDA BUJP</span>
          </div>
          <span className="text-[#4b5563] hidden sm:inline">/</span>
          <span className="font-medium text-[#9ca3af] hidden sm:inline truncate max-w-[200px]">
            Portal Operasional Terpadu
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle & Unified User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle (samping kanan atas sebelum admin profil) */}
        <ThemeToggle />

        {/* Unified User Profile Dropdown (berisi info profil, ubah foto/profil, pengaturan, dan 1 tombol keluar) */}
        <UserProfileMenu
          userEmail={userEmail}
          userRole={userRole}
          fullName={fullName}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  );
}
