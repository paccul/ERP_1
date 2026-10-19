import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';

interface Props {
    journal: any;
    lines: any[];
}

export default function Show({ journal, lines }: Props) {
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);
    
    const isDraft = journal.status === 'draft';
    const isPosted = journal.status === 'posted';

    const handlePost = () => {
        if (confirm('Bukukan (Post) jurnal ini ke buku besar? Tindakan ini tidak bisa dibatalkan tanpa auto-reversal.')) {
            router.post(route('journals.post', journal.id));
        }
    };

    const handleReverse = () => {
        if (confirm('Lakukan Auto-Reversal untuk membalik transaksi jurnal ini?')) {
            router.post(route('journals.reverse', journal.id));
        }
    };

    return (
        <AppLayout title={`Jurnal: ${journal.number}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="px-2" asChild>
                            <Link href={route('journals.index')}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-fg-strong flex items-center gap-3">
                                {journal.number}
                                {isDraft && <Badge variant="warning">Draft</Badge>}
                                {isPosted && <Badge variant="success">Posted</Badge>}
                                {journal.status === 'voided' && <Badge variant="danger">Voided</Badge>}
                            </h2>
                            <p className="text-sm text-fg-muted mt-1">
                                {formatDate(journal.date)} &bull; {journal.reference || 'Tanpa Referensi'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isDraft && (
                            <Button variant="primary" onPress={handlePost}>
                                <CheckCircle className="size-4 mr-2" /> Post Jurnal
                            </Button>
                        )}
                        {isPosted && !journal.reversal_of_id && (
                            <Button variant="danger" onPress={handleReverse}>
                                <RotateCcw className="size-4 mr-2" /> Auto Reverse
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="p-6">
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-fg-muted uppercase tracking-wider mb-1">Keterangan</h3>
                        <p className="text-fg-strong">{journal.description || '-'}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-line-subtle text-sm text-fg-muted">
                                    <th className="pb-3 w-1/3">Akun</th>
                                    <th className="pb-3 w-1/4">Memo</th>
                                    <th className="pb-3 w-1/5 text-right">Debit</th>
                                    <th className="pb-3 w-1/5 text-right">Kredit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line, idx) => (
                                    <tr key={idx} className="border-b border-line-subtle last:border-0">
                                        <td className="py-3 pr-2">
                                            <div className="font-bold text-sm">{line.account_code}</div>
                                            <div className="text-xs text-fg-muted">{line.account_name}</div>
                                            {line.site_name && (
                                                <div className="text-xs text-accent mt-1 inline-block bg-accent/10 px-1 rounded">
                                                    Site: {line.site_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 pr-2 text-sm">{line.memo || '-'}</td>
                                        <td className="py-3 pr-2 text-right font-mono text-sm">
                                            {Number(line.debit) > 0 ? formatCurrency(line.debit) : ''}
                                        </td>
                                        <td className="py-3 pr-2 text-right font-mono text-sm">
                                            {Number(line.credit) > 0 ? formatCurrency(line.credit) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-canvas-subtle border-t-2 border-line-subtle">
                                    <td colSpan={2} className="py-4 px-2 font-bold text-right">TOTAL</td>
                                    <td className="py-4 pr-2 font-bold font-mono text-right border-double border-b-4 border-line-strong">
                                        {formatCurrency(totalDebit)}
                                    </td>
                                    <td className="py-4 pr-2 font-bold font-mono text-right border-double border-b-4 border-line-strong">
                                        {formatCurrency(totalCredit)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
