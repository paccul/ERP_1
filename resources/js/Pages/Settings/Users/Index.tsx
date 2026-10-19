import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, UserMinus } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    roles: { name: string }[];
}

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<User>();
    const columns = [
        columnHelper.accessor('name', {
            header: 'Nama',
            cell: info => (
                <div>
                    <p className="font-bold">{info.getValue()}</p>
                    <p className="text-xs text-fg-muted">{info.row.original.email}</p>
                </div>
            ),
        }),
        columnHelper.accessor('roles', {
            header: 'Peran',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue().map((r, i) => (
                        <Badge key={i} variant="neutral">{r.name}</Badge>
                    ))}
                </div>
            ),
        }),
        columnHelper.accessor('is_active', {
            header: 'Status',
            cell: info => info.getValue() ? 
                <Badge variant="success">Aktif</Badge> : 
                <Badge variant="danger">Nonaktif</Badge>,
        }),
        columnHelper.accessor('created_at', {
            header: 'Dibuat Pada',
            cell: info => formatDate(info.getValue()),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs" asChild>
                        <Link href={route('settings.users.edit', info.row.original.id)}>Edit</Link>
                    </Button>
                    {info.row.original.is_active && (
                        <Button 
                            variant="danger" 
                            className="px-2 py-1 h-auto text-xs"
                            onPress={() => setDeleteId(info.row.original.id)}
                            title="Nonaktifkan"
                        >
                            <UserMinus className="size-3" />
                        </Button>
                    )}
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Manajemen Pengguna">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Manajemen Pengguna</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola akun dan peran pengguna sistem.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('settings.users.create')}>
                            <Plus className="size-4 mr-2" /> Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari pengguna"
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filteredUsers}
                        columns={columns}
                        emptyTitle="Pengguna tidak ditemukan"
                        emptyDescription="Ubah filter pencarian atau tambahkan pengguna baru."
                        enableClientSidePagination
                    />
                </div>
            </div>

            <ConfirmDialog 
                isOpen={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Nonaktifkan Pengguna"
                description="Apakah Anda yakin ingin menonaktifkan akun ini? Pengguna tidak akan dapat login."
                isDestructive
                onConfirm={() => {
                    if (deleteId) {
                        router.delete(route('settings.users.destroy', deleteId), {
                            onFinish: () => setDeleteId(null)
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
