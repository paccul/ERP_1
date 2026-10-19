import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getRoleById } from "../../../actions";
import { RoleForm } from "../../components/RoleForm";

export const metadata: Metadata = {
  title: "Edit Matriks Izin Role | Garda ERP",
  description: "Perbarui nama role dan konfigurasi hak akses modul sistem.",
};

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;
  const role = await getRoleById(id);

  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Edit Role & Matriks Izin: {role.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Sesuaikan wewenang akses Baca (View) dan Eksekusi (Manage) untuk role ini.
        </p>
      </div>

      <RoleForm initialRole={role} />
    </div>
  );
}
