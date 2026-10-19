import { InvoiceSubnav } from "@/components/layout/InvoiceSubnav";
import { InvoiceForm } from "@/app/dashboard/invoices/components/InvoiceForm";
import { getInvoiceFormData } from "@/app/dashboard/invoices/actions";

export default async function NewInvoicePage() {
  const { clients, error } = await getInvoiceFormData();

  return (
    <div className="space-y-6">
      <InvoiceSubnav />
      {error ? (
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
          Gagal memuat form invoice: {error}
        </div>
      ) : (
        <InvoiceForm clients={clients} />
      )}
    </div>
  );
}
