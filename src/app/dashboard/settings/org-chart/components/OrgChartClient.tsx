"use client";

import { useState } from "react";
import { OrgUnitNode, saveOrgUnit, deleteOrgUnit } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Network,
  Plus,
  Trash2,
  User,
  Shield,
  Layers,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

interface OrgChartClientProps {
  initialUnits: OrgUnitNode[];
}

export function OrgChartClient({ initialUnits }: OrgChartClientProps) {
  const [units, setUnits] = useState<OrgUnitNode[]>(initialUnits);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState(3);
  const [leaderName, setLeaderName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFeedback({ type: "error", message: "Nama dan Kode unit wajib diisi." });
      return;
    }

    setIsPending(true);
    setFeedback(null);
    try {
      const res = await saveOrgUnit({
        name,
        code,
        level: Number(level),
        leader_name: leaderName || null,
        parent_id: parentId || null,
      });

      if (res.success) {
        setFeedback({ type: "success", message: `Unit organisasi ${name} berhasil ditambahkan.` });
        setModalOpen(false);
        // Refresh local view
        setUnits((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            name,
            code,
            level: Number(level),
            leader_name: leaderName || null,
            parent_id: parentId || null,
          },
        ]);
        setName("");
        setCode("");
        setLeaderName("");
        setParentId("");
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menyimpan unit." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi kesalahan sistem saat menyimpan unit." });
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string, unitName: string) => {
    if (!confirm(`Hapus unit organisasi "${unitName}"?`)) return;

    try {
      const res = await deleteOrgUnit(id);
      if (res.success) {
        setUnits((prev) => prev.filter((u) => u.id !== id));
        setFeedback({ type: "success", message: `Unit ${unitName} berhasil dihapus.` });
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menghapus unit." });
      }
    } catch {
      setFeedback({ type: "error", message: "Gagal menghapus unit." });
    }
  };

  // Group units by level
  const levels = [
    { lvl: 1, title: "Level 1: Direksi & Manajemen Puncak", badge: "Direksi", bg: "border-[#f59e0b]/40 bg-[#f59e0b]/5" },
    { lvl: 2, title: "Level 2: Direktorat Operasional & Keuangan", badge: "Direktorat", bg: "border-[#60a5fa]/40 bg-[#60a5fa]/5" },
    { lvl: 3, title: "Level 3: Divisi Wilayah & Rekrutmen", badge: "Divisi", bg: "border-[#34d399]/40 bg-[#34d399]/5" },
    { lvl: 4, title: "Level 4: Chief Security Kawasan", badge: "Chief", bg: "border-[#c084fc]/40 bg-[#c084fc]/5" },
    { lvl: 5, title: "Level 5: Danru & Penempatan Pos Jaga", badge: "Danru", bg: "border-[#f472b6]/40 bg-[#f472b6]/5" },
  ];

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
              : "bg-red-950/30 border-red-500/50 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-[#374151]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Hierarki Komando & Manajemen BUJP</h2>
            <p className="text-xs text-[#9ca3af]">
              Struktur komando berjenjang dari pucuk pimpinan hingga komandan regu pos jaga.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-md"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Unit Organisasi
        </Button>
      </div>

      {/* Visual Hierarchy Cards by Level */}
      <div className="space-y-6">
        {levels.map((lvlMeta) => {
          const unitsInLevel = units.filter((u) => u.level === lvlMeta.lvl);
          if (unitsInLevel.length === 0) return null;

          return (
            <div key={lvlMeta.lvl} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                  {lvlMeta.title}
                </span>
                <span className="text-[10px] bg-[#1f2937] text-white px-2 py-0.5 rounded-full border border-[#374151]">
                  {unitsInLevel.length} Posisi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unitsInLevel.map((u) => (
                  <div
                    key={u.id}
                    className={`rounded-2xl border p-5 transition-all duration-200 relative group flex flex-col justify-between ${lvlMeta.bg}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#030712] border border-[#374151] text-[#f59e0b]">
                          {u.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.name)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#1f2937] transition-all"
                          title="Hapus Unit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                        {u.name}
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-xs text-[#d1d5db]">
                        <User className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                        <span className="font-medium truncate">
                          {u.leader_name || "Belum Ditentukan"}
                        </span>
                      </div>
                    </div>

                    {u.parent_id && (
                      <div className="mt-4 pt-3 border-t border-[#374151]/50 text-[11px] text-[#9ca3af] flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-[#6b7280]" />
                        <span>Induk:</span>
                        <span className="text-[#e5e7eb] truncate">
                          {units.find((p) => p.id === u.parent_id)?.name || "Direktorat"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Unit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-[#374151] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2.5">
                <Building className="h-5 w-5 text-[#f59e0b]" />
                <h3 className="text-base font-bold text-white">Tambah Unit Organisasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="unit-name" className="text-xs text-[#d1d5db]">
                  Nama Unit / Posisi Jabatan *
                </Label>
                <Input
                  id="unit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Chief Security Kawasan Industri"
                  className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="unit-code" className="text-xs text-[#d1d5db]">
                    Kode Posisi / Singkatan *
                  </Label>
                  <Input
                    id="unit-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Misal: CHF-IND"
                    className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit-level" className="text-xs text-[#d1d5db]">
                    Tingkat Hierarki *
                  </Label>
                  <select
                    id="unit-level"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full bg-[#030712] border border-[#374151] rounded-lg px-3 text-xs sm:text-sm text-white h-10 focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value={1}>Level 1: Direksi</option>
                    <option value={2}>Level 2: Direktorat</option>
                    <option value={3}>Level 3: Divisi</option>
                    <option value={4}>Level 4: Chief Security</option>
                    <option value={5}>Level 5: Danru Pos Jaga</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-leader" className="text-xs text-[#d1d5db]">
                  Nama Pejabat / Pemegang Jabatan
                </Label>
                <Input
                  id="unit-leader"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Misal: Mayor (Purn) Bambang Irawan"
                  className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-parent" className="text-xs text-[#d1d5db]">
                  Unit Induk / Atasan Langsung
                </Label>
                <select
                  id="unit-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-[#030712] border border-[#374151] rounded-lg px-3 text-xs sm:text-sm text-white h-10 focus:outline-none focus:border-[#f59e0b]"
                >
                  <option value="">-- Pucuk Pimpinan Tertinggi --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Level {u.level} - {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2937]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-[#374151] text-gray-300 hover:bg-[#1f2937]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Unit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
