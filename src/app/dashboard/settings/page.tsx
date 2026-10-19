import { Metadata } from "next";
import Link from "next/link";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getInstitutionSettings } from "./actions";
import { InstitutionForm } from "./components/InstitutionForm";
import { Network, Users, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pengaturan Sistem & Profil BUJP | Garda ERP",
  description: "Manajemen identitas BUJP, izin Mabes Polri, struktur organisasi, pengguna, role RBAC, dan backup sistem.",
};

export default async function SettingsPage() {
  const settings = await getInstitutionSettings();

  const quickLinks = [
    {
      title: "Struktur Organisasi",
      desc: "Visualisasi hierarki manajerial Direksi, Chief Security, hingga Danru Pos Jaga.",
      href: "/dashboard/settings/org-chart",
      icon: Network,
      color: "text-[#60a5fa]",
    },
    {
      title: "Manajemen Pengguna",
      desc: "Kelola akun pengguna internal staf operasional, HRD, keuangan, dan admin.",
      href: "/dashboard/settings/users",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      title: "Role & Matriks Izin (RBAC)",
      desc: "Atur matriks 16 izin granular (view & manage) untuk 8 modul sistem Garda ERP.",
      href: "/dashboard/settings/roles",
      icon: KeyRound,
      color: "text-[#f59e0b]",
    },
    {
      title: "Pajak, Sistem & Backup",
      desc: "Konfigurasi tarif PPN/PPh, download arsip snapshot JSON, dan pemantauan audit log.",
      href: "/dashboard/settings/backup",
      icon: ShieldCheck,
      color: "text-[#c084fc]",
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
            Pengaturan Sistem & Profil Badan Usaha (BUJP)
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Konfigurasi identitas resmi perusahaan, legalitas Mabes Polri, parameter perpajakan, dan otoritas sistem terpadu.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group p-4 bg-[#111827] border border-[#374151] hover:border-[#f59e0b]/50 rounded-2xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-[#1f2937] ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#f59e0b] group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Institution Form */}
      {settings && <InstitutionForm initialData={settings} />}
    </div>
  );
}
