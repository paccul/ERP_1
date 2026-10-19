import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getInvoiceById } from "@/app/dashboard/invoices/actions";
import { invoiceStatusLabels, type InvoiceStatus } from "@/lib/validations/invoice";
import { InvoiceSubnav } from "@/components/layout/InvoiceSubnav";
import { PrintInvoiceButton } from "@/app/dashboard/invoices/components/PrintInvoiceButton";
import { InvoiceActionsClient } from "@/app/dashboard/invoices/components/InvoiceActionsClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const { invoice, institution, error } = await getInvoiceById(id);

  if (error || !invoice) {
    notFound();
  }

  let statusBadge = "bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]/40";
  if (invoice.status === "issued") {
    statusBadge = "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40";
  } else if (invoice.status === "paid") {
    statusBadge = "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40";
  } else if (invoice.status === "cancelled") {
    statusBadge = "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40";
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <InvoiceSubnav />

        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/invoices">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#9ca3af] hover:text-[#f9fafb]">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#f59e0b]" />
              Faktur Tagihan: {invoice.invoice_number}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge}`}>
              {invoiceStatusLabels[invoice.status as InvoiceStatus] || invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PrintInvoiceButton />
            <InvoiceActionsClient
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoice_number}
              status={invoice.status}
            />
          </div>
        </div>
      </div>

      {/* Official Printable Invoice Sheet */}
      <Card className="bg-[#ffffff] text-[#111827] border-[#e5e7eb] max-w-4xl mx-auto shadow-2xl p-8 print:shadow-none print:border-none print:p-0 print:m-0">
        <CardContent className="p-0 space-y-6">
          {/* Header & Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-[#111827] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-wider text-[#111827]">
                  {institution?.company_name || "PT GARDA BUJP UTAMA INDONESIA"}
                </span>
              </div>
              <p className="text-xs text-[#4b5563] mt-1 max-w-md">
                {institution?.address || "Gedung Sentra Operasional BUJP Lt. 3, Jl. Protokol Polri No. 45, Jakarta Selatan"}
              </p>
              <div className="text-xs text-[#4b5563] mt-1 space-x-3">
                <span>NPWP: <strong>{institution?.npwp || "01.234.567.8-012.000"}</strong></span>
                <span>Izin Mabes Polri: <strong>{institution?.license_number || "SI/0091/MABES/2023"}</strong></span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black tracking-widest text-[#111827] uppercase">
                FAKTUR TAGIHAN
              </div>
              <div className="text-sm font-mono font-bold text-[#b45309] mt-0.5">
                NO: {invoice.invoice_number}
              </div>
              <div className="text-xs text-[#6b7280] mt-1">
                Status: <strong className="uppercase text-[#111827]">{invoice.status}</strong>
              </div>
            </div>
          </div>

          {/* Invoice Information & Bill To */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-1">
                Tagihan Kepada:
              </div>
              <div className="font-bold text-base text-[#111827]">
                {invoice.client?.company_name || "Klien Mitra"}
              </div>
              <p className="text-xs text-[#4b5563] mt-0.5">
                {invoice.client?.billing_address || "Alamat Kantor Mitra Pengamanan"}
              </p>
              <p className="text-xs text-[#4b5563] mt-0.5">
                NPWP: {invoice.client?.npwp || "-"}
              </p>
              <p className="text-xs text-[#4b5563] mt-0.5">
                PIC: {invoice.client?.pic_name || "-"} ({invoice.client?.pic_phone || "-"})
              </p>
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-xs text-[#6b7280]">Periode Penempatan: </span>
                <span className="font-semibold text-[#111827]">
                  {invoice.period_month
                    ? format(new Date(invoice.period_month), "MMMM yyyy", { locale: localeId })
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6b7280]">Tanggal Terbit: </span>
                <span className="font-semibold text-[#111827]">
                  {invoice.created_at
                    ? format(new Date(invoice.created_at), "dd MMMM yyyy", { locale: localeId })
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6b7280]">Jatuh Tempo: </span>
                <span className="font-bold text-[#b45309]">
                  {invoice.due_date
                    ? format(new Date(invoice.due_date), "dd MMMM yyyy", { locale: localeId })
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Services */}
          <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <TableRow className="border-b border-[#e5e7eb]">
                  <TableHead className="w-12 text-center text-xs font-bold text-[#374151]">No</TableHead>
                  <TableHead className="text-xs font-bold text-[#374151]">Uraian Jasa Penempatan Satpam</TableHead>
                  <TableHead className="text-center text-xs font-bold text-[#374151]">Personel</TableHead>
                  <TableHead className="text-right text-xs font-bold text-[#374151]">Tarif Satuan (Rp)</TableHead>
                  <TableHead className="text-right text-xs font-bold text-[#374151]">Jumlah (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line, idx) => (
                  <TableRow key={line.id} className="border-b border-[#e5e7eb]/80">
                    <TableCell className="text-center font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm text-[#111827]">
                        Pos Jaga / Site: {line.site?.name || "Pos Pengamanan"}
                      </div>
                      <div className="text-xs text-[#6b7280]">
                        Kode Lokasi: {line.site?.code || "-"} | Alamat: {line.site?.address || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {line.personnel_count} Orang
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      Rp {(line.rate_per_personnel || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-[#111827]">
                      Rp {(line.line_total || 0).toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Subtotal & Tax Calculation */}
          <div className="flex justify-between items-start gap-8 pt-2">
            <div className="space-y-3 flex-1">
              <div className="p-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs space-y-1.5">
                <div className="font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-[#b45309]" />
                  Instruksi Pembayaran Transfer Bank:
                </div>
                <div className="text-[#374151]">
                  Bank: <strong>Bank Central Asia (BCA)</strong>
                </div>
                <div className="text-[#374151]">
                  No. Rekening: <strong className="font-mono text-sm">882-019-3344</strong>
                </div>
                <div className="text-[#374151]">
                  Atas Nama: <strong>PT GARDA BUJP UTAMA INDONESIA</strong>
                </div>
                <p className="text-[11px] text-[#6b7280] pt-1">
                  * Cantumkan nomor faktur ({invoice.invoice_number}) pada berita transfer.
                </p>
              </div>
            </div>

            <div className="w-80 space-y-2 text-sm">
              <div className="flex justify-between text-[#4b5563]">
                <span>Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-mono text-[#111827]">Rp {(invoice.subtotal || 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[#4b5563]">
                <span>PPN ({invoice.ppn_rate || 11}%):</span>
                <span className="font-mono text-[#111827]">Rp {(invoice.ppn_amount || 0).toLocaleString("id-ID")}</span>
              </div>
              {(invoice.pph23_amount || 0) > 0 && (
                <div className="flex justify-between text-[#dc2626]">
                  <span>Potongan PPh 23:</span>
                  <span className="font-mono">- Rp {(invoice.pph23_amount || 0).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#111827] pt-2 border-t-2 border-[#111827]">
                <span>TOTAL DITAGIHKAN:</span>
                <span className="font-mono text-lg text-[#b45309]">
                  Rp {(invoice.total_amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#e5e7eb] text-xs">
            <div className="text-center">
              <p className="text-[#6b7280]">Diterima oleh Klien Mitra,</p>
              <div className="h-20" />
              <p className="font-bold text-[#111827]">({invoice.client?.pic_name || "Manajemen Mitra"})</p>
              <p className="text-[#6b7280]">{invoice.client?.company_name || "PT Klien Mitra"}</p>
            </div>

            <div className="text-center">
              <p className="text-[#6b7280]">Hormat Kami,</p>
              <p className="font-semibold text-[#111827]">{institution?.company_name || "PT GARDA BUJP UTAMA"}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-[#9ca3af] italic border border-dashed border-[#9ca3af] px-3 py-1 rounded">
                  [METERAI & TTD RESMI]
                </span>
              </div>
              <p className="font-bold text-[#111827] underline">KAPTEN (PURN) H. ACHMAD SURYA</p>
              <p className="text-[#6b7280]">Direktur Utama & Operasional</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
