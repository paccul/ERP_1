import { PayrollSubnav } from "@/components/layout/PayrollSubnav";
import { PayrollForm } from "@/app/dashboard/payroll/components/PayrollForm";
import { getPayrollGenerationData } from "@/app/dashboard/payroll/actions";

export default async function NewPayrollPage() {
  const { personnelList, error } = await getPayrollGenerationData();

  return (
    <div className="space-y-6">
      <PayrollSubnav />
      {error ? (
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
          Gagal memuat form penggajian: {error}
        </div>
      ) : (
        <PayrollForm personnelList={personnelList} />
      )}
    </div>
  );
}
