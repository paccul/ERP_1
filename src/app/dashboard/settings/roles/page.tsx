import { Metadata } from "next";
import Link from "next/link";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getRoles } from "../actions";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Plus,
  Shield,
  Edit,
  Lock,
} from "lucide-react";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const metadata: Metadata = {
  title: "Role & Matriks Izin (RBAC) | Garda ERP",
  description: "Pengaturan peran pengguna dan konfigurasi matriks izin 8 modul sistem Garda ERP.",
};

export default async function RolesPage() {
  const { allowed } = await requirePermission("users", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Role & Matriks Hak Akses (RBAC)" />;
  }

  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
            Role & Matriks Hak Akses (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Konfigurasi wewenang granular 8 modul operasional BUJP berbasis hak akses View dan Manage.
          </p>
        </div>

        <Link href="/dashboard/settings/roles/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-1.5" />
            Buat Role Baru
          </Button>
        </Link>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const perms = role.role_permissions || [];
          const viewCount = perms.filter((p) => p.can_view).length;
          const manageCount = perms.filter((p) => p.can_manage).length;

          return (
            <div
              key={role.id}
              className="bg-[#111827] border border-[#374151] rounded-2xl p-5 hover:border-[#f59e0b]/40 transition-all flex flex-col justify-between shadow-sm relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                        {role.name}
                      </h2>
                      {role.is_system && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider">
                          <Lock className="h-2.5 w-2.5" />
                          Role Sistem
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/dashboard/settings/roles/edit/${role.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 border-[#374151] hover:border-[#f59e0b] hover:text-[#f59e0b] text-gray-300 rounded-lg text-xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit Izin
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-[#9ca3af] min-h-[32px] line-clamp-2">
                  {role.description || "Tidak ada keterangan khusus."}
                </p>

                {/* Permissions Stat */}
                <div className="mt-4 pt-4 border-t border-[#1f2937] grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#030712] p-2.5 rounded-xl border border-[#1f2937]">
                    <div className="text-[10px] text-[#9ca3af] uppercase font-bold">Akses View</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      {viewCount} / 8 Modul
                    </div>
                  </div>
                  <div className="bg-[#030712] p-2.5 rounded-xl border border-[#1f2937]">
                    <div className="text-[10px] text-[#9ca3af] uppercase font-bold">Akses Manage</div>
                    <div className="text-sm font-black text-[#f59e0b] mt-0.5">
                      {manageCount} / 8 Modul
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  RLS Enforced
                </span>
                <span>UUID: {role.id.substring(0, 8)}...</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
