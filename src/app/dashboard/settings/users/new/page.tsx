import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getRoles } from "../../actions";
import { UserForm } from "../components/UserForm";

export const metadata: Metadata = {
  title: "Tambah Pengguna Baru | Garda ERP",
  description: "Daftarkan akun pengguna staf atau manajer sistem baru.",
};

export default async function NewUserPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Pendaftaran Pengguna Baru
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Buat akun kredensial staf operasional dan tentukan batas wewenang role RBAC.
        </p>
      </div>

      <UserForm roles={roles} />
    </div>
  );
}
