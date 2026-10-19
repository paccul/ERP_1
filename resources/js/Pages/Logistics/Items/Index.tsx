import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DataTable } from '@/Components/ui/DataTable';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { TextField } from '@/Components/ui/TextField';
import { Modal } from '@/Components/ui/Modal';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface Props {
    items: any[];
}

export default function Index({ items }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        category: '',
        unit: '',
        size: '',
        min_stock: 0,
        unit_price: 0,
        notes: '',
    });

    const filtered = items.filter(i => 
        (i.code || "").toLowerCase().includes(search.toLowerCase()) || 
        (i.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = () => {
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('logistics.items.store'), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor('code', {
            header: 'Kode Barang',
            cell: info => <span className="font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('name', {
            header: 'Nama Barang',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('category', {
            header: 'Kategori',
            cell: info => info.getValue() || '-',
        }),
        columnHelper.accessor('stock_on_hand', {
            header: 'Stok',
            cell: info => (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{info.getValue()} {info.row.original.unit}</span>
                    {Number(info.getValue()) <= Number(info.row.original.min_stock) && (
                        <Badge variant="danger" className="text-[10px] px-1 py-0">Low</Badge>
                    )}
                </div>
            )
        }),
        columnHelper.accessor('unit_price', {
            header: 'Harga Satuan',
            cell: info => formatCurrency(info.getValue()),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <Button variant="secondary" className="px-2 py-1 h-auto text-xs" asChild>
                    <Link href={route('logistics.items.show', info.row.original.id)}>
                        <Eye className="size-3 mr-1" /> Detail Stok
                    </Link>
                </Button>
            )
        })
    ];

    return (
        <AppLayout title="Data Barang (Logistik)">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">Data Barang (Logistik)</h2>
                        <p className="text-sm text-fg-muted mt-1">Kelola master data barang dan persediaan.</p>
                    </div>
                    <Button onPress={openModal}>
                        <Plus className="size-4 mr-2" /> Tambah Barang
                    </Button>
                </div>

                <div className="bg-canvas rounded-md border border-line-subtle p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted" />
                            <TextField 
                                aria-label="Cari barang"
                                placeholder="Cari kode, nama, atau kategori..."
                                value={search}
                                onChange={setSearch}
                                className="w-full pl-9"
                            />
                        </div>
                    </div>
                    
                    <DataTable 
                        data={filtered}
                        columns={columns}
                        emptyTitle="Barang tidak ditemukan"
                        enableClientSidePagination
                    />
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                title="Tambah Barang Baru"
            >
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Kode Barang"
                            value={data.code}
                            onChange={v => setData('code', v)}
                            errorMessage={errors.code}
                            isInvalid={!!errors.code}
                            required
                        />
                        <TextField
                            label="Kategori"
                            value={data.category}
                            onChange={v => setData('category', v)}
                            errorMessage={errors.category}
                        />
                    </div>
                    
                    <TextField
                        label="Nama Barang"
                        value={data.name}
                        onChange={v => setData('name', v)}
                        errorMessage={errors.name}
                        isInvalid={!!errors.name}
                        required
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Satuan (Pcs, Box, dll)"
                            value={data.unit}
                            onChange={v => setData('unit', v)}
                            errorMessage={errors.unit}
                            required
                        />
                        <TextField
                            label="Ukuran (Opsional)"
                            value={data.size}
                            onChange={v => setData('size', v)}
                            errorMessage={errors.size}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Minimal Stok"
                            type="number"
                            value={data.min_stock.toString()}
                            onChange={v => setData('min_stock', parseFloat(v))}
                            errorMessage={errors.min_stock}
                        />
                        <TextField
                            label="Harga Satuan (Rp)"
                            type="number"
                            value={data.unit_price.toString()}
                            onChange={v => setData('unit_price', parseFloat(v))}
                            errorMessage={errors.unit_price}
                        />
                    </div>
                    
                    <TextField
                        label="Keterangan / Catatan"
                        value={data.notes}
                        onChange={v => setData('notes', v)}
                        errorMessage={errors.notes}
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
