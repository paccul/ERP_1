"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/app/dashboard/accounting/actions";

interface DeleteAccountButtonProps {
  id: string;
  accountName: string;
  isSystem: boolean;
}

export function DeleteAccountButton({
  id,
  accountName,
  isSystem,
}: DeleteAccountButtonProps) {
  const [loading, setLoading] = useState(false);

  if (isSystem) {
    return null; // System accounts cannot be deleted
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus akun "${accountName}"? Akun hanya dapat dihapus jika belum memiliki transaksi jurnal.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteAccount(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus akun");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menghapus akun");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
      title="Hapus Akun Kustom"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
