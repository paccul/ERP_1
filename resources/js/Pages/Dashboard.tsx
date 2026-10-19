import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { Users, MapPin, AlertCircle, DollarSign, Package } from 'lucide-react';

interface Props {
    metrics: {
        active_personnel: number;
        active_sites: number;
        pending_bko: number;
        overdue_invoices: number;
        low_stock_items: number;
    };
    permissions: {
        can_view_personnel: boolean;
        can_view_sites: boolean;
        can_view_bko: boolean;
        can_view_finance: boolean;
        can_view_logistics: boolean;
    };
}

export default function Dashboard({ metrics, permissions }: Props) {
    return (
        <AppLayout title="Dashboard">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-fg-strong">Dashboard Terpusat</h2>
                    <p className="text-sm text-fg-muted mt-1">Ringkasan operasional dan keuangan PT Garda Global Semesta.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {permissions.can_view_personnel && (
                        <Link href={route('security.personnels.index', { status: 'active' })} className="block">
                            <Card className="p-6 border-t-4 border-t-primary hover:bg-canvas-subtle transition-colors h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary/20 text-primary rounded-full">
                                        <Users className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-fg-muted uppercase">Personel Aktif</h3>
                                </div>
                                <p className="text-3xl font-bold font-mono text-fg-strong">{metrics.active_personnel}</p>
                            </Card>
                        </Link>
                    )}

                    {permissions.can_view_sites && (
                        <Link href={route('security.locations.index', { status: 'active' })} className="block">
                            <Card className="p-6 border-t-4 border-t-accent hover:bg-canvas-subtle transition-colors h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-accent/20 text-accent rounded-full">
                                        <MapPin className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-fg-muted uppercase">Lokasi Aktif</h3>
                                </div>
                                <p className="text-3xl font-bold font-mono text-fg-strong">{metrics.active_sites}</p>
                            </Card>
                        </Link>
                    )}

                    {permissions.can_view_bko && (
                        <Link href={route('security.bko.index', { status: 'pending' })} className="block">
                            <Card className="p-6 border-t-4 border-t-warning hover:bg-canvas-subtle transition-colors h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-warning/20 text-warning rounded-full">
                                        <AlertCircle className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-fg-muted uppercase">BKO Pending</h3>
                                </div>
                                <p className="text-3xl font-bold font-mono text-warning">{metrics.pending_bko}</p>
                            </Card>
                        </Link>
                    )}

                    {permissions.can_view_finance && (
                        <Link href={route('finance.invoices.index', { status: 'issued' })} className="block">
                            <Card className="p-6 border-t-4 border-t-danger hover:bg-canvas-subtle transition-colors h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-danger/20 text-danger rounded-full">
                                        <DollarSign className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-fg-muted uppercase">Piutang Overdue</h3>
                                </div>
                                <p className="text-3xl font-bold font-mono text-danger">{metrics.overdue_invoices}</p>
                            </Card>
                        </Link>
                    )}

                    {permissions.can_view_logistics && (
                        <Link href={route('logistics.items.index')} className="block">
                            <Card className="p-6 border-t-4 border-t-success hover:bg-canvas-subtle transition-colors h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-success/20 text-success rounded-full">
                                        <Package className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-fg-muted uppercase">Stok Logistik Menipis</h3>
                                </div>
                                <p className="text-3xl font-bold font-mono text-success">{metrics.low_stock_items}</p>
                            </Card>
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
