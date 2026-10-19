import { PlusCircle } from "lucide-react";
import { getAccounts } from "../../actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { JournalEditor } from "./components/JournalEditor";

export const metadata = {
  title: "Input Jurnal Umum Manual | Garda BUJP ERP",
};

export default async function NewJournalEntryPage() {
  const { data: accounts } = await getAccounts();

  return (
    <div className="space-y-6">
      <AccountingSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-[#f59e0b]" />
          Input Jurnal Umum Double-Entry Manual (ACC-04)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Formulir penyesuaian memorial akuntansi dengan kalkulasi live balance dan eksekusi atomik via RPC PostgreSQL.
        </p>
      </div>

      <JournalEditor accounts={accounts} />
    </div>
  );
}
