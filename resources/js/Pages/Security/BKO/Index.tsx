import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Props {
    requests: any[];
    personnels: any[];
    sites: any[];
    shifts: any[];
}

export default function Index({ requests, personnels, sites, shifts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [status, setStatus] = useState<'approved'|'rejected'>('approved');
    const [decisionNote, setDecisionNote] = useState('');
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        personnel_id: '',
        from_site_id: '',
        to_site_id: '',
        shift_id: '',
        starts_on: '',
        ends_on: '',
        reason: '',
    });

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('security.bko.store'), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleApproval = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;
        
        router.put(route('security.bko.approve', selectedId), {
            status,
            decision_note: decisionNote
        }, {
            onSuccess: () => setIsApprovalOpen(false)
        });
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('personnel_name', {
            header: 'Personel',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: 'site_change',
            header: 'Mutasi BKO',
            cell: info => (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-fg-muted">{info.row.original.from_site_name}</span>
                    <ArrowRight className="size-3 text-accent" />
                    <span className="font-bold text-fg-strong">{info.row.original.to_site_name}</span>
                </div>
            )
        }),
        columnHelper.display({
            id: 'period',
            header: 'Periode',
            cell: info => (
                <div className="text-sm">
                    {formatDate(info.row.original.starts_on)} - {formatDate(info.row.original.ends_on)}
                    <div className="text-xs text-fg-muted mt-0.5">{info.row.original.shift_name}</div>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const s = info.getValue();
                if (s === 'approved') return <Badge variant="success">Disetujui</Badge>;
                if (s === 'rejected') return <Badge variant="danger">Ditolak</Badge>;
                return <Badge variant="warning">Menunggu</Badge>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => info.row.original.status === 'pending' ? (
                <Button 
                    variant="secondary" 
                    className="px-2 py-1 h-auto text-xs"
                    onPress={() => {
                        setSelectedId(info.row.original.id);
                        setStatus('approved');
                        setDecisionNote('');
                        setIsApprovalOpen(true);
                    }}
                >
                    Proses
                </Button>
            ) : null
        })
    ];

    return (
        <AppLayout title="Persetujuan BKO">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">BKO (Bawah Kendali Operasi)</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola pengajuan pindah tugas / plotting darurat.</p>
                    </div>
                    <Button onPress={openModal}>
                        <Plus className="size-4 mr-2" /> Ajukan BKO Baru
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <DataTable 
                        data={requests}
                        columns={columns}
                        emptyTitle="Tidak ada pengajuan"
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                title="Ajukan BKO Baru"
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-fg block mb-1">Personel</label>
                        <select 
                            className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                            value={data.personnel_id}
                            onChange={e => setData('personnel_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Personel --</option>
                            {personnels.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                            ))}
                        </select>
                        {errors.personnel_id && <p className="text-xs text-danger mt-1">{errors.personnel_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Lokasi Asal</label>
                            <select 
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                value={data.from_site_id}
                                onChange={e => setData('from_site_id', e.target.value)}
                                required
                            >
                                <option value="">-- Lokasi Asal --</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.from_site_id && <p className="text-xs text-danger mt-1">{errors.from_site_id}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-bold text-fg block mb-1">Lokasi Tujuan BKO</label>
                            <select 
                                className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                                value={data.to_site_id}
                                onChange={e => setData('to_site_id', e.target.value)}
                                required
                            >
                                <option value="">-- Lokasi Tujuan --</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.to_site_id && <p className="text-xs text-danger mt-1">{errors.to_site_id}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm font-bold text-fg block mb-1">Shift</label>
                        <select 
                            className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                            value={data.shift_id}
                            onChange={e => setData('shift_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Shift --</option>
                            {shifts.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.shift_id && <p className="text-xs text-danger mt-1">{errors.shift_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Tanggal Mulai"
                            type="date"
                            value={data.starts_on}
                            onChange={v => setData('starts_on', v)}
                            errorMessage={errors.starts_on}
                            required
                        />
                        <TextField
                            label="Tanggal Selesai"
                            type="date"
                            value={data.ends_on}
                            onChange={v => setData('ends_on', v)}
                            errorMessage={errors.ends_on}
                            required
                        />
                    </div>
                    
                    <TextField
                        label="Alasan BKO"
                        value={data.reason}
                        onChange={v => setData('reason', v)}
                        errorMessage={errors.reason}
                    />
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onPress={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit" isPending={processing}>Ajukan BKO</Button>
                    </div>
                </form>
            </Modal>
            
            <Modal 
                isOpen={isApprovalOpen} 
                onOpenChange={setIsApprovalOpen}
                title="Proses Persetujuan BKO"
            >
                <form onSubmit={handleApproval} className="space-y-4">
                    <p className="text-sm text-fg-muted mb-4">
                        Persetujuan BKO akan secara otomatis menimpa jadwal personel yang ada di rentang tanggal BKO dan menggantinya dengan jadwal di lokasi yang baru.
                    </p>
                    
                    <div>
                        <label className="text-sm font-bold text-fg block mb-1">Keputusan</label>
                        <select 
                            className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                            value={status}
                            onChange={e => setStatus(e.target.value as any)}
                        >
                            <option value="approved">Setujui BKO</option>
                            <option value="rejected">Tolak Pengajuan</option>
                        </select>
                    </div>

                    <TextField
                        label="Catatan (Opsional)"
                        value={decisionNote}
                        onChange={v => setDecisionNote(v)}
                    />
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onPress={() => setIsApprovalOpen(false)}>Batal</Button>
                        <Button type="submit">Simpan Keputusan</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
