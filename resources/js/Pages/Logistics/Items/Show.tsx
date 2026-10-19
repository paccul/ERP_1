import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Modal } from '@/Components/ui/Modal';
import { TextField } from '@/Components/ui/TextField';
import { createColumnHelper } from '@tanstack/react-table';
import { ArrowLeft, ArrowDownCircle, Settings } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';

interface Props {
    item: any;
    movements: any[];
}

export default function Show({ item, movements }: Props) {
    const [isStockInOpen, setIsStockInOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);

    const stockInForm = useForm({
        quantity: '',
        note: '',
    });

    const adjustForm = useForm({
        difference: '',
        note: '',
    });

    const handleStockIn = (e: React.FormEvent) => {
        e.preventDefault();
        stockInForm.post(route('logistics.items.stock-in', item.id), {
            onSuccess: () => {
                setIsStockInOpen(false);
                stockInForm.reset();
            }
        });
    };

    const handleAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        adjustForm.post(route('logistics.items.adjust', item.id), {
            onSuccess: () => {
                setIsAdjustOpen(false);
                adjustForm.reset();
            }
        });
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('occurred_at', {
            header: 'Waktu Transaksi',
            cell: info => formatDate(info.getValue()),
        }),
        columnHelper.accessor('type', {
            header: 'Tipe',
            cell: info => {
                const type = info.getValue();
                if (type === 'in') return <Badge variant="success">Masuk</Badge>;
                if (type === 'out') return <Badge variant="danger">Keluar</Badge>;
                if (type === 'adjust') return <Badge variant="warning">Penyesuaian</Badge>;
                return <Badge>{type}</Badge>;
            }
        }),
        columnHelper.accessor('quantity', {
            header: 'Jumlah',
            cell: info => {
                const val = Number(info.getValue());
                const isPositive = val > 0 && info.row.original.type !== 'out';
                return (
                    <span className={`font-mono font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{val} {item.unit}
                    </span>
                );
            }
        }),
        columnHelper.accessor('balance_after', {
            header: 'Sisa Stok',
            cell: info => <span className="font-mono text-fg-strong">{info.getValue()} {item.unit}</span>,
        }),
        columnHelper.accessor('note', {
            header: 'Keterangan',
            cell: info => info.getValue() || '-',
        }),
    ];

    return (
        <AppLayout title={`Kartu Stok: ${item.code}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-2" asChild>
                            <Link href={route('logistics.items.index')}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-fg-strong flex items-center gap-3">
                                {item.code} - {item.name}
                            </h2>
                            <p className="text-sm text-fg-muted mt-1">
                                {item.category || 'Tanpa Kategori'} &bull; Harga: {formatCurrency(item.unit_price)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="primary" onPress={() => setIsStockInOpen(true)}>
                            <ArrowDownCircle className="size-4 mr-2" /> Barang Masuk
                        </Button>
                        <Button variant="secondary" onPress={() => setIsAdjustOpen(true)}>
                            <Settings className="size-4 mr-2" /> Stok Opname (Adjust)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-fg-muted uppercase mb-4">Informasi Barang</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-fg-muted">Satuan:</span>
                                <span className="font-bold">{item.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-fg-muted">Ukuran:</span>
                                <span className="font-bold">{item.size || '-'}</span>
                            </div>
                            <div className="flex justify-between border-t border-line-subtle pt-3">
                                <span className="text-fg-muted">Stok Saat Ini:</span>
                                <span className="text-2xl font-bold text-accent">{item.stock_on_hand}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-fg-muted">Minimum Stok:</span>
                                <span>{item.min_stock}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 md:col-span-2 flex flex-col">
                        <h3 className="text-sm font-bold text-fg-muted uppercase mb-4">Kartu Stok (Riwayat Mutasi)</h3>
                        <div className="flex-1">
                            <DataTable 
                                data={movements}
                                columns={columns}
                                emptyTitle="Belum ada riwayat mutasi."
                                enableClientSidePagination
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal Barang Masuk */}
            <Modal isOpen={isStockInOpen} onOpenChange={setIsStockInOpen} title="Input Barang Masuk">
                <form onSubmit={handleStockIn} className="space-y-4">
                    <TextField
                        label={`Kuantitas Masuk (${item.unit})`}
                        type="number"
                        step="0.01"
                        value={stockInForm.data.quantity}
                        onChange={v => stockInForm.setData('quantity', v)}
                        errorMessage={stockInForm.errors.quantity}
                        required
                    />
                    <TextField
                        label="Keterangan / Referensi Pembelian"
                        value={stockInForm.data.note}
                        onChange={v => stockInForm.setData('note', v)}
                        errorMessage={stockInForm.errors.note}
                        required
                    />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onPress={() => setIsStockInOpen(false)}>Batal</Button>
                        <Button type="submit" isPending={stockInForm.processing}>Proses Masuk</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Penyesuaian Stok */}
            <Modal isOpen={isAdjustOpen} onOpenChange={setIsAdjustOpen} title="Penyesuaian Stok Opname">
                <form onSubmit={handleAdjust} className="space-y-4">
                    <div className="bg-warning/10 text-warning text-sm p-3 rounded-md mb-4 border border-warning/30">
                        Input perbedaan stok aktual dengan sistem. Jika aktual lebih sedikit, gunakan angka minus (-).
                    </div>
                    <TextField
                        label={`Selisih / Perbedaan (${item.unit})`}
                        type="number"
                        step="0.01"
                        value={adjustForm.data.difference}
                        onChange={v => adjustForm.setData('difference', v)}
                        errorMessage={adjustForm.errors.difference}
                        placeholder="-5 atau 5"
                        required
                    />
                    <TextField
                        label="Alasan Penyesuaian"
                        value={adjustForm.data.note}
                        onChange={v => adjustForm.setData('note', v)}
                        errorMessage={adjustForm.errors.note}
                        required
                    />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onPress={() => setIsAdjustOpen(false)}>Batal</Button>
                        <Button type="submit" isPending={adjustForm.processing}>Sesuaikan Stok</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
