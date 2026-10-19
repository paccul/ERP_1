import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Applicant {
    id: string;
    nik: string;
    full_name: string;
    status: 'baru' | 'seleksi' | 'diterima' | 'ditolak';
    created_at: string;
    notes: string | null;
}

interface Props {
    applicants: Applicant[];
}

export default function Index({ applicants }: Props) {
    const [search, setSearch] = useState('');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [status, setStatus] = useState<'baru' | 'seleksi' | 'diterima' | 'ditolak'>('baru');
    const [notes, setNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const filtered = applicants.filter(a => 
        (a.full_name || "").toLowerCase().includes(search.toLowerCase()) || 
        (a.nik || "").toLowerCase().includes(search.toLowerCase())
    );

    const openStatusModal = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setStatus(applicant.status);
        setNotes(applicant.notes || '');
        setIsStatusModalOpen(true);
    };

    const updateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;
        
        setIsUpdating(true);
        router.put(route('psb.applicants.update-status', selectedApplicant.id), {
            status,
            notes,
        }, {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                setIsUpdating(false);
            },
            onError: () => setIsUpdating(false),
        });
    };

    const columnHelper = createColumnHelper<Applicant>();
    const columns = [
        columnHelper.accessor('nik', {
            header: 'NIK / No. KTP',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('full_name', {
            header: 'Nama Lengkap',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('created_at', {
            header: 'Tgl Daftar',
            cell: info => formatDate(info.getValue()),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const s = info.getValue();
                if (s === 'baru') return <Badge variant="neutral">Baru</Badge>;
                if (s === 'seleksi') return <Badge variant="warning">Seleksi</Badge>;
                if (s === 'diterima') return <Badge variant="success">Diterima</Badge>;
                return <Badge variant="danger">Ditolak</Badge>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <div className="flex gap-2">
                    <Button variant="ghost" className="px-2 py-1 h-auto text-xs" asChild>
                        <Link href={route('psb.applicants.edit', info.row.original.id)}>Edit</Link>
                    </Button>
                    <Button 
                        variant="secondary" 
                        className="px-2 py-1 h-auto text-xs" 
                        onPress={() => openStatusModal(info.row.original)}
                    >
                        Ubah Status
                    </Button>
                </div>
            )
        })
    ];

    return (
        <AppLayout title="Data Pelamar (PSB)">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Penerimaan Siswa/Anggota Baru</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola data pelamar dan proses seleksi (PSB).</p>
                    </div>
                    <Button asChild>
                        <Link href={route('psb.applicants.create')}>
                            <Plus className="size-4 mr-2" /> Pendaftaran Baru
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari pelamar"
                                placeholder="Cari nama atau no reg..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Pelamar tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isStatusModalOpen} 
                onOpenChange={setIsStatusModalOpen}
                title="Ubah Status Pelamar"
            >
                {selectedApplicant && (
                    <form onSubmit={updateStatus} className="space-y-4">
                        <div className="p-3 bg-canvas border border-line-subtle rounded-md mb-4">
                            <p className="text-sm font-bold">{selectedApplicant.full_name}</p>
                            <p className="text-xs text-fg-muted">{selectedApplicant.nik}</p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Status Baru</label>
                            <select 
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                            >
                                <option value="baru">Baru</option>
                                <option value="seleksi">Dalam Seleksi</option>
                                <option value="diterima">Diterima</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                            {status === 'diterima' && (
                                <p className="text-xs text-info mt-2">
                                    Catatan: Mengubah status menjadi "Diterima" akan mengarahkan Anda ke form pembuatan Personel baru.
                                </p>
                            )}
                        </div>

                        <TextField
                            label="Catatan (Opsional)"
                            value={notes}
                            onChange={setNotes}
                        />
                        
                        <div className="pt-4 flex justify-end gap-3">
                            <Button variant="ghost" onPress={() => setIsStatusModalOpen(false)}>Batal</Button>
                            <Button type="submit" isPending={isUpdating}>Simpan Status</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AppLayout>
    );
}
