import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import { Printer } from 'lucide-react';

interface Props {
    cashFlows: any[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function CashFlow({ cashFlows, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            start_date: (form.elements.namedItem('start_date') as HTMLInputElement).value,
            end_date: (form.elements.namedItem('end_date') as HTMLInputElement).value,
        };
        
        router.get(route('reports.cash_flow'), data, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const totalMasuk = cashFlows.reduce((sum, c) => sum + Number(c.debit), 0);
    const totalKeluar = cashFlows.reduce((sum, c) => sum + Number(c.credit), 0);
    const net = totalMasuk - totalKeluar;

    return (
        <AppLayout title="Laporan Arus Kas">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Laporan Arus Kas</h2>
                        <p className="text-sm text-fg-muted mt-1">Mutasi akun kas dan bank pada periode tertentu.</p>
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
                        <h2 className="text-xl font-bold mt-1">Laporan Arus Kas</h2>
                        <p className="text-fg-muted mt-2">Periode {formatDate(filters.start_date)} - {formatDate(filters.end_date)}</p>
                    </div>

                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-line-strong text-left">
                                <th className="py-2">Tanggal</th>
                                <th className="py-2">Keterangan</th>
                                <th className="py-2 text-right">Uang Masuk (Db)</th>
                                <th className="py-2 text-right">Uang Keluar (Kr)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cashFlows.map((c, i) => (
                                <tr key={i} className="border-b border-line-subtle border-dashed">
                                    <td className="py-2">{formatDate(c.date)}</td>
                                    <td className="py-2">{c.description} - {c.memo}</td>
                                    <td className="py-2 text-right text-success font-mono">{c.debit > 0 ? formatCurrency(c.debit) : '-'}</td>
                                    <td className="py-2 text-right text-danger font-mono">{c.credit > 0 ? formatCurrency(c.credit) : '-'}</td>
                                </tr>
                            ))}
                            {cashFlows.length === 0 && (
                                <tr><td colSpan={4} className="py-8 text-center text-fg-muted">Tidak ada mutasi arus kas pada periode ini.</td></tr>
                            )}
                            <tr className="border-t-2 border-line-strong font-bold bg-canvas-subtle print:bg-gray-100">
                                <td colSpan={2} className="py-3 px-4">TOTAL</td>
                                <td className="py-3 text-right text-success font-mono">{formatCurrency(totalMasuk)}</td>
                                <td className="py-3 text-right text-danger font-mono">{formatCurrency(totalKeluar)}</td>
                            </tr>
                            <tr className="border-b-4 border-line-strong font-bold text-lg">
                                <td colSpan={2} className="py-3 px-4 uppercase">{net >= 0 ? 'Kenaikan Kas Bersih' : 'Penurunan Kas Bersih'}</td>
                                <td colSpan={2} className={`py-3 text-right font-mono ${net >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(net)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
