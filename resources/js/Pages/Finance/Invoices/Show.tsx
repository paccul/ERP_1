import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Modal } from '@/Components/ui/Modal';
import { TextField } from '@/Components/ui/TextField';
import { ArrowLeft, CheckCircle, Printer, Download, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';

interface Props {
    invoice: any;
    lines: any[];
    payments: any[];
    cashAccounts: any[];
}

export default function Show({ invoice, lines, payments, cashAccounts }: Props) {
    const isDraft = invoice.status === 'draft';
    const isIssued = invoice.status === 'issued';
    const isPaid = invoice.status === 'paid';
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balanceDue = Number(invoice.total) - totalPaid;

    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const paymentForm = useForm({
        amount: balanceDue,
        cash_account_id: cashAccounts.length > 0 ? cashAccounts[0].id : '',
    });

    const handleIssue = () => {
        if (confirm('Terbitkan tagihan ini? Tindakan ini akan menjurnal piutang dan pendapatan, dan tidak bisa dibatalkan tanpa jurnal pembalik.')) {
            router.post(route('finance.invoices.issue', invoice.id));
        }
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(route('finance.invoices.pay', invoice.id), {
            onSuccess: () => {
                setIsPaymentOpen(false);
                paymentForm.reset();
            }
        });
    };

    return (
        <AppLayout title={`Invoice: ${invoice.number}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-2" asChild>
                            <Link href={route('finance.invoices.index')}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-fg-strong flex items-center gap-3">
                                {invoice.number}
                                {isDraft && <Badge variant="warning">Draft</Badge>}
                                {isIssued && <Badge variant="primary">Issued</Badge>}
                                {isPaid && <Badge variant="success">Paid (Lunas)</Badge>}
                                {invoice.status === 'void' && <Badge variant="danger">Batal</Badge>}
                            </h2>
                            <p className="text-sm text-fg-muted mt-1">
                                Klien: {invoice.client_name} &bull; Periode: {invoice.period}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isDraft && (
                            <Button variant="primary" onPress={handleIssue}>
                                <CheckCircle className="size-4 mr-2" /> Terbitkan (Issue)
                            </Button>
                        )}
                        {isIssued && (
                            <Button variant="success" onPress={() => setIsPaymentOpen(true)}>
                                <DollarSign className="size-4 mr-2" /> Terima Pembayaran
                            </Button>
                        )}
                        {!isDraft && (
                            <Button variant="secondary" asChild>
                                <a href={route('finance.invoices.pdf', invoice.id)} target="_blank" rel="noopener noreferrer">
                                    <Download className="size-4 mr-2" /> Unduh PDF
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-bold text-fg-muted uppercase mb-4">Rincian Tagihan</h3>
                            
                            <table className="w-full text-left border-collapse mb-6">
                                <thead>
                                    <tr className="border-b-2 border-line-subtle text-sm text-fg-muted">
                                        <th className="pb-3 w-1/2">Deskripsi (Lokasi Jaga)</th>
                                        <th className="pb-3 text-right">Personil</th>
                                        <th className="pb-3 text-right">Tarif</th>
                                        <th className="pb-3 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, idx) => (
                                        <tr key={idx} className="border-b border-line-subtle last:border-0">
                                            <td className="py-3 pr-2 text-sm font-bold">{line.description}</td>
                                            <td className="py-3 pr-2 text-right font-mono">{line.guards}</td>
                                            <td className="py-3 pr-2 text-right font-mono">{formatCurrency(line.rate)}</td>
                                            <td className="py-3 pr-2 text-right font-mono font-bold">{formatCurrency(line.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className="w-1/2">
                                    <div className="flex justify-between py-2 text-sm border-b border-line-subtle">
                                        <span className="text-fg-muted">Subtotal:</span>
                                        <span className="font-mono font-bold">{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-sm border-b border-line-subtle">
                                        <span className="text-fg-muted">PPN ({invoice.vat_rate}%):</span>
                                        <span className="font-mono font-bold">{formatCurrency(invoice.vat_amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 text-lg font-bold border-b-2 border-line-strong">
                                        <span>Total Tagihan:</span>
                                        <span className="text-accent">{formatCurrency(invoice.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-bold text-fg-muted uppercase mb-4">Ringkasan Status</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-fg-muted text-xs">Tgl Diterbitkan</span>
                                    <span className="font-bold">{invoice.issued_at ? formatDate(invoice.issued_at) : '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-fg-muted text-xs">Jatuh Tempo</span>
                                    <span className="font-bold">{invoice.due_at ? formatDate(invoice.due_at) : '-'}</span>
                                </div>
                                <div className="flex flex-col pt-4 border-t border-line-subtle">
                                    <span className="text-fg-muted text-xs">Total Terbayar</span>
                                    <span className="font-bold text-success text-lg">{formatCurrency(totalPaid)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-fg-muted text-xs">Sisa Tagihan</span>
                                    <span className="font-bold text-danger text-lg">{formatCurrency(balanceDue)}</span>
                                </div>
                            </div>
                        </Card>

                        {payments.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-sm font-bold text-fg-muted uppercase mb-4">Riwayat Pembayaran</h3>
                                <div className="space-y-4">
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-line-subtle pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-bold">{formatDate(p.paid_at)}</div>
                                                <div className="text-xs text-fg-muted">{p.account_name}</div>
                                            </div>
                                            <div className="font-mono font-bold text-success">{formatCurrency(p.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isPaymentOpen} onOpenChange={setIsPaymentOpen} title="Penerimaan Pembayaran Tagihan">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="bg-canvas-subtle p-3 rounded text-sm mb-4">
                        <span className="block text-fg-muted text-xs">Sisa Tagihan:</span>
                        <span className="font-bold text-lg">{formatCurrency(balanceDue)}</span>
                    </div>

                    <TextField
                        label="Jumlah Diterima (Rp)"
                        type="number"
                        step="0.01"
                        value={paymentForm.data.amount.toString()}
                        onChange={v => paymentForm.setData('amount', parseFloat(v))}
                        errorMessage={paymentForm.errors.amount}
                        required
                    />

                    <div>
                        <label className="text-sm font-bold text-fg block mb-1">Masuk Ke Akun Kas/Bank</label>
                        <select 
                            className="w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none focus:border-accent"
                            value={paymentForm.data.cash_account_id}
                            onChange={e => paymentForm.setData('cash_account_id', e.target.value)}
                            required
                        >
                            {cashAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                        {paymentForm.errors.cash_account_id && <p className="text-xs text-danger mt-1">{paymentForm.errors.cash_account_id}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onPress={() => setIsPaymentOpen(false)}>Batal</Button>
                        <Button type="submit" variant="success" isPending={paymentForm.processing}>Proses Pembayaran</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
