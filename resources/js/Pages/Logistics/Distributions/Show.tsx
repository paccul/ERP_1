import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Props {
    distribution: any;
    lines: any[];
    recipientName: string;
}

export default function Show({ distribution, lines, recipientName }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title={`Distribusi: ${distribution.number}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-2" asChild>
                            <Link href={route('logistics.distributions.index')}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-fg-strong flex items-center gap-3">
                                {distribution.number}
                            </h2>
                            <p className="text-sm text-fg-muted mt-1">
                                {formatDate(distribution.distributed_at)}
                            </p>
                        </div>
                    </div>
                    <Button variant="secondary" onPress={handlePrint}>
                        <Printer className="size-4 mr-2" /> Cetak Bukti Keluar
                    </Button>
                </div>

                <Card className="p-8 print:shadow-none print:border-none print:p-0">
                    <div className="text-center mb-8 border-b-2 border-line-strong pb-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Tanda Terima Logistik</h2>
                        <p className="text-fg-muted">Garda ERP Security Services</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm text-fg-muted mb-1">Diberikan Kepada:</p>
                            <p className="font-bold text-lg">{recipientName}</p>
                            <p className="text-sm capitalize mt-1">({distribution.recipient_type})</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-fg-muted mb-1">Nomor Referensi:</p>
                            <p className="font-bold font-mono text-lg">{distribution.number}</p>
                            <p className="text-sm text-fg-muted mt-1">Tanggal: {formatDate(distribution.distributed_at)}</p>
                        </div>
                    </div>

                    {distribution.note && (
                        <div className="mb-6 p-4 bg-canvas-subtle border border-line-subtle rounded text-sm">
                            <span className="font-bold block mb-1">Catatan:</span>
                            {distribution.note}
                        </div>
                    )}

                    <table className="w-full text-left border-collapse mb-12">
                        <thead>
                            <tr className="border-b-2 border-line-strong text-sm font-bold uppercase">
                                <th className="py-3 px-2">No</th>
                                <th className="py-3 px-2">Kode Barang</th>
                                <th className="py-3 px-2">Deskripsi Barang</th>
                                <th className="py-3 px-2 text-right">Kuantitas</th>
                                <th className="py-3 px-2">Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, idx) => (
                                <tr key={idx} className="border-b border-line-subtle">
                                    <td className="py-3 px-2">{idx + 1}</td>
                                    <td className="py-3 px-2 font-mono text-sm">{line.code}</td>
                                    <td className="py-3 px-2 font-bold">{line.name}</td>
                                    <td className="py-3 px-2 text-right font-mono font-bold text-lg">{Number(line.quantity)}</td>
                                    <td className="py-3 px-2">{line.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="grid grid-cols-3 gap-8 text-center pt-8 mt-8">
                        <div>
                            <p className="mb-16 text-sm">Penerima,</p>
                            <p className="font-bold border-b border-line-strong inline-block px-4">{recipientName}</p>
                        </div>
                        <div>
                            {/* Empty space */}
                        </div>
                        <div>
                            <p className="mb-16 text-sm">Petugas Gudang,</p>
                            <p className="font-bold border-b border-line-strong inline-block px-8">&nbsp;</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
