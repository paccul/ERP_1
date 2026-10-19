import { notFound } from "next/navigation";
import { LogisticsSubnav } from "@/components/layout/LogisticsSubnav";
import { ItemForm } from "@/app/dashboard/logistics/components/ItemForm";
import { getItemById } from "@/app/dashboard/logistics/actions";

interface EditItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params;
  const { item, error } = await getItemById(id);

  if (error || !item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <LogisticsSubnav />
      <ItemForm initialData={item} />
    </div>
  );
}
