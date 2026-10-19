import { Layers } from "lucide-react";
import { getAccounts } from "../../actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { AccountForm } from "./components/AccountForm";

export const metadata = {
  title: "Tambah Akun COA Baru | Garda BUJP ERP",
};

export default async function NewAccountPage() {
  const { data: accounts } = await getAccounts();

  return (
    <div className="space-y-6">
      <AccountingSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="h-6 w-6 text-[#f59e0b]" />
          Tambah Akun COA Baru (ACC-02)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Daftarkan nomor rekening akun buku besar baru untuk mengklasifikasikan pos keuangan spesifik.
        </p>
      </div>

      <AccountForm parentAccounts={accounts} />
    </div>
  );
}
