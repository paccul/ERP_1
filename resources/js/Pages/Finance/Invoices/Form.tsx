import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft } from 'lucide-react';

interface Props {
    clients: any[];
}

export default function Form({ clients }: Props) {
    const today = new Date();
    const currentPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        period: currentPeriod,
        vat_rate: 11, // Standard PPN 11%
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.invoices.store'));
    };

    return (
        <AppLayout title="Buat Tagihan Baru">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('finance.invoices.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Generate Tagihan Baru</h2>
                        <p className="text-sm text-fg-muted mt-1">Sistem akan secara otomatis menghitung jumlah personil aktif dan tarif per lokasi klien.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Klien Dituju</label>
                            <select 
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                value={data.client_id}
                                onChange={e => setData('client_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Klien --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.client_id && <p className="text-xs text-danger mt-1">{errors.client_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                label="Periode (YYYY-MM)"
                                type="month"
                                value={data.period}
                                onChange={v => setData('period', v)}
                                errorMessage={errors.period}
                                required
                            />
                            
                            <TextField
                                label="Tarif PPN (%)"
                                type="number"
                                step="0.1"
                                value={data.vat_rate.toString()}
                                onChange={v => setData('vat_rate', parseFloat(v))}
                                errorMessage={errors.vat_rate}
                                required
                            />
                        </div>

                        <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-4 rounded-md">
                            <strong>Info:</strong> Nilai tagihan akan otomatis dikalkulasi berdasarkan daftar lokasi jaga (site) milik klien ini yang aktif pada bulan terpilih, dikali dengan jumlah personil yang di-plot pada roster.
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('finance.invoices.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Generate Draft Tagihan
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
