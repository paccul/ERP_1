import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';

interface Props {
    clients: any[];
    invoices: any[];
    summary: any;
    filters: {
        client_id: string;
    };
}

export default function ReceivableSubsidiary({ clients, invoices, summary, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            client_id: (form.elements.namedItem('client_id') as HTMLSelectElement).value,
        };
        
        router.get(route('reports.receivables'), data, { preserveState: true });
    };

    return (
        <AppLayout title="Buku Pembantu Piutang">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-fg-strong">Buku Pembantu Piutang</h2>
                    <p className="text-sm text-fg-muted mt-1">Laporan rincian mutasi tagihan dan pembayaran per klien.</p>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 max-w-sm">
                            <label className="text-sm font-bold text-fg block mb-1">Klien</label>
                            <select 
                                name="client_id"
                                defaultValue={filters.client_id || ''}
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                required
                            >
                                <option value="">-- Pilih Klien --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit" variant="primary">Tampilkan</Button>
                    </form>
                </Card>

                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-canvas-subtle">
                            <p className="text-sm text-fg-muted font-bold uppercase">Total Ditagihkan</p>
                            <p className="text-2xl font-bold font-mono mt-2">{formatCurrency(summary.total_billed)}</p>
                        </Card>
                        <Card className="p-4 bg-canvas-subtle border-l-4 border-l-success">
                            <p className="text-sm text-fg-muted font-bold uppercase">Total Dibayar</p>
                            <p className="text-2xl font-bold font-mono mt-2 text-success">{formatCurrency(summary.total_paid)}</p>
                        </Card>
                        <Card className="p-4 bg-canvas-subtle border-l-4 border-l-danger">
                            <p className="text-sm text-fg-muted font-bold uppercase">Sisa Piutang (Outstanding)</p>
                            <p className="text-2xl font-bold font-mono mt-2 text-danger">{formatCurrency(summary.total_outstanding)}</p>
                        </Card>
                    </div>
                )}

                {invoices.length > 0 && (
                    <Card className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b-2 border-line-subtle text-xs text-fg-muted uppercase bg-canvas-subtle">
                                        <th className="py-3 px-4">Tgl Invoice</th>
                                        <th className="py-3 px-4">No. Invoice</th>
                                        <th className="py-3 px-4 text-right">Nilai Tagihan (Db)</th>
                                        <th className="py-3 px-4 text-right">Pembayaran (Kr)</th>
                                        <th className="py-3 px-4 text-right">Sisa Piutang</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv, idx) => (
                                        <React.Fragment key={idx}>
                                            {/* Invoice Row */}
                                            <tr className="border-t border-line-subtle font-bold bg-canvas">
                                                <td className="py-3 px-4 text-sm">{formatDate(inv.issued_at)}</td>
                                                <td className="py-3 px-4 text-sm text-accent">
                                                    <Link href={route('finance.invoices.show', inv.id)} className="hover:underline">
                                                        {inv.number}
                                                    </Link>
                                                    <div className="text-xs text-fg-muted font-normal mt-1">Periode: {inv.period}</div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right font-mono">{formatCurrency(inv.total)}</td>
                                                <td className="py-3 px-4 text-sm text-right font-mono">-</td>
                                                <td className="py-3 px-4 text-sm text-right font-mono text-danger">{formatCurrency(inv.balance)}</td>
                                                <td className="py-3 px-4 text-sm text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${inv.status === 'paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                                        {inv.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                            
                                            {/* Payment Rows */}
                                            {inv.payments && inv.payments.map((pay: any, pIdx: number) => (
                                                <tr key={`p-${idx}-${pIdx}`} className="bg-canvas-subtle text-sm">
                                                    <td className="py-2 px-4 text-fg-muted pl-8">&#8627; {formatDate(pay.paid_at)}</td>
                                                    <td className="py-2 px-4 text-fg-muted">Pembayaran</td>
                                                    <td className="py-2 px-4 text-right font-mono text-fg-muted">-</td>
                                                    <td className="py-2 px-4 text-right font-mono text-success">{formatCurrency(pay.amount)}</td>
                                                    <td className="py-2 px-4 text-right font-mono text-fg-muted"></td>
                                                    <td className="py-2 px-4 text-center"></td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
                
                {filters.client_id && invoices.length === 0 && (
                    <Card className="p-8 text-center text-fg-muted">
                        Tidak ada catatan piutang untuk klien ini.
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
