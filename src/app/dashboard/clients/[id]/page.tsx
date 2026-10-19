import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Plus, ArrowRight } from "lucide-react";
import { getClientById } from "../actions";
import { ClientForm } from "../components/ClientForm";
import { ClientSubnav } from "@/components/layout/ClientSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const { data: client, error } = await getClientById(id);

  if (error || !client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ClientSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#f59e0b]" />
          Detail & Edit Klien Mitra: {client.company_name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Perbarui informasi kontrak, alamat penagihan faktur, atau kelola pos jaga yang bernaung di bawah mitra ini.
        </p>
      </div>

      {/* Form */}
      <ClientForm initialData={client} mode="edit" />

      {/* Linked Sites Section */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              Pos Jaga (Sites) Terdaftar ({client.sites.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Titik lokasi pengamanan fisik yang dimiliki oleh {client.company_name}
            </CardDescription>
          </div>
          <Link href={`/dashboard/sites/new?clientId=${client.id}`}>
            <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />
              Tambah Pos Jaga
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {client.sites.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4">
              Belum ada lokasi pos jaga yang terdaftar untuk klien ini. Klik &quot;Tambah Pos Jaga&quot; di atas untuk mendaftarkan pos.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {client.sites.map((site) => (
                <div
                  key={site.id}
                  className="p-4 rounded-lg bg-[#111827] border border-[#374151] hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2937] text-gray-300 border border-[#374151]">
                      {site.code}
                    </span>
                    <Badge
                      className={
                        site.status === "active"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : "bg-gray-800 text-gray-400"
                      }
                    >
                      {site.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-white mt-2">{site.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">{site.address}</p>

                  <div className="mt-3 pt-3 border-t border-[#374151] flex items-center justify-between text-xs text-gray-300">
                    <span>Kuota: {site.required_personnel_per_shift} satpam/shift</span>
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="text-[#f59e0b] hover:text-[#d97706] font-medium flex items-center gap-1"
                    >
                      Detail
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
