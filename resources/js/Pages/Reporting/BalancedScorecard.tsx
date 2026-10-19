import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { DollarSign, Users, Briefcase, Activity } from 'lucide-react';

interface Props {
    metrics: {
        finance: { revenue_growth: number, profit_margin: number };
        customer: { client_retention: number, new_clients: number };
        internal: { incident_resolved: number, bko_efficiency: number };
        learning: { training_hours: number, turnover_rate: number };
    };
}

export default function BalancedScorecard({ metrics }: Props) {
    return (
        <AppLayout title="Balanced Scorecard">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-fg-strong">Balanced Scorecard BUJP</h2>
                    <p className="text-sm text-fg-muted mt-1">Pengukuran kinerja komprehensif berdasarkan 4 perspektif utama.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Keuangan */}
                    <Card className="p-6 border-t-4 border-t-success">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-success/20 text-success rounded-full">
                                <DollarSign className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold">Perspektif Keuangan</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-fg-muted">Pertumbuhan Pendapatan (YoY)</p>
                                <p className="text-2xl font-bold font-mono text-success">+{metrics.finance.revenue_growth}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-fg-muted">Net Profit Margin</p>
                                <p className="text-2xl font-bold font-mono">{metrics.finance.profit_margin}%</p>
                            </div>
                        </div>
                    </Card>

                    {/* Pelanggan */}
                    <Card className="p-6 border-t-4 border-t-accent">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-accent/20 text-accent rounded-full">
                                <Users className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold">Perspektif Pelanggan</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-fg-muted">Client Retention Rate</p>
                                <p className="text-2xl font-bold font-mono">{metrics.customer.client_retention}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-fg-muted">Klien Baru (YTD)</p>
                                <p className="text-2xl font-bold font-mono text-accent">+{metrics.customer.new_clients} Klien</p>
                            </div>
                        </div>
                    </Card>

                    {/* Proses Internal */}
                    <Card className="p-6 border-t-4 border-t-primary">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/20 text-primary rounded-full">
                                <Briefcase className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold">Perspektif Proses Internal</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-fg-muted">Insiden Terselesaikan (SLA)</p>
                                <p className="text-2xl font-bold font-mono">{metrics.internal.incident_resolved}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-fg-muted">Efisiensi Pemenuhan BKO</p>
                                <p className="text-2xl font-bold font-mono">{metrics.internal.bko_efficiency}%</p>
                            </div>
                        </div>
                    </Card>

                    {/* Pembelajaran & Pertumbuhan */}
                    <Card className="p-6 border-t-4 border-t-warning">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-warning/20 text-warning rounded-full">
                                <Activity className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold">Perspektif Pembelajaran</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-fg-muted">Total Jam Pelatihan Karyawan</p>
                                <p className="text-2xl font-bold font-mono">{metrics.learning.training_hours} Jam</p>
                            </div>
                            <div>
                                <p className="text-sm text-fg-muted">Tingkat Turnover Personel</p>
                                <p className="text-2xl font-bold font-mono text-warning">{metrics.learning.turnover_rate}%</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
