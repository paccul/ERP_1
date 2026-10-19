import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Props {
    items: any[];
    personnels: any[];
    sites: any[];
    recipientTypes: string[];
}

export default function Form({ items, personnels, sites, recipientTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        recipient_type: 'personnel',
        recipient_id: '',
        note: '',
        lines: [
            { item_id: '', quantity: 1 },
        ],
    });

    const addLine = () => {
        setData('lines', [...data.lines, { item_id: '', quantity: 1 }]);
    };

    const removeLine = (index: number) => {
        if (data.lines.length <= 1) return;
        const newLines = [...data.lines];
        newLines.splice(index, 1);
        setData('lines', newLines);
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...data.lines] as any;
        newLines[index][field] = value;
        setData('lines', newLines);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('logistics.distributions.store'));
    };

    return (
        <AppLayout title="Buat Distribusi Logistik">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('logistics.distributions.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Formulir Distribusi Baru</h2>
                        <p className="text-sm text-fg-muted mt-1">Catat pengeluaran barang dari gudang pusat.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Tipe Penerima</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent capitalize"
                                    value={data.recipient_type}
                                    onChange={e => {
                                        setData('recipient_type', e.target.value);
                                        setData('recipient_id', ''); // reset
                                    }}
                                    required
                                >
                                    {recipientTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                {errors.recipient_type && <p className="text-xs text-danger mt-1">{errors.recipient_type}</p>}
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Nama Penerima / Tujuan</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                    value={data.recipient_id}
                                    onChange={e => setData('recipient_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Tujuan --</option>
                                    {data.recipient_type === 'personnel' && personnels.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                                    ))}
                                    {data.recipient_type === 'site' && sites.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                    {data.recipient_type === 'client' && <option disabled>Client selection placeholder</option>}
                                </select>
                                {errors.recipient_id && <p className="text-xs text-danger mt-1">{errors.recipient_id}</p>}
                            </div>
                        </div>

                        <TextField
                            label="Catatan Distribusi (Opsional)"
                            value={data.note}
                            onChange={v => setData('note', v)}
                            errorMessage={errors.note}
                        />

                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-4">Barang Keluar</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-line-subtle text-sm text-fg-muted">
                                            <th className="pb-2">Barang</th>
                                            <th className="pb-2 w-32">Kuantitas</th>
                                            <th className="pb-2 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.lines.map((line, index) => (
                                            <tr key={index} className="border-b border-line-subtle last:border-0">
                                                <td className="py-2 pr-2">
                                                    <select 
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                                        value={line.item_id}
                                                        onChange={e => updateLine(index, 'item_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Pilih Barang --</option>
                                                        {items.map(i => (
                                                            <option key={i.id} value={i.id}>
                                                                {i.code} - {i.name} (Tersedia: {i.stock_on_hand} {i.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-2">
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent text-right font-mono"
                                                        value={line.quantity}
                                                        onChange={e => updateLine(index, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2 text-right">
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        className="text-danger p-2"
                                                        onPress={() => removeLine(index)}
                                                        disabled={data.lines.length <= 1}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-4">
                                <Button type="button" variant="secondary" onPress={addLine} className="text-sm">
                                    <Plus className="size-3 mr-1" /> Tambah Barang
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('logistics.distributions.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Proses Distribusi
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
