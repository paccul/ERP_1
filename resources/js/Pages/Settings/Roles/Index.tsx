import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Trash2 } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description: string | null;
    users_count: number;
    permissions_count: number;
}

interface Props {
    roles: Role[];
}

export default function Index({ roles }: Props) {
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const filteredRoles = roles.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<Role>();
    const columns = [
        columnHelper.accessor('name', {
            header: 'Nama Role',
            cell: info => (
                <div>
                    <p className="font-bold uppercase tracking-wider">{info.getValue()}</p>
                    {info.row.original.description && (
                        <p className="text-xs text-fg-muted mt-1 max-w-sm truncate">{info.row.original.description}</p>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor('users_count', {
            header: 'Pengguna',
            cell: info => (
                <Badge variant="info">{info.getValue()} Pengguna</Badge>
            ),
        }),
        columnHelper.accessor('permissions_count', {
            header: 'Izin',
            cell: info => (
                <Badge variant="neutral">{info.getValue()} Izin</Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs" asChild>
                        <Link href={route('settings.roles.edit', info.row.original.id)}>Edit</Link>
                    </Button>
                    {info.row.original.name !== 'superadmin' && info.row.original.users_count === 0 && (
                        <Button 
                            variant="danger" 
                            className="px-2 py-1 h-auto text-xs"
                            onPress={() => setDeleteId(info.row.original.id)}
                            title="Hapus"
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Matriks Role & Izin">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Matriks Role & Izin</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola peran sistem dan hak akses modul.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('settings.roles.create')}>
                            <Plus className="size-4 mr-2" /> Tambah Role
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari role"
                                placeholder="Cari nama role..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filteredRoles}
                        columns={columns}
                        emptyTitle="Role tidak ditemukan"
                        emptyDescription="Ubah filter pencarian atau tambahkan role baru."
                    />
                </div>
            </div>

            <ConfirmDialog 
                isOpen={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Hapus Role"
                description="Apakah Anda yakin ingin menghapus role ini? Role yang sudah dihapus tidak dapat dikembalikan."
                isDestructive
                onConfirm={() => {
                    if (deleteId) {
                        router.delete(route('settings.roles.destroy', deleteId), {
                            onFinish: () => setDeleteId(null)
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
