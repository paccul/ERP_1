"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRosterAssignment } from "../actions";

interface DeleteAssignmentButtonProps {
  id: string;
}

export function DeleteAssignmentButton({ id }: DeleteAssignmentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Hapus penugasan jadwal shift ini?")) return;
    setLoading(true);
    try {
      const res = await deleteRosterAssignment(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus penugasan shift");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus jadwal");
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
      title="Hapus Penugasan"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
