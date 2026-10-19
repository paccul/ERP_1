import { Metadata } from "next";
import { SettingsSubnav } from "@/components/layout/SettingsSubnav";
import { getOrgUnits } from "../actions";
import { OrgChartClient } from "./components/OrgChartClient";

export const metadata: Metadata = {
  title: "Struktur Organisasi BUJP | Garda ERP",
  description: "Bagan hierarki komando dan manajemen operasional BUJP standar Mabes Polri.",
};

export default async function OrgChartPage() {
  const units = await getOrgUnits();

  return (
    <div className="space-y-6">
      <SettingsSubnav />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#f9fafb]">
          Bagan Struktur Organisasi & Komando BUJP
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
          Visualisasi hierarki struktural kepemimpinan Direksi hingga Komandan Regu (Danru) pengamanan lapangan.
        </p>
      </div>

      <OrgChartClient initialUnits={units} />
    </div>
  );
}
