"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteClient } from "../actions";

interface DeleteClientButtonProps {
  id: string;
  companyName: string;
}

export function DeleteClientButton({ id, companyName }: DeleteClientButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data klien "${companyName}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteClient(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus klien");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus klien");
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
      title="Hapus Klien"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
