import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import { Printer } from 'lucide-react';

interface Props {
    report: {
        revenues: any[];
        total_revenue: number;
        expenses: any[];
        total_expense: number;
        net_income: number;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function IncomeStatement({ report, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            start_date: (form.elements.namedItem('start_date') as HTMLInputElement).value,
            end_date: (form.elements.namedItem('end_date') as HTMLInputElement).value,
        };
        
        router.get(route('reports.income_statement'), data, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Laporan Laba Rugi (Income Statement)">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Laporan Laba Rugi</h2>
                        <p className="text-sm text-fg-muted mt-1">Laporan kinerja keuangan periode berjalan.</p>
                    </div>
                    <Button variant="secondary" onPress={handlePrint}>
                        <Printer className="size-4 mr-2" /> Cetak
                    </Button>
                </div>

                <Card className="p-4 print:hidden">
                    <form onSubmit={handleFilter} className="flex items-end gap-4">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Mulai Tanggal</label>
                            <input 
                                type="date" 
                                name="start_date"
                                defaultValue={filters.start_date}
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Sampai Tanggal</label>
                            <input 
                                type="date" 
                                name="end_date"
                                defaultValue={filters.end_date}
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary">Tampilkan</Button>
                    </form>
                </Card>

                <div className="bg-canvas print:bg-white border border-line-subtle print:border-none p-8 rounded-md print:p-0">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase tracking-wider">PT Garda Global Semesta</h1>
                        <h2 className="text-xl font-bold mt-1">Laporan Laba Rugi</h2>
                        <p className="text-fg-muted mt-2">Untuk periode yang berakhir pada {formatDate(filters.end_date)}</p>
                        <p className="text-xs text-fg-muted">(Mulai: {formatDate(filters.start_date)})</p>
                    </div>

                    <table className="w-full text-sm">
                        <tbody>
                            {/* PENDAPATAN */}
                            <tr>
                                <td colSpan={2} className="font-bold text-lg pt-4 pb-2 border-b border-line-strong text-accent">
                                    PENDAPATAN (REVENUES)
                                </td>
                            </tr>
                            {report.revenues.map((acc, idx) => (
                                <tr key={idx} className="border-b border-line-subtle border-dashed">
                                    <td className="py-2 pl-4">{acc.code} - {acc.name}</td>
                                    <td className="py-2 text-right font-mono">{formatCurrency(acc.net)}</td>
                                </tr>
                            ))}
                            <tr className="bg-canvas-subtle print:bg-gray-100 font-bold">
                                <td className="py-3 px-4">TOTAL PENDAPATAN</td>
                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(report.total_revenue)}</td>
                            </tr>
                            
                            <tr><td colSpan={2}>&nbsp;</td></tr>

                            {/* BEBAN */}
                            <tr>
                                <td colSpan={2} className="font-bold text-lg pt-4 pb-2 border-b border-line-strong text-danger">
                                    BEBAN (EXPENSES)
                                </td>
                            </tr>
                            {report.expenses.map((acc, idx) => (
                                <tr key={idx} className="border-b border-line-subtle border-dashed">
                                    <td className="py-2 pl-4">{acc.code} - {acc.name}</td>
                                    <td className="py-2 text-right font-mono">{formatCurrency(acc.net)}</td>
                                </tr>
                            ))}
                            <tr className="bg-canvas-subtle print:bg-gray-100 font-bold">
                                <td className="py-3 px-4">TOTAL BEBAN</td>
                                <td className="py-3 px-4 text-right font-mono text-danger">({formatCurrency(report.total_expense)})</td>
                            </tr>

                            <tr><td colSpan={2}>&nbsp;</td></tr>

                            {/* LABA/RUGI BERSIH */}
                            <tr className="border-t-4 border-b-4 border-line-strong text-lg font-bold">
                                <td className="py-4 px-4 uppercase">
                                    {report.net_income >= 0 ? 'Laba Bersih (Net Income)' : 'Rugi Bersih (Net Loss)'}
                                </td>
                                <td className={`py-4 px-4 text-right font-mono ${report.net_income >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatCurrency(report.net_income)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
