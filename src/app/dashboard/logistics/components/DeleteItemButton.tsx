"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItem } from "@/app/dashboard/logistics/actions";

interface DeleteItemButtonProps {
  id: string;
  itemName: string;
  stock: number;
}

export function DeleteItemButton({ id, itemName, stock }: DeleteItemButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (stock > 0) {
      if (!confirm(`Item "${itemName}" masih memiliki stok fisik sebanyak ${stock}. Yakin ingin menghapus master barang ini?`)) {
        return;
      }
    } else {
      if (!confirm(`Hapus master barang "${itemName}"?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const result = await deleteItem(id);
      if (!result.success) {
        alert(result.error || "Gagal menghapus barang");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] h-8 px-2"
      title="Hapus Master Barang"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
