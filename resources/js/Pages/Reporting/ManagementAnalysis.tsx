import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import { Printer, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
    analysis: any[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function ManagementAnalysis({ analysis, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            start_date: (form.elements.namedItem('start_date') as HTMLInputElement).value,
            end_date: (form.elements.namedItem('end_date') as HTMLInputElement).value,
        };
        
        router.get(route('reports.management'), data, { preserveState: true });
    };

    const totalRevenue = analysis.reduce((sum, item) => sum + Number(item.revenue), 0);
    const totalProfit = analysis.reduce((sum, item) => sum + Number(item.profit), 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
        <AppLayout title="Analisa Manajemen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Analisa Akuntansi Manajemen</h2>
                        <p className="text-sm text-fg-muted mt-1">Analisa Profitabilitas per Lokasi Jaga (Site).</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                    <Card className="p-4 bg-canvas-subtle">
                        <p className="text-sm text-fg-muted font-bold uppercase">Total Pendapatan (Keseluruhan Site)</p>
                        <p className="text-2xl font-bold font-mono mt-2">{formatCurrency(totalRevenue)}</p>
                    </Card>
                    <Card className="p-4 bg-canvas-subtle border-l-4 border-l-success">
                        <p className="text-sm text-fg-muted font-bold uppercase">Total Profit Kotor</p>
                        <p className="text-2xl font-bold font-mono mt-2 text-success">{formatCurrency(totalProfit)}</p>
                    </Card>
                    <Card className="p-4 bg-canvas-subtle">
                        <p className="text-sm text-fg-muted font-bold uppercase">Rata-rata Margin</p>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-2xl font-bold font-mono text-accent">{avgMargin.toFixed(2)}%</p>
                            {avgMargin >= 15 ? <TrendingUp className="text-success size-5" /> : <TrendingDown className="text-danger size-5" />}
                        </div>
                    </Card>
                </div>

                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b-2 border-line-subtle text-xs text-fg-muted uppercase bg-canvas-subtle">
                                    <th className="py-3 px-4">Lokasi (Site)</th>
                                    <th className="py-3 px-4 text-right">Pendapatan</th>
                                    <th className="py-3 px-4 text-right">Beban Gaji</th>
                                    <th className="py-3 px-4 text-right">Beban Logistik</th>
                                    <th className="py-3 px-4 text-right text-success">Profit (Rp)</th>
                                    <th className="py-3 px-4 text-right text-accent">Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.map((item, idx) => (
                                    <tr key={idx} className="border-b border-line-subtle font-bold bg-canvas hover:bg-canvas-subtle">
                                        <td className="py-3 px-4 text-sm">{item.site_name}</td>
                                        <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(item.revenue)}</td>
                                        <td className="py-3 px-4 text-sm text-right font-mono text-danger">({formatCurrency(item.salary_expense)})</td>
                                        <td className="py-3 px-4 text-sm text-right font-mono text-danger">({formatCurrency(item.logistic_expense)})</td>
                                        <td className="py-3 px-4 text-sm text-right font-mono text-success">{formatCurrency(item.profit)}</td>
                                        <td className="py-3 px-4 text-sm text-right font-mono text-accent">
                                            <span className={`px-2 py-1 rounded ${item.margin_percentage >= 15 ? 'bg-success/20 text-success' : (item.margin_percentage > 0 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger')}`}>
                                                {item.margin_percentage.toFixed(2)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {analysis.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-fg-muted">Tidak ada data site.</td>
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
