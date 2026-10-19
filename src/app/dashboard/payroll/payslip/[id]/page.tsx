import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, Shield } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getPayslipById } from "@/app/dashboard/payroll/actions";
import { PayrollSubnav } from "@/components/layout/PayrollSubnav";
import { PrintInvoiceButton } from "@/app/dashboard/invoices/components/PrintInvoiceButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PayslipDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PayslipDetailPage({ params }: PayslipDetailPageProps) {
  const { id } = await params;
  const { payslip, institution, periodMonth, error } = await getPayslipById(id);

  if (error || !payslip) {
    notFound();
  }

  const grossSalary =
    (payslip.basic_salary || 0) +
    (payslip.allowance_position || 0) +
    (payslip.overtime_amount || 0);

  const totalDeductions =
    (payslip.bpjs_kesehatan || 0) +
    (payslip.bpjs_ketenagakerjaan || 0) +
    (payslip.pph21_amount || 0) +
    (payslip.uniform_deduction || 0);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PayrollSubnav />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/payroll/${payslip.payroll_run_id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#9ca3af] hover:text-[#f9fafb]">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke Daftar Periode
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#f9fafb] flex items-center gap-2">
              <Banknote className="h-6 w-6 text-[#f59e0b]" />
              Slip Gaji: {payslip.personnel?.full_name || "Anggota Satpam"}
            </h1>
          </div>
          <PrintInvoiceButton />
        </div>
      </div>

      {/* Official Printable Payslip Sheet */}
      <Card className="bg-[#ffffff] text-[#111827] border-[#e5e7eb] max-w-2xl mx-auto shadow-2xl p-8 print:shadow-none print:border-none print:p-0 print:m-0">
        <CardContent className="p-0 space-y-6">
          {/* Header & Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-[#111827] pb-4">
            <div>
              <div className="text-xl font-extrabold tracking-wider text-[#111827]">
                {institution?.company_name || "PT GARDA BUJP UTAMA INDONESIA"}
              </div>
              <p className="text-xs text-[#4b5563] mt-0.5">
                {institution?.address || "Gedung Sentra Operasional BUJP, Jakarta Selatan"}
              </p>
              <div className="text-xs text-[#4b5563] mt-0.5">
                Izin Operasional Mabes Polri: {institution?.license_number || "SI/0091/MABES/2023"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black tracking-widest text-[#111827] uppercase">
                SLIP GAJI SATPAM
              </div>
              <div className="text-xs font-semibold text-[#b45309] mt-0.5">
                Periode:{" "}
                {periodMonth
                  ? format(new Date(periodMonth), "MMMM yyyy", { locale: localeId })
                  : "-"}
              </div>
              <div className="text-[11px] text-[#6b7280] mt-0.5">CONFIDENTIAL & RESMI</div>
            </div>
          </div>

          {/* Personnel Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#f9fafb] p-3.5 rounded-lg border border-[#e5e7eb]">
            <div className="space-y-1">
              <div>
                <span className="text-[#6b7280]">Nama Lengkap:</span>{" "}
                <strong className="text-[#111827]">{payslip.personnel?.full_name || "-"}</strong>
              </div>
              <div>
                <span className="text-[#6b7280]">No. KTA / NIP:</span>{" "}
                <span className="font-mono text-[#111827]">{payslip.personnel?.kta_number || "-"}</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Jabatan:</span>{" "}
                <span className="text-[#111827]">{payslip.personnel?.position || "Anggota Satpam"}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-[#6b7280]">Lokasi Penempatan:</span>{" "}
                <strong className="text-[#111827]">{payslip.site?.name || "Pos Pusat"}</strong>
              </div>
              <div>
                <span className="text-[#6b7280]">Rekening Bank:</span>{" "}
                <span className="font-mono text-[#111827]">
                  {payslip.personnel?.bank_name || "BCA"} - {payslip.personnel?.bank_account_number || "8820193344"}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280]">Status Pembayaran:</span>{" "}
                <strong className="text-[#15803d]">DITRANSFER BANK</strong>
              </div>
            </div>
          </div>

          {/* Rincian Penghasilan vs Potongan */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            {/* Kolom Penerimaan */}
            <div className="border border-[#e5e7eb] rounded-lg p-3 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#15803d] border-b border-[#e5e7eb] pb-1">
                A. Penghasilan / Penerimaan
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Gaji Pokok:</span>
                <span className="font-mono font-medium text-[#111827]">
                  Rp {(payslip.basic_salary || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Tunjangan Jabatan / Regu:</span>
                <span className="font-mono font-medium text-[#111827]">
                  Rp {(payslip.allowance_position || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Uang Lembur (Overtime):</span>
                <span className="font-mono font-medium text-[#111827]">
                  Rp {(payslip.overtime_amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#e5e7eb] pt-2 text-[#111827]">
                <span>Total Bruto (A):</span>
                <span className="font-mono">Rp {grossSalary.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Kolom Potongan */}
            <div className="border border-[#e5e7eb] rounded-lg p-3 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#dc2626] border-b border-[#e5e7eb] pb-1">
                B. Potongan / Iuran
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">BPJS Kesehatan (1%):</span>
                <span className="font-mono font-medium text-[#dc2626]">
                  - Rp {(payslip.bpjs_kesehatan || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">BPJS Ketenagakerjaan (2%):</span>
                <span className="font-mono font-medium text-[#dc2626]">
                  - Rp {(payslip.bpjs_ketenagakerjaan || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">PPh Pasal 21:</span>
                <span className="font-mono font-medium text-[#dc2626]">
                  - Rp {(payslip.pph21_amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Potongan Seragam/Kaporlap:</span>
                <span className="font-mono font-medium text-[#dc2626]">
                  - Rp {(payslip.uniform_deduction || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#e5e7eb] pt-2 text-[#dc2626]">
                <span>Total Potongan (B):</span>
                <span className="font-mono">- Rp {totalDeductions.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Net Take-Home Pay Banner */}
          <div className="p-4 rounded-lg bg-[#f0fdf4] border-2 border-[#16a34a] flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-[#15803d]">
                GAJI BERSIH DITERIMA (TAKE-HOME PAY):
              </div>
              <div className="text-[11px] text-[#4b5563] mt-0.5">
                Total Penerimaan (A) dikurangi Total Potongan (B)
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#15803d]">
              Rp {(payslip.net_salary || 0).toLocaleString("id-ID")}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#e5e7eb] text-xs">
            <div className="text-center">
              <p className="text-[#6b7280]">Penerima,</p>
              <div className="h-14" />
              <p className="font-bold text-[#111827]">({payslip.personnel?.full_name || "Anggota Satpam"})</p>
              <p className="text-[#6b7280]">Personel Pengamanan</p>
            </div>

            <div className="text-center">
              <p className="text-[#6b7280]">Finance & Payroll Dept,</p>
              <div className="h-14" />
              <p className="font-bold text-[#111827] underline">SARAH WULANDARI, S.E.</p>
              <p className="text-[#6b7280]">{institution?.company_name || "PT GARDA BUJP UTAMA"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
