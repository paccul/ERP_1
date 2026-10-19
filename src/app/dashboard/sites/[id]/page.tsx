import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Users, QrCode, Plus, ArrowRight, Shield } from "lucide-react";
import { getSiteById, getClientsDropdown } from "../actions";
import { SiteForm } from "../components/SiteForm";
import { ClientSubnav } from "@/components/layout/ClientSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface EditSitePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSitePage({ params }: EditSitePageProps) {
  const { id } = await params;
  const [{ data: site, error }, clients] = await Promise.all([
    getSiteById(id),
    getClientsDropdown(),
  ]);

  if (error || !site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ClientSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MapPin className="h-6 w-6 text-[#f59e0b]" />
          Detail & Edit Pos Jaga: {site.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Perbarui kuota satpam, tarif penagihan per pos, atau kelola titik rute checkpoint patroli QR.
        </p>
      </div>

      <SiteForm initialData={site} clients={clients} mode="edit" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personnel Assigned to this Site */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Personel Satpam di Pos Ini ({site.personnel.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Anggota satpam yang saat ini aktif dialokasikan pada {site.name}
              </CardDescription>
            </div>
            <Link href={`/dashboard/personnel/new`}>
              <Button size="sm" variant="outline" className="border-[#374151] text-gray-300 hover:bg-[#1f2937]">
                <Plus className="h-4 w-4 mr-1.5" />
                Plot Anggota
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {site.personnel.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4">
                Belum ada personel satpam yang ditempatkan di lokasi pos jaga ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {site.personnel.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#111827] border border-[#374151]"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        {p.full_name}
                        <Badge className="bg-[#1f2937] text-gray-300 border-[#374151] text-[10px]">
                          {p.position}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        NIK: {p.nik} • Gada: {p.gada_level || "Belum Ada"}
                      </div>
                    </div>
                    <Link href={`/dashboard/personnel/${p.id}`}>
                      <Button size="sm" variant="ghost" className="text-xs text-[#f59e0b] hover:text-[#d97706]">
                        Lihat Profil
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkpoints for this site */}
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-400" />
                Titik Patroli / Checkpoint ({site.checkpoints.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Barcode unik QR titik kontrol patroli satpam di area pos jaga
              </CardDescription>
            </div>
            <Link href={`/dashboard/checkpoints?siteId=${site.id}`}>
              <Button size="sm" className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />
                Kelola QR
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {site.checkpoints.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4">
                Belum ada rute checkpoint patroli yang dibuat untuk pos jaga ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {site.checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#111827] border border-[#374151]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-950/80 text-purple-400 border border-purple-800 text-xs font-bold">
                        {cp.patrol_order}
                      </span>
                      <div>
                        <div className="font-medium text-white text-sm">{cp.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">
                          Kode: {cp.code} • Hash: {cp.qr_code_hash.substring(0, 18)}...
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
