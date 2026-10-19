import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft } from 'lucide-react';

interface Props {
    account: any | null;
    parents: any[];
    categories: string[];
    normalBalances: string[];
    cashFlowGroups: string[];
}

export default function Form({ account, parents, categories, normalBalances, cashFlowGroups }: Props) {
    const isEditing = !!account;
    
    const { data, setData, post, put, processing, errors } = useForm({
        code: account?.code || '',
        name: account?.name || '',
        category: account?.category || categories[0],
        normal_balance: account?.normal_balance || normalBalances[0],
        parent_id: account?.parent_id || '',
        cash_flow_group: account?.cash_flow_group || '',
        is_active: account?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('accounts.update', account.id));
        } else {
            post(route('accounts.store'));
        }
    };

    return (
        <AppLayout title={isEditing ? `Edit Akun: ${account.code}` : "Tambah Akun"}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('accounts.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">
                            {isEditing ? 'Edit Akun' : 'Tambah Akun Baru'}
                        </h2>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                label="Kode Akun"
                                value={data.code}
                                onChange={v => setData('code', v)}
                                errorMessage={errors.code}
                                isInvalid={!!errors.code}
                                required
                            />
                            <TextField
                                label="Nama Akun"
                                value={data.name}
                                onChange={v => setData('name', v)}
                                errorMessage={errors.name}
                                isInvalid={!!errors.name}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Kategori Akun</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    required
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c} className="capitalize">{c}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Saldo Normal</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                    value={data.normal_balance}
                                    onChange={e => setData('normal_balance', e.target.value)}
                                    required
                                >
                                    {normalBalances.map(c => (
                                        <option key={c} value={c} className="capitalize">{c}</option>
                                    ))}
                                </select>
                                {errors.normal_balance && <p className="text-xs text-danger mt-1">{errors.normal_balance}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Sub-Akun Dari (Induk)</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                    value={data.parent_id}
                                    onChange={e => setData('parent_id', e.target.value)}
                                >
                                    <option value="">-- Bukan Sub-Akun --</option>
                                    {parents.map(p => (
                                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                    ))}
                                </select>
                                {errors.parent_id && <p className="text-xs text-danger mt-1">{errors.parent_id}</p>}
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Kelompok Arus Kas</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                    value={data.cash_flow_group}
                                    onChange={e => setData('cash_flow_group', e.target.value)}
                                >
                                    <option value="">-- Tidak Masuk Arus Kas --</option>
                                    {cashFlowGroups.map(c => (
                                        <option key={c} value={c} className="capitalize">{c}</option>
                                    ))}
                                </select>
                                {errors.cash_flow_group && <p className="text-xs text-danger mt-1">{errors.cash_flow_group}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded text-accent focus:ring-accent"
                            />
                            <label htmlFor="is_active" className="text-sm text-fg">Akun Aktif</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('accounts.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                {isEditing ? 'Simpan Perubahan' : 'Buat Akun'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
