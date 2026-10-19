import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { DataTable } from '@/Components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';

interface Institution {
    id: string;
    name: string;
    license_number: string | null;
    npwp: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    vat_rate: string | number;
    bpjs_kes_rate: string | number;
    bpjs_tk_rate: string | number;
    overtime_hourly_rate: string | number;
}

interface OrgUnit {
    id: string;
    name: string;
    title: string | null;
    parent_id: string | null;
}

interface Props {
    institution: Institution | null;
    orgUnits: OrgUnit[];
}

export default function Edit({ institution, orgUnits }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: institution?.name || '',
        license_number: institution?.license_number || '',
        npwp: institution?.npwp || '',
        address: institution?.address || '',
        phone: institution?.phone || '',
        email: institution?.email || '',
        vat_rate: institution?.vat_rate || 0,
        bpjs_kes_rate: institution?.bpjs_kes_rate || 0,
        bpjs_tk_rate: institution?.bpjs_tk_rate || 0,
        overtime_hourly_rate: institution?.overtime_hourly_rate || 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.institution.update'));
    };

    const columnHelper = createColumnHelper<OrgUnit>();
    const columns = [
        columnHelper.accessor('name', {
            header: 'Unit / Jabatan',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('title', {
            header: 'Nama Jabatan',
            cell: info => info.getValue() || '-',
        }),
        columnHelper.accessor('parent_id', {
            header: 'Atasan Langsung',
            cell: info => {
                const parent = orgUnits.find(u => u.id === info.getValue());
                return parent ? parent.name : '-';
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs">Edit</Button>
                    <Button variant="danger" className="px-2 py-1 h-auto text-xs">Hapus</Button>
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Identitas & Organisasi">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Identitas Institusi</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola profil perusahaan dan pengaturan global.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                label="Nama BUJP"
                                value={data.name}
                                onChange={v => setData('name', v)}
                                errorMessage={errors.name}
                                isInvalid={!!errors.name}
                            />
                            <TextField
                                label="Nomor Izin Operasional"
                                value={data.license_number}
                                onChange={v => setData('license_number', v)}
                                errorMessage={errors.license_number}
                                isInvalid={!!errors.license_number}
                            />
                            <TextField
                                label="NPWP"
                                value={data.npwp}
                                onChange={v => setData('npwp', v)}
                                errorMessage={errors.npwp}
                                isInvalid={!!errors.npwp}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={v => setData('email', v)}
                                errorMessage={errors.email}
                                isInvalid={!!errors.email}
                            />
                            <TextField
                                label="Telepon"
                                value={data.phone}
                                onChange={v => setData('phone', v)}
                                errorMessage={errors.phone}
                                isInvalid={!!errors.phone}
                            />
                            <div className="md:col-span-2">
                                <TextField
                                    label="Alamat Lengkap"
                                    value={data.address}
                                    onChange={v => setData('address', v)}
                                    errorMessage={errors.address}
                                    isInvalid={!!errors.address}
                                />
                            </div>
                            <TextField
                                label="Tarif PPN (%)"
                                type="number"
                                value={data.vat_rate.toString()}
                                onChange={v => setData('vat_rate', v)}
                                errorMessage={errors.vat_rate}
                                isInvalid={!!errors.vat_rate}
                            />
                            <TextField
                                label="Tarif BPJS Kesehatan (%)"
                                type="number"
                                value={data.bpjs_kes_rate.toString()}
                                onChange={v => setData('bpjs_kes_rate', v)}
                                errorMessage={errors.bpjs_kes_rate}
                                isInvalid={!!errors.bpjs_kes_rate}
                            />
                            <TextField
                                label="Tarif BPJS Ketenagakerjaan (%)"
                                type="number"
                                value={data.bpjs_tk_rate.toString()}
                                onChange={v => setData('bpjs_tk_rate', v)}
                                errorMessage={errors.bpjs_tk_rate}
                                isInvalid={!!errors.bpjs_tk_rate}
                            />
                            <TextField
                                label="Tarif Lembur (per jam)"
                                type="number"
                                value={data.overtime_hourly_rate.toString()}
                                onChange={v => setData('overtime_hourly_rate', v)}
                                errorMessage={errors.overtime_hourly_rate}
                                isInvalid={!!errors.overtime_hourly_rate}
                            />
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <Button type="submit" isPending={processing}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </Card>
                </form>

                <div className="pt-6 border-t border-line-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-fg-strong">Struktur Organisasi</h3>
                            <p className="text-sm text-fg-muted mt-1">Daftar unit dan jabatan struktural.</p>
                        </div>
                        <Button variant="secondary">Tambah Unit</Button>
                    </div>
                    
                    <DataTable 
                        data={orgUnits}
                        columns={columns}
                        emptyTitle="Tidak ada struktur organisasi"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
