import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getInstitutionSettings } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { BackupClient } from "./components/BackupClient";

export const metadata: Metadata = {
  title: "Pajak, Sistem & Backup Data | Garda ERP",
  description: "Pengaturan tarif pajak sistem, pencadangan snapshot database, dan audit keamanan.",
};

export default async function BackupPage() {
  const supabase = await createClient();

  const [
    institution,
    { count: personnelCount },
    { count: clientsCount },
    { count: sitesCount },
    { count: itemsCount },
    { count: accountsCount },
    { count: usersCount },
  ] = await Promise.all([
    getInstitutionSettings(),
    supabase.from("personnel").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const defaultInstitution = institution || {
    ppn_rate: 11,
    pph23_rate: 2,
    bpjs_ketenagakerjaan_rate: 4.24,
    bpjs_kesehatan_rate: 1.0,
    license_number: "SIO/542/BIN/X/2023/Mabes-Polri",
    company_name: "PT Garda Utama Security Indonesia",
  };

  const stats = {
    personnelCount: personnelCount || 0,
    clientsCount: clientsCount || 0,
    sitesCount: sitesCount || 0,
    itemsCount: itemsCount || 0,
    accountsCount: accountsCount || 0,
    usersCount: usersCount || 0,
  };

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Parameter Sistem, Pajak & Backup Database
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Pengaturan tarif default PPN/PPh/BPJS, ekspor cadangan basis data berkala, dan verifikasi integritas audit.
        </p>
      </div>

      <BackupClient institutionData={defaultInstitution} stats={stats} />
    </div>
  );
}
