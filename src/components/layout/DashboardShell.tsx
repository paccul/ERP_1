"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { UserPermissionMap } from "@/lib/auth/rbac";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  companyLogoUrl?: string | null;
  permissions?: UserPermissionMap | null;
}

export function DashboardShell({
  children,
  userEmail,
  userRole,
  fullName,
  avatarUrl,
  companyLogoUrl,
  permissions,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white transition-colors duration-200">
      {/* Sidebar (Desktop Permanent & Mobile Slide-Over Drawer) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        companyLogoUrl={companyLogoUrl}
        userRole={userRole}
        permissions={permissions}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          userEmail={userEmail}
          userRole={userRole}
          fullName={fullName}
          avatarUrl={avatarUrl}
          companyLogoUrl={companyLogoUrl}
          onOpenMobileSidebar={() => setMobileMenuOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <div className="mx-auto w-full max-w-[1920px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
