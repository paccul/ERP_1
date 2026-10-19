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
    payrollRuns: any[];
}

export default function Index({ payrollRuns }: Props) {
    const [search, setSearch] = useState('');

    const filtered = payrollRuns.filter(p => 
        p.site_name.toLowerCase().includes(search.toLowerCase()) || 
        p.period.toLowerCase().includes(search.toLowerCase())
    );

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('period', {
            header: 'Periode',
            cell: info => <span className="font-bold font-mono">{info.getValue()}</span>,
        }),
        columnHelper.accessor('site_name', {
            header: 'Lokasi Jaga (Site)',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const s = info.getValue();
                if (s === 'posted') return <Badge variant="success">Posted</Badge>;
                return <Badge variant="warning">Draft</Badge>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                    <Link href={route('finance.payrolls.show', info.row.original.id)}>
                        <Eye className="size-3 mr-1" /> Kelola & Rincian
                    </Link>
                </Button>
            )
        })
    ];

    return (
        <AppLayout title="Payroll (Penggajian)">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Payroll (Penggajian Personil)</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola kalkulasi gaji, lembur, dan potongan otomatis per site.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('finance.payrolls.create')}>
                            <Plus className="size-4 mr-2" /> Generate Payroll Baru
                        </Link>
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari payroll"
                                placeholder="Cari site, periode..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Payroll tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
