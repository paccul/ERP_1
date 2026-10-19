import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';

interface Personnel {
    id: string;
    nik: string;
    full_name: string;
    status: 'active' | 'inactive' | 'suspended';
    gender: 'L' | 'P';
    phone: string | null;
}

interface Props {
    personnels: Personnel[];
}

export default function Index({ personnels }: Props) {
    const [search, setSearch] = useState('');

    const filtered = personnels.filter(p => 
        (p.full_name || "").toLowerCase().includes(search.toLowerCase()) || 
        (p.nik || "").toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<Personnel>();
    const columns = [
        columnHelper.accessor('nik', {
            header: 'NIK',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('full_name', {
            header: 'Nama Lengkap',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('gender', {
            header: 'L/P',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('phone', {
            header: 'Telepon',
            cell: info => info.getValue() || '-',
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const status = info.getValue();
                if (status === 'active') return <Badge variant="success">Aktif</Badge>;
                if (status === 'inactive') return <Badge variant="neutral">Nonaktif</Badge>;
                return <Badge variant="danger">Suspended</Badge>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs" asChild>
                        <Link href={route('security.personnels.edit', info.row.original.id)}>Edit</Link>
                    </Button>
                    <Button 
                        variant="danger" 
                        className="px-2 py-1 h-auto text-xs"
                        onPress={() => {
                            if (confirm('Yakin ingin menghapus personel ini?')) {
                                router.delete(route('security.personnels.destroy', info.row.original.id));
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
        <AppLayout title="Data Personel Keamanan">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Data Personel</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola data anggota keamanan (Satpam).</p>
                    </div>
                    <Button asChild>
                        <Link href={route('security.personnels.create')}>
                            <Plus className="size-4 mr-2" /> Tambah Personel
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari personel"
                                placeholder="Cari nama atau NIK..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Personel tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
