"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deletePersonnel } from "../actions";
import { Button } from "@/components/ui/button";

interface DeletePersonnelButtonProps {
  id: string;
  name: string;
}

export function DeletePersonnelButton({ id, name }: DeletePersonnelButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data personil ${name}? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await deletePersonnel(id);
    if (!result.success) {
      alert(result.error || "Gagal menghapus personil.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      aria-label={`Hapus ${name}`}
      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
