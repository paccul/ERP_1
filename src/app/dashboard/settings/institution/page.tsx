import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getInstitutionSettings } from "../actions";
import { InstitutionForm } from "../components/InstitutionForm";
import { requirePermission } from "@/lib/auth/rbac";
import { AccessDenied } from "@/components/layout/AccessDenied";

export const metadata: Metadata = {
  title: "Profil BUJP & Legalitas SIO Polri | Garda ERP",
  description: "Formulir identitas resmi perusahaan, legalitas Mabes Polri, dan konfigurasi perpajakan.",
};

export default async function InstitutionPage() {
  const { allowed } = await requirePermission("institution", "view");
  if (!allowed) {
    return <AccessDenied moduleName="Profil BUJP & Legalitas SIO Polri" />;
  }

  const settings = await getInstitutionSettings();

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Profil BUJP & Legalitas SIO Mabes Polri
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Identitas resmi Badan Usaha Jasa Pengamanan, Surat Izin Operasional, dan tarif perpajakan terstandar.
        </p>
      </div>

      {settings && <InstitutionForm initialData={settings} />}
    </div>
  );
}
