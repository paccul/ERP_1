import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface Props {
    personnel: any | null;
    applicant?: any | null;
    users: { id: number, name: string }[];
}

export default function Form({ personnel, applicant, users }: Props) {
    const isEditing = !!personnel;
    
    const normalizeGender = (g?: string | null) =>
        g === 'P' || g === 'female' ? 'female' : 'male';

    const { data, setData, post, put, processing, errors } = useForm({
        nik: personnel?.nik || '',
        full_name: personnel?.full_name || applicant?.full_name || '',
        birth_place: personnel?.birth_place || applicant?.birth_place || '',
        birth_date: personnel?.birth_date || applicant?.birth_date || '',
        gender: normalizeGender(personnel?.gender || applicant?.gender),
        address: personnel?.address || applicant?.address || '',
        phone: personnel?.phone || applicant?.phone || '',
        email: personnel?.email || applicant?.email || '',
        status: personnel?.status || 'active',
        joined_at: personnel?.joined_at || new Date().toISOString().split('T')[0],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('security.personnels.update', personnel.id));
        } else {
            post(route('security.personnels.store'));
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Personel' : 'Tambah Personel'}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('security.personnels.index')}><ArrowLeft className="size-5" /></Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">{isEditing ? 'Edit Personel' : 'Tambah Personel Baru'}</h2>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-md border border-danger/40 bg-danger/10 text-danger text-sm">
                            <p className="font-bold mb-1">Data belum bisa disimpan, periksa isian berikut:</p>
                            <ul className="list-disc pl-5 space-y-0.5">
                                {Object.entries(errors).map(([field, msg]) => (
                                    <li key={field}>{msg as string}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                label="NIK (Nomor Induk Karyawan)"
                                value={data.nik}
                                onChange={v => { console.log('NIK Changed:', v); setData('nik', v); }}
                                errorMessage={errors.nik}
                                isInvalid={!!errors.nik}
                                description="Maksimal 16 karakter"
                            />
                            <TextField
                                label="Nama Lengkap"
                                value={data.full_name}
                                onChange={v => setData('full_name', v)}
                                errorMessage={errors.full_name}
                                isInvalid={!!errors.full_name}
                            />
                            
                            <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-fg block mb-1">Jenis Kelamin</label>
                                    <select 
                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                        value={data.gender}
                                        onChange={e => setData('gender', e.target.value)}
                                    >
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                    {errors.gender && <div className="text-xs text-danger mt-1">{errors.gender}</div>}
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-fg block mb-1">Status</label>
                                    <select 
                                        className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="leave">Cuti</option>
                                        <option value="inactive">Nonaktif</option>
                                    </select>
                                    {errors.status && <div className="text-xs text-danger mt-1">{errors.status}</div>}
                                </div>
                            </div>

                            <TextField
                                label="Telepon"
                                value={data.phone}
                                onChange={v => setData('phone', v)}
                                errorMessage={errors.phone}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={v => setData('email', v)}
                                errorMessage={errors.email}
                            />

                            <div className="md:col-span-2">
                                <TextField
                                    label="Alamat"
                                    value={data.address}
                                    onChange={v => setData('address', v)}
                                    errorMessage={errors.address}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('security.personnels.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Simpan Personel
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
