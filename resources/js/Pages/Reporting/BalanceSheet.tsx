import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import { Printer } from 'lucide-react';

interface Props {
    report: {
        assets: any[];
        total_asset: number;
        liabilities: any[];
        total_liability: number;
        equities: any[];
        retained_earnings: number;
        total_equity: number;
        total_liability_equity: number;
        is_balanced: boolean;
    };
    filters: {
        as_of_date: string;
    };
}

export default function BalanceSheet({ report, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            as_of_date: (form.elements.namedItem('as_of_date') as HTMLInputElement).value,
        };
        
        router.get(route('reports.balance_sheet'), data, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Neraca (Balance Sheet)">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Laporan Posisi Keuangan (Neraca)</h2>
                        <p className="text-sm text-fg-muted mt-1">Laporan aset, kewajiban, dan ekuitas pada tanggal tertentu.</p>
                    </div>
                    <Button variant="secondary" onPress={handlePrint}>
                        <Printer className="size-4 mr-2" /> Cetak
                    </Button>
                </div>

                <Card className="p-4 print:hidden">
                    <form onSubmit={handleFilter} className="flex items-end gap-4">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Per Tanggal</label>
                            <input 
                                type="date" 
                                name="as_of_date"
                                defaultValue={filters.as_of_date}
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
                        <h2 className="text-xl font-bold mt-1">Laporan Posisi Keuangan (Neraca)</h2>
                        <p className="text-fg-muted mt-2">Per Tanggal {formatDate(filters.as_of_date)}</p>
                    </div>

                    {!report.is_balanced && (
                        <div className="bg-danger/10 border border-danger text-danger p-4 rounded mb-6 text-center font-bold print:hidden">
                            PERINGATAN: NERACA TIDAK SEIMBANG! (Selisih: {formatCurrency(Math.abs(report.total_asset - report.total_liability_equity))})
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: ASSETS */}
                        <div>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className="font-bold text-lg pt-4 pb-2 border-b-2 border-line-strong text-accent">
                                            ASET (ASSETS)
                                        </td>
                                    </tr>
                                    {report.assets.map((acc, idx) => (
                                        <tr key={idx} className="border-b border-line-subtle border-dashed">
                                            <td className="py-2 pl-4">{acc.code} - {acc.name}</td>
                                            <td className="py-2 text-right font-mono">{formatCurrency(acc.net)}</td>
                                        </tr>
                                    ))}
                                    
                                    <tr className="bg-canvas-subtle print:bg-gray-100 font-bold border-t-2 border-line-strong">
                                        <td className="py-3 px-4 uppercase text-accent">Total Aset</td>
                                        <td className="py-3 px-4 text-right font-mono text-lg">{formatCurrency(report.total_asset)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
                        <div>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className="font-bold text-lg pt-4 pb-2 border-b-2 border-line-strong text-warning">
                                            KEWAJIBAN (LIABILITIES)
                                        </td>
                                    </tr>
                                    {report.liabilities.map((acc, idx) => (
                                        <tr key={idx} className="border-b border-line-subtle border-dashed">
                                            <td className="py-2 pl-4">{acc.code} - {acc.name}</td>
                                            <td className="py-2 text-right font-mono">{formatCurrency(acc.net)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-canvas-subtle print:bg-gray-100 font-bold border-b border-line-strong">
                                        <td className="py-2 px-4">TOTAL KEWAJIBAN</td>
                                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(report.total_liability)}</td>
                                    </tr>
                                    
                                    <tr><td colSpan={2}>&nbsp;</td></tr>
                                    
                                    <tr>
                                        <td colSpan={2} className="font-bold text-lg pt-4 pb-2 border-b-2 border-line-strong text-success">
                                            EKUITAS (EQUITY)
                                        </td>
                                    </tr>
                                    {report.equities.map((acc, idx) => (
                                        <tr key={idx} className="border-b border-line-subtle border-dashed">
                                            <td className="py-2 pl-4">{acc.code} - {acc.name}</td>
                                            <td className="py-2 text-right font-mono">{formatCurrency(acc.net)}</td>
                                        </tr>
                                    ))}
                                    {report.retained_earnings !== 0 && (
                                        <tr className="border-b border-line-subtle border-dashed">
                                            <td className="py-2 pl-4">Laba Ditahan / Laba Berjalan</td>
                                            <td className="py-2 text-right font-mono">{formatCurrency(report.retained_earnings)}</td>
                                        </tr>
                                    )}
                                    <tr className="bg-canvas-subtle print:bg-gray-100 font-bold border-b border-line-strong">
                                        <td className="py-2 px-4">TOTAL EKUITAS</td>
                                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(report.total_equity)}</td>
                                    </tr>

                                    <tr className="bg-canvas-subtle print:bg-gray-100 font-bold border-t-2 border-line-strong">
                                        <td className="py-3 px-4 uppercase text-warning">Total Kewajiban & Ekuitas</td>
                                        <td className="py-3 px-4 text-right font-mono text-lg">{formatCurrency(report.total_liability_equity)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
