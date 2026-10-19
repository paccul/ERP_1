import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft } from 'lucide-react';

interface Props {
    sites: any[];
}

export default function Form({ sites }: Props) {
    const today = new Date();
    const currentPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, setData, post, processing, errors } = useForm({
        site_id: '',
        period: currentPeriod,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.payrolls.store'));
    };

    return (
        <AppLayout title="Generate Payroll">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('finance.payrolls.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Generate Payroll Baru</h2>
                        <p className="text-sm text-fg-muted mt-1">Sistem akan mengalkulasi gaji berdasarkan roster dan kehadiran di site.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Lokasi Jaga (Site)</label>
                            <select 
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                value={data.site_id}
                                onChange={e => setData('site_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Lokasi --</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.site_id && <p className="text-xs text-danger mt-1">{errors.site_id}</p>}
                        </div>

                        <div>
                            <TextField
                                label="Periode (YYYY-MM)"
                                type="month"
                                value={data.period}
                                onChange={v => setData('period', v)}
                                errorMessage={errors.period}
                                required
                            />
                        </div>

                        <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-4 rounded-md">
                            <strong>Info:</strong> Potongan BPJS Kesehatan (1%), BPJS Ketenagakerjaan (2%), dan PPh 21 menggunakan perhitungan otomatis tarif efektif rata-rata (TER).
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('finance.payrolls.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Generate Payroll
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
