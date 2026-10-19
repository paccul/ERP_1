import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import { Printer } from 'lucide-react';

interface Props {
    net_income: number;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function Equity({ net_income, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            start_date: (form.elements.namedItem('start_date') as HTMLInputElement).value,
            end_date: (form.elements.namedItem('end_date') as HTMLInputElement).value,
        };
        
        router.get(route('reports.equity'), data, { preserveState: true });
    };

    return (
        <AppLayout title="Laporan Perubahan Ekuitas">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Laporan Perubahan Ekuitas</h2>
                        <p className="text-sm text-fg-muted mt-1">Pergerakan modal/ekuitas perusahaan.</p>
                    </div>
                    <Button variant="secondary" onPress={() => window.print()}>
                        <Printer className="size-4 mr-2" /> Cetak
                    </Button>
                </div>

                <Card className="p-4 print:hidden">
                    <form onSubmit={handleFilter} className="flex items-end gap-4">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Mulai Tanggal</label>
                            <input type="date" name="start_date" defaultValue={filters.start_date} className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2" required />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Sampai Tanggal</label>
                            <input type="date" name="end_date" defaultValue={filters.end_date} className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2" required />
                        </div>
                        <Button type="submit" variant="primary">Tampilkan</Button>
                    </form>
                </Card>

                <div className="bg-canvas print:bg-white border border-line-subtle p-8 rounded-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase tracking-wider">PT Garda Global Semesta</h1>
                        <h2 className="text-xl font-bold mt-1">Laporan Perubahan Ekuitas</h2>
                        <p className="text-fg-muted mt-2">Periode {formatDate(filters.start_date)} - {formatDate(filters.end_date)}</p>
                    </div>
                    
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-line-subtle border-dashed">
                                <td className="py-2">Saldo Modal Awal</td>
                                <td className="py-2 text-right font-mono">Rp 0,00</td>
                            </tr>
                            <tr className="border-b border-line-subtle border-dashed">
                                <td className="py-2">Laba Bersih Periode Berjalan</td>
                                <td className="py-2 text-right font-mono">{formatCurrency(net_income)}</td>
                            </tr>
                            <tr className="border-b border-line-subtle border-dashed">
                                <td className="py-2">Prive (Penarikan Modal)</td>
                                <td className="py-2 text-right font-mono">Rp 0,00</td>
                            </tr>
                            <tr className="border-t-2 border-line-strong font-bold bg-canvas-subtle text-lg">
                                <td className="py-4 px-4 uppercase">Saldo Ekuitas Akhir</td>
                                <td className="py-4 px-4 text-right font-mono text-accent">{formatCurrency(net_income)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
