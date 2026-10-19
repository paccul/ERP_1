import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';

interface Props {
    invoices: any[];
}

export default function Index({ invoices }: Props) {
    const [search, setSearch] = useState('');

    const filtered = invoices.filter(i => 
        (i.number || "").toLowerCase().includes(search.toLowerCase()) || 
        (i.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.period || "").toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('number', {
            header: 'No. Tagihan',
            cell: info => <span className="font-bold font-mono text-accent">{info.getValue()}</span>,
        }),
        columnHelper.accessor('client_name', {
            header: 'Klien',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('period', {
            header: 'Periode',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('total', {
            header: 'Total',
            cell: info => formatCurrency(info.getValue()),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const s = info.getValue();
                if (s === 'paid') return <Badge variant="success">Lunas</Badge>;
                if (s === 'issued') return <Badge variant="primary">Diterbitkan (Belum Lunas)</Badge>;
                if (s === 'void') return <Badge variant="danger">Batal</Badge>;
                return <Badge variant="warning">Draft</Badge>;
            },
        }),
        columnHelper.accessor('due_at', {
            header: 'Jatuh Tempo',
            cell: info => info.getValue() ? formatDate(info.getValue()) : '-',
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                    <Link href={route('finance.invoices.show', info.row.original.id)}>
                        <Eye className="size-3 mr-1" /> Kelola
                    </Link>
                </Button>
            )
        })
    ];

    return (
        <AppLayout title="Invoicing (Tagihan Klien)">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Tagihan Klien (Invoicing)</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola pembuatan dan penagihan biaya jasa keamanan ke klien.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('finance.invoices.create')}>
                            <Plus className="size-4 mr-2" /> Tagihan Baru
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari tagihan"
                                placeholder="Cari nomor, klien, periode..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Tagihan tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
