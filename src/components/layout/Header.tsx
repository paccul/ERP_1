"use client";

import { useState } from "react";
import { Menu, LogOut, Shield, User, Loader2 } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userEmail?: string | null;
  userRole?: string | null;
  onOpenMobileSidebar?: () => void;
}

export function Header({
  userEmail,
  userRole = "Administrator BUJP",
  onOpenMobileSidebar,
}: HeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      // signOut redirects, but catch fallback
      setLoggingOut(false);
    }
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "Operasional";

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#374151] bg-[#030712]/95 px-4 backdrop-blur-md lg:px-8">
      {/* Left: Hamburger (mobile) & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu Navigasi"
          className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#111827] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-[#9ca3af]">
            <Shield className="h-3.5 w-3.5 text-[#f59e0b]" />
            <span className="font-semibold text-white">Garda BUJP</span>
            <span className="text-[#6b7280]">/</span>
          </div>
          <span className="font-medium text-[#9ca3af]">Portal Operasional Terpadu</span>
        </div>
      </div>

      {/* Right: Database Status, User Info & Logout Button */}
      <div className="flex items-center gap-4">
        {/* Supabase Status Dot */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase Connected</span>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 border-l border-[#374151] pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-[#f59e0b] ring-1 ring-[#374151]">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white capitalize truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="text-[10px] text-[#9ca3af] truncate max-w-[140px]">
              {userRole}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={loggingOut}
          onClick={handleLogout}
          aria-label="Keluar dari Sistem"
          className="h-8 border-[#374151] bg-[#111827] text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all focus-visible:ring-red-500"
        >
          {loggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Keluar</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
