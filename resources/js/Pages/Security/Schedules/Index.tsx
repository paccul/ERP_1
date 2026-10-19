import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { TextField } from '@/Components/ui/TextField';
import { Select, SelectItem } from '@/Components/ui/Select';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Calendar, Plus } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Props {
    schedules: any[];
    currentMonth: string;
    personnels: any[];
    locations: any[];
    shifts: any[];
}

export default function Index({ schedules, currentMonth, personnels, locations, shifts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        personnel_id: '',
        site_id: '',
        shift_id: '',
        date: '',
    });

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('security.schedules.index'), { month: e.target.value }, { preserveState: true });
    };

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('security.schedules.store'), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('date', {
            header: 'Tanggal',
            cell: info => <span className="font-bold">{formatDate(info.getValue())}</span>,
        }),
        columnHelper.accessor('personnel_name', {
            header: 'Personel',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('location_name', {
            header: 'Lokasi Jaga',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('shift_name', {
            header: 'Shift',
            cell: info => (
                <div>
                    <p className="font-bold">{info.getValue()}</p>
                    <p className="text-xs text-fg-muted">{info.row.original.start_time} - {info.row.original.end_time}</p>
                </div>
            ),
        }),
    ];

    return (
        <AppLayout title="Plotting Jadwal">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Plotting Jadwal</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola jadwal jaga personel keamanan.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-canvas border border-line-input rounded-sm px-3 py-2">
                            <Calendar className="size-4 text-fg-muted" />
                            <input 
                                type="month" 
                                value={currentMonth}
                                onChange={handleMonthChange}
                                className="bg-transparent border-none text-sm outline-none text-fg-strong"
                            />
                        </div>
                        <Button onPress={openModal}>
                            <Plus className="size-4 mr-2" /> Plotting Jadwal
                        </Button>
                    </div>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <DataTable 
                        data={schedules}
                        columns={columns}
                        emptyTitle="Jadwal kosong"
                        emptyDescription="Belum ada jadwal yang diplot pada bulan ini."
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                title="Plotting Jadwal Baru"
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

                    <div>
                        <label className="text-sm font-bold text-fg block mb-1">Lokasi Jaga</label>
                        <select 
                            className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                            value={data.site_id}
                            onChange={e => setData('site_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Lokasi --</option>
                            {locations.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        {errors.site_id && <p className="text-xs text-danger mt-1">{errors.site_id}</p>}
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
                                <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                            ))}
                        </select>
                        {errors.shift_id && <p className="text-xs text-danger mt-1">{errors.shift_id}</p>}
                    </div>

                    <TextField
                        label="Tanggal"
                        type="date"
                        value={data.date}
                        onChange={v => setData('date', v)}
                        errorMessage={errors.date}
                        isInvalid={!!errors.date}
                        required
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
