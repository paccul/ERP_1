"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSite } from "../actions";

interface DeleteSiteButtonProps {
  id: string;
  siteName: string;
}

export function DeleteSiteButton({ id, siteName }: DeleteSiteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lokasi jaga "${siteName}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteSite(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus lokasi jaga");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus lokasi jaga");
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
      title="Hapus Lokasi Jaga"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
