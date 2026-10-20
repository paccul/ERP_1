"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveRole } from "../../actions";
import { ALL_SYSTEM_MODULES, type RoleInput } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRound,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Check,
} from "lucide-react";

interface RoleFormProps {
  initialRole?: {
    id: string;
    name: string;
    description: string | null;
    is_system?: boolean | null;
    role_permissions: Array<{
      module: string;
      can_view: boolean;
      can_manage: boolean;
    }>;
  };
}

export function RoleForm({ initialRole }: RoleFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState(initialRole?.name || "");
  const [description, setDescription] = useState(initialRole?.description || "");

  // Initialize 8 modules permission map
  const [permissions, setPermissions] = useState<
    Record<string, { can_view: boolean; can_manage: boolean }>
  >(() => {
    const map: Record<string, { can_view: boolean; can_manage: boolean }> = {};
    for (const mod of ALL_SYSTEM_MODULES) {
      const existing = initialRole?.role_permissions.find((p) => p.module === mod.key);
      map[mod.key] = {
        can_view: existing ? existing.can_view : false,
        can_manage: existing ? existing.can_manage : false,
      };
    }
    return map;
  });

  const isSuperAdminRole =
    initialRole?.name?.toLowerCase() === "super_admin" ||
    initialRole?.name?.toLowerCase() === "administrator sistem";

  const togglePermission = (moduleKey: string, field: "can_view" | "can_manage") => {
    if (isSuperAdminRole) return; // Super admin permissions are permanently locked to true

    setPermissions((prev) => {
      const current = prev[moduleKey] || { can_view: false, can_manage: false };
      const nextVal = !current[field];

      // If can_manage is set to true, can_view must also be true
      let newCanView = current.can_view;
      let newCanManage = current.can_manage;

      if (field === "can_manage") {
        newCanManage = nextVal;
        if (nextVal) newCanView = true;
      } else {
        newCanView = nextVal;
        if (!nextVal) newCanManage = false;
      }

      return {
        ...prev,
        [moduleKey]: {
          can_view: newCanView,
          can_manage: newCanManage,
        },
      };
    });
  };

  const handleSelectAll = (action: "all_view" | "all_manage" | "clear") => {
    setPermissions((prev) => {
      const next: Record<string, { can_view: boolean; can_manage: boolean }> = {};
      for (const mod of ALL_SYSTEM_MODULES) {
        if (action === "all_view") {
          next[mod.key] = { can_view: true, can_manage: prev[mod.key]?.can_manage || false };
        } else if (action === "all_manage") {
          next[mod.key] = { can_view: true, can_manage: true };
        } else {
          next[mod.key] = { can_view: false, can_manage: false };
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama role wajib diisi.");
      return;
    }

    setIsPending(true);
    setErrorMsg(null);

    const payload: RoleInput = {
      id: initialRole?.id,
      name,
      description: description || null,
      permissions: Object.entries(permissions).map(([module, perms]) => ({
        module,
        can_view: perms.can_view,
        can_manage: perms.can_manage,
      })),
    };

    try {
      const res = await saveRole(payload);
      if (res.success) {
        router.push("/dashboard/settings/roles");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan role.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan role.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {errorMsg && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-red-950/30 border border-red-500/50 text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role Identity */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Identitas Role</h2>
            <p className="text-xs text-[#9ca3af]">
              Nama wewenang penugasan dan deskripsi tanggung jawab operasional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-xs text-[#d1d5db] font-semibold">
              Nama Role *
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Staf Patroli Wilayah"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-desc" className="text-xs text-[#d1d5db] font-semibold">
              Deskripsi Tanggung Jawab
            </Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat wewenang penugasan"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Matriks 16 Izin Granular */}
      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Matriks Hak Akses 8 Modul (16 Izin Granular)
              </h2>
              <p className="text-xs text-[#9ca3af]">
                Atur wewenang Baca (View) dan Kelola/Eksekusi (Manage) untuk setiap modul sistem.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll("all_manage")}
              className="h-8 text-[11px] border-[#374151] bg-[#030712] hover:bg-[#1f2937] text-[#f59e0b]"
            >
              Pilih Semua (Full Access)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll("clear")}
              className="h-8 text-[11px] border-[#374151] bg-[#030712] hover:bg-[#1f2937] text-gray-400"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="border border-[#374151] rounded-xl overflow-hidden divide-y divide-[#1f2937]">
          <div className="grid grid-cols-12 bg-[#030712] p-3 text-xs font-bold text-[#9ca3af] uppercase tracking-wider">
            <div className="col-span-8 sm:col-span-8">Modul Sistem</div>
            <div className="col-span-2 sm:col-span-2 text-center">Lihat (View)</div>
            <div className="col-span-2 sm:col-span-2 text-center">Kelola (Manage)</div>
          </div>

          {ALL_SYSTEM_MODULES.map((mod) => {
            const cur = permissions[mod.key] || { can_view: false, can_manage: false };

            return (
              <div
                key={mod.key}
                className="grid grid-cols-12 items-center p-3.5 hover:bg-[#1f2937]/40 transition-colors"
              >
                <div className="col-span-8 sm:col-span-8 pr-2">
                  <div className="text-xs sm:text-sm font-semibold text-white capitalize">
                    {mod.key}
                  </div>
                  <div className="text-[11px] text-[#9ca3af] mt-0.5">{mod.label}</div>
                </div>

                <div className="col-span-2 sm:col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => togglePermission(mod.key, "can_view")}
                    className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                      cur.can_view
                        ? "bg-emerald-500 border-emerald-400 text-black shadow-sm"
                        : "bg-[#030712] border-[#374151] hover:border-[#9ca3af]"
                    }`}
                  >
                    {cur.can_view && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>
                </div>

                <div className="col-span-2 sm:col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => togglePermission(mod.key, "can_manage")}
                    className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                      cur.can_manage
                        ? "bg-[#f59e0b] border-[#f59e0b] text-black shadow-sm"
                        : "bg-[#030712] border-[#374151] hover:border-[#9ca3af]"
                    }`}
                  >
                    {cur.can_manage && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href="/dashboard/settings/roles" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-[#374151] text-gray-300 hover:bg-[#111827]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-6 h-11 rounded-xl shadow-lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan Role...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Konfigurasi Role
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
