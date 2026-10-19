import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Calendar } from 'lucide-react';

interface Props {
    reports: any[];
    currentMonth: string;
}

export default function Index({ reports, currentMonth }: Props) {
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('security.reports.index'), { month: e.target.value }, { preserveState: true });
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('personnel_name', {
            header: 'Personel',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('total_attendance', {
            header: 'Total Hadir',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('total_late', {
            header: 'Total Terlambat',
            cell: info => <span className="text-warning font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('total_absent', {
            header: 'Total Alpa',
            cell: info => <span className="text-danger font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('total_overtime_hours', {
            header: 'Total Lembur (Jam)',
            cell: info => info.getValue() || 0,
        }),
    ];

    return (
        <AppLayout title="Laporan Absensi & Lembur">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Laporan Bulanan</h2>
                        <p className="text-sm text-fg-muted mt-1">Rekapitulasi absensi dan lembur personel keamanan.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-canvas border border-line-input rounded-sm px-3 py-2">
                        <Calendar className="size-4 text-fg-muted" />
                        <input 
                            type="month" 
                            value={currentMonth}
                            onChange={handleMonthChange}
                            className="bg-transparent border-none text-sm outline-none text-fg-strong"
                        />
                    </div>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <DataTable 
                        data={reports}
                        columns={columns}
                        emptyTitle="Data tidak ditemukan"
                        emptyDescription="Tidak ada data absensi untuk bulan ini."
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
