import { Building2 } from "lucide-react";
import { ClientForm } from "../components/ClientForm";
import { ClientSubnav } from "@/components/layout/ClientSubnav";

export const metadata = {
  title: "Registrasi Klien Mitra Baru | Garda BUJP ERP",
};

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <ClientSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#f59e0b]" />
          Registrasi Klien Mitra Baru (SEC-04)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Daftarkan identitas perusahaan rekanan pengguna jasa pengamanan satpam dan masa kontrak.
        </p>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}
