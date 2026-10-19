"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Scale,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createJournalEntry } from "@/app/dashboard/accounting/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Tables } from "@/types/database.types";

interface JournalEditorProps {
  accounts: Tables<"accounts">[];
}

interface EditorLine {
  id: string;
  account_id: string;
  debit: number;
  credit: number;
  memo: string;
}

export function JournalEditor({ accounts }: JournalEditorProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultVoucher = `JV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [entryNumber, setEntryNumber] = useState(defaultVoucher);
  const [entryDate, setEntryDate] = useState(todayStr);
  const [description, setDescription] = useState("");

  const [lines, setLines] = useState<EditorLine[]>([
    {
      id: "1",
      account_id: accounts[0]?.id || "",
      debit: 0,
      credit: 0,
      memo: "",
    },
    {
      id: "2",
      account_id: accounts[1]?.id || "",
      debit: 0,
      credit: 0,
      memo: "",
    },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: String(Date.now()),
        account_id: accounts[0]?.id || "",
        debit: 0,
        credit: 0,
        memo: "",
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      alert("Jurnal double-entry minimal harus memiliki 2 baris rekening");
      return;
    }
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof EditorLine, val: unknown) => {
    setLines(
      lines.map((l) => {
        if (l.id !== id) return l;

        if (field === "debit") {
          const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
          return {
            ...l,
            debit: num,
            credit: num > 0 ? 0 : l.credit, // Mutually exclusive
          };
        }

        if (field === "credit") {
          const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
          return {
            ...l,
            credit: num,
            debit: num > 0 ? 0 : l.debit, // Mutually exclusive
          };
        }

        return { ...l, [field]: val };
      })
    );
  };

  const totalDebit = lines.reduce((acc, l) => acc + (l.debit || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (l.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalCredit > 0 && difference < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!isBalanced) {
      setServerError(`Jurnal belum seimbang: Selisih Rp ${difference.toLocaleString("id-ID")}`);
      return;
    }

    if (!description.trim()) {
      setServerError("Deskripsi transaksi jurnal wajib diisi minimal 5 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createJournalEntry({
        entry_number: entryNumber,
        entry_date: entryDate,
        description,
        lines: lines.map((l) => ({
          account_id: l.account_id,
          debit: l.debit || 0,
          credit: l.credit || 0,
          memo: l.memo || null,
        })),
      });

      if (!res.success) {
        setServerError(res.error || "Gagal memposting jurnal");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/accounting/journals");
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan sistem saat menyimpan jurnal");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Header Voucher Card */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#f59e0b]" />
            Header Voucher Jurnal Double-Entry
          </CardTitle>
          <CardDescription className="text-gray-400">
            Penetapan nomor bukti memorial, tanggal pembukuan, dan ringkasan transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entry_number" className="text-gray-300">
                Nomor Bukti Voucher <span className="text-red-400">*</span>
              </Label>
              <Input
                id="entry_number"
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
                className="mt-1 bg-[#111827] border-[#374151] text-white font-mono uppercase focus-visible:ring-[#f59e0b]"
                required
              />
            </div>

            <div>
              <Label htmlFor="entry_date" className="text-gray-300">
                Tanggal Pembukuan <span className="text-red-400">*</span>
              </Label>
              <Input
                id="entry_date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">
                Keterangan Transaksi <span className="text-red-400">*</span>
              </Label>
              <Input
                id="description"
                placeholder="Contoh: Pengisian Kas Kecil Pos Pengamanan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 bg-[#111827] border-[#374151] text-white focus-visible:ring-[#f59e0b]"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lines Editor Card */}
      <Card className="bg-[#030712] border-[#374151]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base text-white">
              Baris Rekening Debit & Kredit
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Masukkan akun tujuan debit dan akun sumber kredit secara berpasangan
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addLine}
            variant="outline"
            className="border-[#374151] text-gray-300 hover:bg-[#111827]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Baris Rekening
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#374151] text-xs text-gray-400">
                  <th className="pb-2 font-medium">Akun Rekening COA</th>
                  <th className="pb-2 font-medium w-48">Debit (Rp)</th>
                  <th className="pb-2 font-medium w-48">Kredit (Rp)</th>
                  <th className="pb-2 font-medium">Memo / Uraian</th>
                  <th className="pb-2 font-medium w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#374151]/50">
                {lines.map((l, idx) => (
                  <tr key={l.id} className="pt-2">
                    <td className="py-2 pr-2">
                      <select
                        value={l.account_id}
                        onChange={(e) => updateLine(l.id, "account_id", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            [{acc.code}] {acc.name} ({acc.category} - {acc.normal_balance})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        placeholder="0"
                        value={l.debit || ""}
                        onChange={(e) => updateLine(l.id, "debit", e.target.value)}
                        className="h-10 bg-[#111827] border-[#374151] text-white font-mono text-xs focus-visible:ring-[#f59e0b]"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        placeholder="0"
                        value={l.credit || ""}
                        onChange={(e) => updateLine(l.id, "credit", e.target.value)}
                        className="h-10 bg-[#111827] border-[#374151] text-white font-mono text-xs focus-visible:ring-[#f59e0b]"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <Input
                        placeholder="Uraian per baris (opsional)"
                        value={l.memo}
                        onChange={(e) => updateLine(l.id, "memo", e.target.value)}
                        className="h-10 bg-[#111827] border-[#374151] text-white text-xs focus-visible:ring-[#f59e0b]"
                      />
                    </td>

                    <td className="py-2 pl-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(l.id)}
                        disabled={lines.length <= 2}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Balance Indicator & Totals Bar */}
          <div className="mt-6 pt-4 border-t border-[#374151] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-lg">
            <div className="flex items-center gap-3">
              {isBalanced ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  JURNAL SEIMBANG (BALANCED)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  TIDAK SEIMBANG (Selisih: Rp {difference.toLocaleString("id-ID")})
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 font-mono text-sm">
              <div>
                <span className="text-gray-400 text-xs mr-2">Total Debit:</span>
                <span className="font-bold text-emerald-400">
                  Rp {totalDebit.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs mr-2">Total Kredit:</span>
                <span className="font-bold text-blue-400">
                  Rp {totalCredit.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
        <Link href="/dashboard/accounting/journals">
          <Button
            type="button"
            variant="outline"
            className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Jurnal
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={submitting || !isBalanced}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan Transaksi...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Posting Jurnal Double-Entry (RPC)
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
