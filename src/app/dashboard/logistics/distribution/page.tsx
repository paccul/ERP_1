import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { DistributionForm } from "@/app/dashboard/logistics/components/DistributionForm";
import { getDistributionFormMetadata } from "@/app/dashboard/logistics/actions";

export default async function DistributionPage() {
  const { items, personnel, sites, error } = await getDistributionFormMetadata();

  return (
    <div className="space-y-6">
      <LogisticsSubnav />
      {error ? (
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
          Gagal memuat data formulir: {error}
        </div>
      ) : (
        <DistributionForm items={items} personnel={personnel} sites={sites} />
      )}
    </div>
  );
}
