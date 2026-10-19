import { MapPin } from "lucide-react";
import { getClientsDropdown } from "../actions";
import { SiteForm } from "../components/SiteForm";
import { ClientSubnav } from "@/components/layout/ClientSubnav";

export const metadata = {
  title: "Tambah Lokasi Jaga Baru | Garda BUJP ERP",
};

interface NewSitePageProps {
  searchParams: Promise<{
    clientId?: string;
  }>;
}

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const params = await searchParams;
  const clients = await getClientsDropdown();

  return (
    <div className="space-y-6">
      <ClientSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MapPin className="h-6 w-6 text-[#f59e0b]" />
          Tambah Lokasi Pos Jaga Baru (SEC-06)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Tentukan penempatan pos jaga fisik, kuota personel satpam per shift, dan tarif kontrak penagihan per anggota.
        </p>
      </div>

      <SiteForm clients={clients} defaultClientId={params.clientId} mode="create" />
    </div>
  );
}
