import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Card } from '@/Components/ui/Card';
import { createColumnHelper } from '@tanstack/react-table';
import { Clock, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Props {
    attendances: any[];
    mySchedule: any | null;
}

export default function Index({ attendances, mySchedule }: Props) {
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // In a real app, use Geolocation API
    const handleCheckIn = () => {
        setIsCheckingIn(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                router.post(route('security.attendances.check-in'), {
                    roster_assignment_id: mySchedule.id,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }, {
                    onFinish: () => setIsCheckingIn(false)
                });
            },
            (err) => {
                alert("Gagal mendapatkan lokasi: " + err.message);
                setIsCheckingIn(false);
            }
        );
    };

    const handleCheckOut = () => {
        setIsCheckingOut(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                router.post(route('security.attendances.check-out'), {
                    roster_assignment_id: mySchedule.id,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }, {
                    onFinish: () => setIsCheckingOut(false)
                });
            },
            (err) => {
                alert("Gagal mendapatkan lokasi: " + err.message);
                setIsCheckingOut(false);
            }
        );
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('personnel_name', {
            header: 'Personel',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('location_name', {
            header: 'Lokasi',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('check_in_time', {
            header: 'Check In',
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleTimeString('id-ID') : '-',
        }),
        columnHelper.accessor('check_out_time', {
            header: 'Check Out',
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleTimeString('id-ID') : '-',
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const s = info.getValue();
                if (s === 'present') return <Badge variant="success">Tepat Waktu</Badge>;
                if (s === 'late') return <Badge variant="warning">Terlambat</Badge>;
                return <Badge variant="danger">{s}</Badge>;
            },
        }),
    ];

    return (
        <AppLayout title="Absensi Hari Ini">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Absensi Keamanan</h2>
                        <p className="text-sm text-fg-muted mt-1">Data absensi hari ini ({formatDate(new Date())}).</p>
                    </div>
                </div>

                {mySchedule && (
                    <Card className="p-6 bg-accent-soft border-accent/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-accent-soft-fg flex items-center gap-2">
                                    <Clock className="size-5" /> Jadwal Saya Hari Ini
                                </h3>
                                <div className="mt-3 flex flex-col sm:flex-row gap-4 text-sm text-fg-strong">
                                    <p className="flex items-center gap-1">
                                        <MapPin className="size-4 text-fg-muted" /> {mySchedule.location_name}
                                    </p>
                                    <p className="font-bold border border-accent/30 px-2 py-0.5 rounded bg-white/50">
                                        {mySchedule.shift_name} ({mySchedule.start_time} - {mySchedule.end_time})
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button 
                                    className="flex-1 md:flex-none" 
                                    onPress={handleCheckIn} 
                                    isPending={isCheckingIn}
                                >
                                    Check In
                                </Button>
                                <Button 
                                    variant="danger" 
                                    className="flex-1 md:flex-none" 
                                    onPress={handleCheckOut} 
                                    isPending={isCheckingOut}
                                >
                                    Check Out
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <DataTable 
                        data={attendances}
                        columns={columns}
                        emptyTitle="Belum ada data absensi"
                        enableClientSidePagination
                    />
                </div>
            </div>
        </AppLayout>
    );
}
