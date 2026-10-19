import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, QrCode } from 'lucide-react';

interface Props {
    checkpoints: any[];
    sites: any[];
}

export default function Index({ checkpoints, sites }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        site_id: '',
        code: '',
        name: '',
        sequence: 1,
    });

    const filtered = checkpoints.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.site_name.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('security.checkpoints.store'), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handlePrintQR = (code: string) => {
        alert("Simulasi cetak QR untuk kode: " + code);
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('site_name', {
            header: 'Lokasi (Site)',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('code', {
            header: 'Kode Checkpoint',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('name', {
            header: 'Nama Area / Titik',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('sequence', {
            header: 'Urutan Patroli',
            cell: info => info.getValue(),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <Button variant="secondary" className="px-2 py-1 h-auto text-xs" onPress={() => handlePrintQR(info.row.original.code)}>
                    <QrCode className="size-3 mr-1" /> Cetak QR
                </Button>
            )
        })
    ];

    return (
        <AppLayout title="Master Checkpoint">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Master Checkpoint Patroli</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola titik patroli pengamanan dan cetak kode QR.</p>
                    </div>
                    <Button onPress={openModal}>
                        <Plus className="size-4 mr-2" /> Tambah Checkpoint
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari checkpoint"
                                placeholder="Cari nama, kode, atau site..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Data tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                title="Tambah Checkpoint Patroli"
            >
                <form onSubmit={submit} className="space-y-4">
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

                    <TextField
                        label="Kode Checkpoint"
                        value={data.code}
                        onChange={v => setData('code', v)}
                        errorMessage={errors.code}
                        isInvalid={!!errors.code}
                        required
                    />
                    
                    <TextField
                        label="Nama Area / Titik"
                        value={data.name}
                        onChange={v => setData('name', v)}
                        errorMessage={errors.name}
                        isInvalid={!!errors.name}
                        required
                    />
                    
                    <TextField
                        label="Urutan Patroli"
                        type="number"
                        value={data.sequence.toString()}
                        onChange={v => setData('sequence', parseInt(v))}
                        errorMessage={errors.sequence}
                        isInvalid={!!errors.sequence}
                        required
                    />
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onPress={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit" isPending={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
