"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCheckpoint } from "../actions";

interface DeleteCheckpointButtonProps {
  id: string;
  name: string;
}

export function DeleteCheckpointButton({ id, name }: DeleteCheckpointButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus checkpoint "${name}"? Data riwayat scan patroli lama mungkin terpengaruh.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteCheckpoint(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus checkpoint");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menghapus checkpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="border-red-900/40 text-red-400 hover:bg-red-950/40 hover:text-red-300"
      title="Hapus Checkpoint"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
