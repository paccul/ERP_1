import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { formatCurrency, formatDate } from '@/lib/format';

interface Props {
    accounts: any[];
    ledger: any;
    filters: {
        start_date: string;
        end_date: string;
        account_id: string;
    };
}

export default function Ledger({ accounts, ledger, filters }: Props) {
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = {
            start_date: (form.elements.namedItem('start_date') as HTMLInputElement).value,
            end_date: (form.elements.namedItem('end_date') as HTMLInputElement).value,
            account_id: (form.elements.namedItem('account_id') as HTMLSelectElement).value,
        };
        
        router.get(route('reports.ledger'), data, { preserveState: true });
    };

    return (
        <AppLayout title="Buku Besar (General Ledger)">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-fg-strong">Buku Besar (General Ledger)</h2>
                    <p className="text-sm text-fg-muted mt-1">Laporan mutasi per akun akuntansi untuk periode tertentu.</p>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-bold text-fg block mb-1">Akun</label>
                            <select 
                                name="account_id"
                                defaultValue={filters.account_id || ''}
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                required
                            >
                                <option value="">-- Pilih Akun --</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <label className="text-sm font-bold text-fg block mb-1">Mulai Tanggal</label>
                            <input 
                                type="date" 
                                name="start_date"
                                defaultValue={filters.start_date}
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                required
                            />
                        </div>
                        <div className="w-48">
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

                {ledger && (
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-line-subtle bg-canvas-subtle flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Akun: {ledger.account.code} - {ledger.account.name}</h3>
                                <p className="text-sm text-fg-muted">Periode: {formatDate(filters.start_date)} s/d {formatDate(filters.end_date)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-fg-muted">Saldo Normal</p>
                                <p className="font-bold uppercase text-accent">{ledger.is_debit_normal ? 'Debit' : 'Kredit'}</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b-2 border-line-subtle text-xs text-fg-muted uppercase">
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">No. Jurnal</th>
                                        <th className="py-3 px-4">Referensi</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                        <th className="py-3 px-4 text-right">Debit</th>
                                        <th className="py-3 px-4 text-right">Kredit</th>
                                        <th className="py-3 px-4 text-right text-accent">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-line-subtle font-bold bg-canvas-subtle/50">
                                        <td className="py-3 px-4" colSpan={4}>Saldo Awal</td>
                                        <td className="py-3 px-4"></td>
                                        <td className="py-3 px-4"></td>
                                        <td className="py-3 px-4 text-right font-mono text-accent">{formatCurrency(ledger.beginning_balance)}</td>
                                    </tr>
                                    
                                    {ledger.mutations.map((m: any, idx: number) => (
                                        <tr key={idx} className="border-b border-line-subtle last:border-0 hover:bg-canvas-subtle">
                                            <td className="py-3 px-4 text-sm">{formatDate(m.date)}</td>
                                            <td className="py-3 px-4 text-sm font-mono">{m.number}</td>
                                            <td className="py-3 px-4 text-sm">{m.reference || '-'}</td>
                                            <td className="py-3 px-4 text-sm">{m.memo}</td>
                                            <td className="py-3 px-4 text-sm text-right font-mono">{m.debit > 0 ? formatCurrency(m.debit) : '-'}</td>
                                            <td className="py-3 px-4 text-sm text-right font-mono">{m.credit > 0 ? formatCurrency(m.credit) : '-'}</td>
                                            <td className="py-3 px-4 text-sm text-right font-mono font-bold text-accent">{formatCurrency(m.balance)}</td>
                                        </tr>
                                    ))}
                                    
                                    {ledger.mutations.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-fg-muted">Tidak ada mutasi pada periode ini.</td>
                                        </tr>
                                    )}
                                    
                                    <tr className="border-t-2 border-line-strong font-bold bg-canvas-subtle/50">
                                        <td className="py-3 px-4 text-right" colSpan={6}>Saldo Akhir</td>
                                        <td className="py-3 px-4 text-right font-mono text-accent">{formatCurrency(ledger.ending_balance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
