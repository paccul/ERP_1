import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { RoleForm } from "../components/RoleForm";

export const metadata: Metadata = {
  title: "Buat Role Baru | Garda ERP",
  description: "Pembuatan role wewenang baru dan konfigurasi matriks izin modul.",
};

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Buat Role Wewenang Baru
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Definisikan nama role dan tentukan hak akses View / Manage pada 8 modul operasional BUJP.
        </p>
      </div>

      <RoleForm />
    </div>
  );
}
