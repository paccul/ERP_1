import Link from "next/link";
import {
  QrCode,
  MapPin,
  Building2,
  Printer,
  Search,
  ExternalLink,
  Shield,
} from "lucide-react";
import { getCheckpoints } from "./actions";
import { getSites } from "../sites/actions";
import { ClientSubnav } from "@/components/layout/ClientSubnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckpointModal } from "./components/CheckpointModal";
import { DeleteCheckpointButton } from "./components/DeleteCheckpointButton";

export const dynamic = "force-dynamic";

interface CheckpointsPageProps {
  searchParams: Promise<{
    siteId?: string;
  }>;
}

export default async function CheckpointsPage({ searchParams }: CheckpointsPageProps) {
  const params = await searchParams;
  const siteId = params.siteId || "all";

  const [{ data: checkpoints, error }, { data: sites }] = await Promise.all([
    getCheckpoints(siteId),
    getSites(),
  ]);

  const activeSite = sites.find((s) => s.id === siteId);

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <ClientSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <QrCode className="h-6 w-6 text-[#f59e0b]" />
            Master Checkpoint Patroli & Barcode QR (SEC-07)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manajemen titik rute kontrol patroli satpam, urutan jalur, dan pencetakan lembar stiker QR Code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CheckpointModal
            sites={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
            defaultSiteId={siteId !== "all" ? siteId : undefined}
          />
        </div>
      </div>

      {/* Filter by Site */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardContent className="p-4">
          <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label htmlFor="siteId" className="sr-only">
                Pilih Lokasi Pos Jaga
              </label>
              <select
                id="siteId"
                name="siteId"
                defaultValue={siteId}
                className="h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              >
                <option value="all">Semua Pos Jaga ({sites.length} Lokasi Terdaftar)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name} ({s.client?.company_name})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline" className="border-[#374151] text-white hover:bg-[#111827] w-full sm:w-auto">
              Pilih Lokasi
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Checkpoint List & Printable QR Cards */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#f59e0b]" />
              Daftar Titik Rute Patroli ({checkpoints.length} Titik)
            </CardTitle>
            <CardDescription className="text-gray-400">
              {activeSite
                ? `Menampilkan titik kontrol patroli untuk ${activeSite.name}`
                : "Menampilkan titik kontrol patroli di seluruh pos jaga aktif"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : checkpoints.length === 0 ? (
            <div className="p-12 text-center">
              <QrCode className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">Belum ada titik checkpoint</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Tambahkan titik kontrol rute patroli pertama untuk pos jaga ini.
              </p>
              <CheckpointModal
                sites={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
                defaultSiteId={siteId !== "all" ? siteId : undefined}
              />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#374151] hover:bg-transparent">
                    <TableHead className="w-16 text-center text-gray-300">Urutan</TableHead>
                    <TableHead className="text-gray-300">Kode & Nama Checkpoint</TableHead>
                    <TableHead className="text-gray-300">Lokasi Pos Jaga (Site)</TableHead>
                    <TableHead className="text-gray-300">Kode Hash QR Scanner</TableHead>
                    <TableHead className="text-right text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkpoints.map((cp) => (
                    <TableRow key={cp.id} className="border-[#374151] hover:bg-[#111827]/50">
                      <TableCell className="text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-bold">
                          {cp.patrol_order}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-white">{cp.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">Kode: {cp.code}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-200 font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-400" />
                          {cp.site?.name || "-"}
                        </div>
                        {cp.site?.client && (
                          <div className="text-xs text-gray-500 mt-0.5">{cp.site.client.company_name}</div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-[#111827] px-2 py-1 rounded text-purple-300 border border-[#374151]">
                            {cp.qr_code_hash}
                          </code>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DeleteCheckpointButton id={cp.id} name={cp.name} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Cards Visual Section */}
      {checkpoints.length > 0 && (
        <Card className="bg-[#030712] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Printer className="h-5 w-5 text-[#f59e0b]" />
              Pratinjau Kartu Label Patroli QR (Siap Cetak Stiker)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Format stiker standar patroli satpam BUJP untuk ditempel di tembok titik patroli pos jaga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="p-4 rounded-xl bg-white text-black border-2 border-black flex flex-col items-center text-center shadow-lg"
                >
                  <div className="text-[10px] font-black tracking-widest uppercase text-gray-700">
                    GARDA ERP SECURITY PATROL
                  </div>
                  <div className="font-extrabold text-sm text-black mt-1 line-clamp-1">
                    {cp.site?.name || "POS JAGA"}
                  </div>

                  {/* QR Pattern Placeholder Box */}
                  <div className="my-3 p-3 bg-white border-2 border-black rounded-lg flex flex-col items-center justify-center">
                    <QrCode className="h-24 w-24 text-black" />
                    <span className="font-mono text-[9px] font-bold mt-1 text-gray-800">
                      {cp.code} • RUTE #{cp.patrol_order}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-black uppercase">{cp.name}</div>
                  <div className="text-[9px] font-mono text-gray-600 mt-0.5 line-clamp-1">
                    HASH: {cp.qr_code_hash.substring(0, 16)}...
                  </div>
                  <div className="text-[8px] text-gray-500 mt-2 border-t border-gray-300 pt-1 w-full">
                    Scan via Aplikasi Satpam Garda
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
