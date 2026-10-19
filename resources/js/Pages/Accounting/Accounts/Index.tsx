import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Props {
    accounts: any[];
}

export default function Index({ accounts }: Props) {
    const [search, setSearch] = useState('');

    const filtered = accounts.filter(a => 
        (a.code || "").toLowerCase().includes(search.toLowerCase()) || 
        (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.category || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string, code: string) => {
        if (confirm(`Yakin ingin menghapus akun ${code}? Pastikan akun ini tidak memiliki mutasi jurnal.`)) {
            router.delete(route('accounts.destroy', id));
        }
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('code', {
            header: 'Kode Akun',
            cell: info => <span className="font-bold font-mono">{info.getValue()}</span>,
        }),
        columnHelper.accessor('name', {
            header: 'Nama Akun',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('category', {
            header: 'Kategori',
            cell: info => <span className="capitalize">{info.getValue()}</span>,
        }),
        columnHelper.accessor('normal_balance', {
            header: 'Saldo Normal',
            cell: info => <span className="capitalize">{info.getValue()}</span>,
        }),
        columnHelper.accessor('is_system', {
            header: 'Tipe',
            cell: info => info.getValue() ? <Badge variant="secondary">Sistem</Badge> : <Badge variant="primary">Kustom</Badge>,
        }),
        columnHelper.accessor('is_active', {
            header: 'Status',
            cell: info => info.getValue() ? <Badge variant="success">Aktif</Badge> : <Badge variant="danger">Nonaktif</Badge>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex gap-2">
                    <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                        <Link href={route('accounts.edit', info.row.original.id)}>
                            <Edit className="size-3 mr-1" /> Edit
                        </Link>
                    </Button>
                    {!info.row.original.is_system && (
                        <Button 
                            variant="danger" 
                            className="px-2 py-1 h-auto text-xs"
                            onPress={() => handleDelete(info.row.original.id, info.row.original.code)}
                        >
                            <Trash2 className="size-3 mr-1" /> Hapus
                        </Button>
                    )}
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Chart of Accounts">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Chart of Accounts (COA)</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola daftar akun buku besar.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('accounts.create')}>
                            <Plus className="size-4 mr-2" /> Tambah Akun
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari akun"
                                placeholder="Cari kode, nama, atau kategori..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Akun tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
