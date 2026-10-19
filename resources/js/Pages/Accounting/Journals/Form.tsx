import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface Props {
    accounts: any[];
    sites: any[];
}

export default function Form({ accounts, sites }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        lines: [
            { account_id: '', debit: 0, credit: 0, memo: '', site_id: '' },
            { account_id: '', debit: 0, credit: 0, memo: '', site_id: '' },
        ],
    });

    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [isBalanced, setIsBalanced] = useState(false);

    useEffect(() => {
        let d = 0;
        let c = 0;
        data.lines.forEach(line => {
            d += Number(line.debit) || 0;
            c += Number(line.credit) || 0;
        });
        setTotalDebit(d);
        setTotalCredit(c);
        setIsBalanced(Math.abs(d - c) < 0.01 && d > 0);
    }, [data.lines]);

    const addLine = () => {
        setData('lines', [...data.lines, { account_id: '', debit: 0, credit: 0, memo: '', site_id: '' }]);
    };

    const removeLine = (index: number) => {
        if (data.lines.length <= 2) return;
        const newLines = [...data.lines];
        newLines.splice(index, 1);
        setData('lines', newLines);
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...data.lines] as any;
        newLines[index][field] = value;
        // Auto-zero the other side if one is filled
        if (field === 'debit' && Number(value) > 0) newLines[index]['credit'] = 0;
        if (field === 'credit' && Number(value) > 0) newLines[index]['debit'] = 0;
        setData('lines', newLines);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            alert('Jurnal tidak balance! Total Debit dan Kredit harus sama.');
            return;
        }
        post(route('journals.store'));
    };

    return (
        <AppLayout title="Entri Jurnal">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('journals.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Entri Jurnal Manual</h2>
                        <p className="text-sm text-fg-muted mt-1">Buat draft jurnal baru.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TextField
                                label="Tanggal"
                                type="date"
                                value={data.date}
                                onChange={v => setData('date', v)}
                                errorMessage={errors.date}
                                required
                            />
                            <TextField
                                label="No. Referensi"
                                value={data.reference}
                                onChange={v => setData('reference', v)}
                                errorMessage={errors.reference}
                            />
                            <TextField
                                label="Keterangan Umum"
                                value={data.description}
                                onChange={v => setData('description', v)}
                                errorMessage={errors.description}
                            />
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-4">Baris Transaksi</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-line-subtle text-sm text-fg-muted">
                                            <th className="pb-2 w-1/3">Akun</th>
                                            <th className="pb-2 w-1/6">Debit</th>
                                            <th className="pb-2 w-1/6">Kredit</th>
                                            <th className="pb-2 w-1/4">Memo (Opsional)</th>
                                            <th className="pb-2 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.lines.map((line, index) => (
                                            <tr key={index} className="border-b border-line-subtle last:border-0">
                                                <td className="py-2 pr-2">
                                                    <select 
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                                        value={line.account_id}
                                                        onChange={e => updateLine(index, 'account_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Pilih Akun --</option>
                                                        {accounts.map(a => (
                                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-2">
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent text-right font-mono"
                                                        value={line.debit || ''}
                                                        onChange={e => updateLine(index, 'debit', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2 pr-2">
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent text-right font-mono"
                                                        value={line.credit || ''}
                                                        onChange={e => updateLine(index, 'credit', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2 pr-2">
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                                        value={line.memo}
                                                        onChange={e => updateLine(index, 'memo', e.target.value)}
                                                        placeholder="Memo baris..."
                                                    />
                                                </td>
                                                <td className="py-2 text-right">
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        className="text-danger p-2"
                                                        onPress={() => removeLine(index)}
                                                        disabled={data.lines.length <= 2}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-canvas-subtle">
                                            <td className="py-3 px-2 font-bold text-right text-sm">TOTAL:</td>
                                            <td className="py-3 pr-2 font-bold font-mono text-right text-sm">
                                                {formatCurrency(totalDebit)}
                                            </td>
                                            <td className="py-3 pr-2 font-bold font-mono text-right text-sm">
                                                {formatCurrency(totalCredit)}
                                            </td>
                                            <td colSpan={2} className="py-3 px-2">
                                                {!isBalanced ? (
                                                    <span className="text-danger text-xs font-bold bg-danger/10 px-2 py-1 rounded">Tidak Balance (Selisih: {formatCurrency(Math.abs(totalDebit - totalCredit))})</span>
                                                ) : (
                                                    <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded">Balance</span>
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div className="mt-4">
                                <Button type="button" variant="secondary" onPress={addLine} className="text-sm">
                                    <Plus className="size-3 mr-1" /> Tambah Baris
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('journals.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing} disabled={!isBalanced}>
                                Simpan Draft
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
