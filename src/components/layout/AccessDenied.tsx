import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  moduleName?: string;
  requiredAction?: "view" | "manage";
}

export function AccessDenied({
  moduleName = "Modul Ini",
  requiredAction = "view",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak (403)</h2>
      <p className="max-w-md text-sm text-[#9ca3af] mb-6">
        Role akun Anda tidak memiliki hak akses{" "}
        <span className="font-semibold text-red-400">
          {requiredAction === "manage" ? "mengubah / mengelola" : "melihat"}
        </span>{" "}
        pada <span className="font-semibold text-white">{moduleName}</span>. Silakan hubungi Super Admin BUJP untuk penyesuaian hak akses.
      </p>
      <Link href="/dashboard">
        <Button variant="outline" className="border-[#374151] bg-[#111827] text-xs text-white hover:bg-[#1f2937]">
          <ArrowLeft className="h-3.5 w-3.5 mr-2" />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
}
