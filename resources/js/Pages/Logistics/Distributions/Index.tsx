import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Eye } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Props {
    distributions: any[];
}

export default function Index({ distributions }: Props) {
    const [search, setSearch] = useState('');

    const filtered = distributions.filter(d => 
        d.number.toLowerCase().includes(search.toLowerCase()) || 
        d.recipient_type.toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('number', {
            header: 'Nomor Distribusi',
            cell: info => <span className="font-bold font-mono text-accent">{info.getValue()}</span>,
        }),
        columnHelper.accessor('distributed_at', {
            header: 'Waktu',
            cell: info => formatDate(info.getValue()),
        }),
        columnHelper.accessor('recipient_type', {
            header: 'Penerima',
            cell: info => <span className="capitalize">{info.getValue()}</span>,
        }),
        columnHelper.accessor('note', {
            header: 'Keterangan',
            cell: info => info.getValue() || '-',
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                    <Link href={route('logistics.distributions.show', info.row.original.id)}>
                        <Eye className="size-3 mr-1" /> Detail
                    </Link>
                </Button>
            )
        })
    ];

    return (
        <AppLayout title="Distribusi Logistik">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Distribusi Logistik</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola pendistribusian barang ke personel, pos, atau klien.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('logistics.distributions.create')}>
                            <Plus className="size-4 mr-2" /> Distribusi Baru
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari distribusi"
                                placeholder="Cari nomor atau penerima..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Distribusi tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
