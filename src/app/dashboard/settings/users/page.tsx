import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getUsers } from "../actions";
import { UsersTableClient } from "./components/UsersTableClient";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const metadata: Metadata = {
  title: "Manajemen Pengguna Sistem | Garda ERP",
  description: "Daftar akun pengguna, otoritas role, dan status aktifitas staf BUJP.",
};

export default async function UsersPage() {
  const { allowed } = await requirePermission("users", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Manajemen Akun Pengguna" />;
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Manajemen Akun Pengguna & Hak Akses
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Pengelolaan akun staf internal, penugasan role wewenang, dan kontrol status aktifitas pengguna sistem.
        </p>
      </div>

      <UsersTableClient initialUsers={users} />
    </div>
  );
}
