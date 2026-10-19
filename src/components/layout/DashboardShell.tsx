"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: string | null;
}

export function DashboardShell({
  children,
  userEmail,
  userRole,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white transition-colors duration-200">
      {/* Sidebar (Desktop and Mobile) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          userEmail={userEmail}
          userRole={userRole}
          onOpenMobileSidebar={() => setMobileMenuOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
