import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { ItemForm } from "@/app/dashboard/logistics/components/ItemForm";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <LogisticsSubnav />
      <ItemForm />
    </div>
  );
}
