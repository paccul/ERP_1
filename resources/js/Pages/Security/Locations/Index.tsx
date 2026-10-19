import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';

interface Location {
    id: string;
    name: string;
    client_id: string | null;
    guards_per_shift: number;
    monthly_rate_per_guard: number;
    is_active: boolean;
}

interface Props {
    locations: Location[];
}

export default function Index({ locations }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        client_id: '',
        address: '',
        guards_per_shift: 1,
        monthly_rate_per_guard: 0,
        is_active: true,
    });

    const filtered = locations.filter(l => 
        l.name.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (loc: any = null) => {
        clearErrors();
        if (loc) {
            setEditingLoc(loc);
            setData({
                name: loc.name,
                client_id: loc.client_id || '',
                address: loc.address || '',
                guards_per_shift: loc.guards_per_shift || 1,
                monthly_rate_per_guard: loc.monthly_rate_per_guard || 0,
                is_active: loc.is_active,
            });
        } else {
            setEditingLoc(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLoc) {
            put(route('security.locations.update', editingLoc.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('security.locations.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const columnHelper = createColumnHelper<Location>();
    const columns = [
        columnHelper.accessor('name', {
            header: 'Nama Lokasi',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('client_name', {
            header: 'Klien',
            cell: info => info.getValue() || '-',
        }),
        columnHelper.accessor('is_active', {
            header: 'Status',
            cell: info => info.getValue() ? <Badge variant="success">Aktif</Badge> : <Badge variant="danger">Nonaktif</Badge>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs" onPress={() => openModal(info.row.original)}>
                        Edit
                    </Button>
                    <Button 
                        variant="danger" 
                        className="px-2 py-1 h-auto text-xs"
                        onPress={() => {
                            if (confirm('Yakin ingin menghapus lokasi ini?')) {
                                router.delete(route('security.locations.destroy', info.row.original.id));
                            }
                        }}
                    >
                        Hapus
                    </Button>
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Lokasi Jaga">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Lokasi Jaga</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola pos pengamanan dan titik presensi.</p>
                    </div>
                    <Button onPress={() => openModal()}>
                        <Plus className="size-4 mr-2" /> Tambah Lokasi
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari lokasi"
                                placeholder="Cari nama atau kode..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Lokasi tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                title={editingLoc ? 'Edit Lokasi' : 'Tambah Lokasi'}
            >
                <form onSubmit={submit} className="space-y-4">
                    <TextField
                        label="ID Klien (Opsional)"
                        value={data.client_id}
                        onChange={v => setData('client_id', v)}
                        errorMessage={errors.client_id}
                    />
                    <TextField
                        label="Nama Lokasi / Pos"
                        value={data.name}
                        onChange={v => setData('name', v)}
                        errorMessage={errors.name}
                        isInvalid={!!errors.name}
                    />

                    <TextField
                        label="Alamat Lengkap"
                        value={data.address}
                        onChange={v => setData('address', v)}
                        errorMessage={errors.address}
                    />
                    <TextField
                        label="Tarif per Personel / Bulan"
                        type="number"
                        value={data.monthly_rate_per_guard.toString()}
                        onChange={v => setData('monthly_rate_per_guard', parseInt(v))}
                        errorMessage={errors.monthly_rate_per_guard}
                    />
                    <TextField
                        label="Kebutuhan Personel per Shift"
                        type="number"
                        value={data.guards_per_shift.toString()}
                        onChange={v => setData('guards_per_shift', parseInt(v))}
                        errorMessage={errors.guards_per_shift}
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
