import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface Props {
    run: any;
    payslips: any[];
}

export default function Show({ run, payslips }: Props) {
    const isDraft = run.status === 'draft';
    const isPosted = run.status === 'posted';

    const handlePost = () => {
        if (confirm('Posting payroll ini? Tindakan ini akan menjurnal semua beban dan potongan gaji secara otomatis.')) {
            router.post(route('finance.payrolls.post', run.id));
        }
    };

    return (
        <AppLayout title={`Payroll: ${run.site_name} - ${run.period}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-2" asChild>
                            <Link href={route('finance.payrolls.index')}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-fg-strong flex items-center gap-3">
                                Rincian Payroll
                                {isDraft && <Badge variant="warning">Draft</Badge>}
                                {isPosted && <Badge variant="success">Posted</Badge>}
                            </h2>
                            <p className="text-sm text-fg-muted mt-1">
                                Site: {run.site_name} &bull; Periode: {run.period}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isDraft && (
                            <Button variant="primary" onPress={handlePost}>
                                <CheckCircle className="size-4 mr-2" /> Post / Jurnal
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b-2 border-line-subtle text-xs text-fg-muted uppercase">
                                    <th className="pb-3 px-2">Personil</th>
                                    <th className="pb-3 px-2 text-right">Gaji Pokok</th>
                                    <th className="pb-3 px-2 text-right">Tunjangan</th>
                                    <th className="pb-3 px-2 text-right">Lembur</th>
                                    <th className="pb-3 px-2 text-right text-success">Total Bruto</th>
                                    <th className="pb-3 px-2 text-right text-danger">Potongan BPJS</th>
                                    <th className="pb-3 px-2 text-right text-danger">PPh 21</th>
                                    <th className="pb-3 px-2 text-right text-accent">Take Home Pay</th>
                                    <th className="pb-3 px-2 text-center">Slip Gaji</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payslips.map((slip, idx) => {
                                    const gross = Number(slip.base_salary) + Number(slip.allowance) + Number(slip.overtime);
                                    const bpjs = Number(slip.bpjs_kes) + Number(slip.bpjs_tk);
                                    return (
                                        <tr key={idx} className="border-b border-line-subtle last:border-0 hover:bg-canvas-subtle">
                                            <td className="py-3 px-2">
                                                <div className="font-bold text-sm">{slip.personnel_name}</div>
                                                <div className="text-xs text-fg-muted">{slip.nik}</div>
                                            </td>
                                            <td className="py-3 px-2 text-right font-mono text-sm">{formatCurrency(slip.base_salary)}</td>
                                            <td className="py-3 px-2 text-right font-mono text-sm">{formatCurrency(slip.allowance)}</td>
                                            <td className="py-3 px-2 text-right font-mono text-sm">{formatCurrency(slip.overtime)}</td>
                                            <td className="py-3 px-2 text-right font-mono text-sm font-bold text-success">
                                                {formatCurrency(gross)}
                                            </td>
                                            <td className="py-3 px-2 text-right font-mono text-sm text-danger">
                                                {formatCurrency(bpjs)}
                                            </td>
                                            <td className="py-3 px-2 text-right font-mono text-sm text-danger">
                                                {formatCurrency(slip.pph21)}
                                            </td>
                                            <td className="py-3 px-2 text-right font-mono font-bold text-accent">
                                                {formatCurrency(slip.net_pay)}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <Button variant="ghost" className="px-2" asChild>
                                                    <a href={route('finance.payrolls.payslip', slip.id)} target="_blank" rel="noopener noreferrer">
                                                        <Download className="size-4 text-fg-muted hover:text-accent" />
                                                    </a>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {payslips.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-fg-muted">
                                            Tidak ada data personil pada payroll ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
