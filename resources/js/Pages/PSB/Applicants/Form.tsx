import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Checkbox';
import { ArrowLeft } from 'lucide-react';

interface Props {
    applicant: any | null;
    defaultRegNumber: string;
}

export default function Form({ applicant, defaultRegNumber }: Props) {
    const isEditing = !!applicant;
    
    const { data, setData, post, put, processing, errors } = useForm({
        nik: applicant?.nik || defaultRegNumber,
        full_name: applicant?.full_name || '',
        birth_place: applicant?.birth_place || '',
        birth_date: applicant?.birth_date || '',
        gender: applicant?.gender || 'L',
        address: applicant?.address || '',
        phone: applicant?.phone || '',
        email: applicant?.email || '',
        ktp_number: applicant?.ktp_number || '',
        kk_number: applicant?.kk_number || '',
        height_cm: applicant?.height_cm || '',
        weight_kg: applicant?.weight_kg || '',
        education: applicant?.education || '',
        has_experience: applicant?.has_experience || false,
        experience_desc: applicant?.experience_desc || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('psb.applicants.update', applicant.id));
        } else {
            post(route('psb.applicants.store'));
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Pelamar' : 'Form Pendaftaran'}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('psb.applicants.index')}><ArrowLeft className="size-5" /></Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">{isEditing ? 'Edit Pelamar' : 'Form Pendaftaran Baru'}</h2>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                label="NIK / No. KTP"
                                value={data.nik}
                                onChange={v => setData('nik', v)}
                                errorMessage={errors.nik}
                                isInvalid={!!errors.nik}
                            />
                            <TextField
                                label="Nama Lengkap"
                                value={data.full_name}
                                onChange={v => setData('full_name', v)}
                                errorMessage={errors.full_name}
                                isInvalid={!!errors.full_name}
                            />
                            
                            <TextField
                                label="Tempat Lahir"
                                value={data.birth_place}
                                onChange={v => setData('birth_place', v)}
                                errorMessage={errors.birth_place}
                            />
                            <TextField
                                label="Tanggal Lahir"
                                type="date"
                                value={data.birth_date}
                                onChange={v => setData('birth_date', v)}
                                errorMessage={errors.birth_date}
                            />
                            
                            <div>
                                <label className="text-sm font-bold text-fg block mb-1">Jenis Kelamin</label>
                                <select 
                                    className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value as 'L'|'P')}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            
                            <TextField
                                label="Pendidikan Terakhir"
                                value={data.education}
                                onChange={v => setData('education', v)}
                                errorMessage={errors.education}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Tinggi (cm)"
                                    type="number"
                                    value={data.height_cm.toString()}
                                    onChange={v => setData('height_cm', v)}
                                    errorMessage={errors.height_cm}
                                />
                                <TextField
                                    label="Berat (kg)"
                                    type="number"
                                    value={data.weight_kg.toString()}
                                    onChange={v => setData('weight_kg', v)}
                                    errorMessage={errors.weight_kg}
                                />
                            </div>
                            
                            <TextField
                                label="No. KTP / NIK"
                                value={data.ktp_number}
                                onChange={v => setData('ktp_number', v)}
                                errorMessage={errors.ktp_number}
                            />

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
                                    label="Alamat Lengkap"
                                    value={data.address}
                                    onChange={v => setData('address', v)}
                                    errorMessage={errors.address}
                                />
                            </div>
                            
                            <div className="md:col-span-2 border-t border-line-subtle pt-4 mt-2">
                                <Checkbox
                                    isSelected={data.has_experience}
                                    onChange={v => setData('has_experience', v)}
                                >
                                    <span className="font-bold">Memiliki Pengalaman Keamanan</span>
                                </Checkbox>
                                
                                {data.has_experience && (
                                    <div className="mt-4">
                                        <TextField
                                            label="Deskripsi Pengalaman"
                                            value={data.experience_desc}
                                            onChange={v => setData('experience_desc', v)}
                                            errorMessage={errors.experience_desc}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('psb.applicants.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Simpan Pendaftaran
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
