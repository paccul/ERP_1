import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { createColumnHelper } from '@tanstack/react-table';
import { DatabaseBackup, Download, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Backup {
    file_name: string;
    file_size: string;
    created_at: string;
}

interface Props {
    backups: Backup[];
}

export default function Index({ backups }: Props) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = () => {
        setIsBackingUp(true);
        router.post(route('settings.backups.store'), {}, {
            onFinish: () => setIsBackingUp(false)
        });
    };

    const columnHelper = createColumnHelper<Backup>();
    const columns = [
        columnHelper.accessor('file_name', {
            header: 'Nama File',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('file_size', {
            header: 'Ukuran',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('created_at', {
            header: 'Waktu Backup',
            cell: info => formatDate(info.getValue()),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                        <a href={route('settings.backups.download', info.row.original.file_name)}>
                            <Download className="size-3 mr-1" /> Unduh
                        </a>
                    </Button>
                    <Button 
                        variant="danger" 
                        className="px-2 py-1 h-auto text-xs"
                        onPress={() => setDeleteId(info.row.original.file_name)}
                        title="Hapus"
                    >
                        <Trash2 className="size-3" />
                    </Button>
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Manajemen Database Backup">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Database Backup</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola dan amankan data sistem Garda ERP.</p>
                    </div>
                    <Button onPress={handleBackup} isPending={isBackingUp}>
                        <DatabaseBackup className="size-4 mr-2" /> Backup Sekarang
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <DataTable 
                        data={backups}
                        columns={columns}
                        emptyTitle="Belum ada backup"
                        emptyDescription="Klik tombol 'Backup Sekarang' untuk membuat arsip database baru."
                        enableClientSidePagination
                    />
                </div>
            </div>

            <ConfirmDialog 
                isOpen={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Hapus Backup"
                description="Apakah Anda yakin ingin menghapus file backup ini? Data tidak dapat dikembalikan."
                isDestructive
                onConfirm={() => {
                    if (deleteId) {
                        router.delete(route('settings.backups.destroy', deleteId), {
                            onFinish: () => setDeleteId(null)
                        });
                    }
                }}
            />
        </AppLayout>
    );
}
