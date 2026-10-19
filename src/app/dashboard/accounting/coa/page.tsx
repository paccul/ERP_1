import Link from "next/link";
import {
  Layers,
  Plus,
  Shield,
  FileSpreadsheet,
  ArrowRight,
  Lock,
} from "lucide-react";
import { getAccounts } from "../actions";
import { AccountingSubnav } from "@/components/layout/AccountingSubnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DeleteAccountButton } from "./components/DeleteAccountButton";

export const dynamic = "force-dynamic";

export default async function ChartOfAccountsPage() {
  const { data: accounts, error } = await getAccounts();

  const categories = ["Aset", "Liabilitas", "Ekuitas", "Pendapatan", "Beban"] as const;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <AccountingSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#f59e0b]" />
            Bagan Akun Standar BUJP (Chart of Accounts - ACC-01)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Struktur klasifikasi akun buku besar untuk pencatatan otomatis transaksi penagihan klien, gaji, dan logistik.
          </p>
        </div>
        <Link href="/dashboard/accounting/coa/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun Baru (ACC-02)
          </Button>
        </Link>
      </div>

      {error ? (
        <Card className="bg-red-950/40 border-red-800 p-6 text-red-300">{error}</Card>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catAccounts = accounts.filter((a) => a.category === cat);
            if (catAccounts.length === 0) return null;

            return (
              <Card key={cat} className="bg-[#030712] border-[#374151]">
                <CardHeader className="py-3 px-4 border-b border-[#374151] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-white">{cat}</CardTitle>
                    <span className="text-xs text-gray-400 font-mono">
                      ({catAccounts.length} Akun)
                    </span>
                  </div>
                  <Badge
                    className={
                      cat === "Aset" || cat === "Beban"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-blue-950 text-blue-400 border-blue-800"
                    }
                  >
                    Saldo Normal: {cat === "Aset" || cat === "Beban" ? "Debit" : "Kredit"}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#374151] hover:bg-transparent">
                        <TableHead className="w-32 text-gray-300 font-mono">Kode Akun</TableHead>
                        <TableHead className="text-gray-300">Nama Akun Rekening</TableHead>
                        <TableHead className="text-gray-300">Akun Induk (Parent)</TableHead>
                        <TableHead className="text-gray-300">Saldo Normal</TableHead>
                        <TableHead className="text-gray-300">Tipe Akun</TableHead>
                        <TableHead className="text-right text-gray-300">Buku Besar / Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catAccounts.map((acc) => (
                        <TableRow key={acc.id} className="border-[#374151] hover:bg-[#111827]/50">
                          <TableCell className="font-mono text-sm font-bold text-white">
                            {acc.code}
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-white text-sm flex items-center gap-2">
                              {acc.name}
                              {acc.is_system && (
                                <span
                                  title="Akun Sistem Terproteksi"
                                  className="inline-flex items-center text-[10px] text-amber-400/80 font-mono"
                                >
                                  <Lock className="h-3 w-3 mr-0.5" />
                                  System
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {acc.parent_account ? (
                              <span className="text-xs text-gray-400 font-mono">
                                [{acc.parent_account.code}] {acc.parent_account.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600 italic">Akun Utama</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                acc.normal_balance === "debit"
                                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[11px]"
                                  : "bg-blue-950/80 text-blue-300 border-blue-800 text-[11px]"
                              }
                            >
                              {acc.normal_balance.toUpperCase()}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {acc.is_system ? (
                              <span className="text-xs text-amber-400/90 font-medium">Bawaan BUJP</span>
                            ) : (
                              <span className="text-xs text-gray-400">Kustom</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/accounting/ledger?accountId=${acc.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#374151] text-gray-300 hover:bg-[#111827] text-xs h-7"
                                >
                                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                                  Buku Besar
                                </Button>
                              </Link>
                              <DeleteAccountButton
                                id={acc.id}
                                accountName={acc.name}
                                isSystem={!!acc.is_system}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
