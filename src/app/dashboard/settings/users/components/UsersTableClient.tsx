"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleUserStatus, resetUserPassword, deleteUser } from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Calendar,
  KeyRound,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  is_active: boolean;
  created_at: string | null;
  roles: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

interface UsersTableClientProps {
  initialUsers: UserItem[];
}

export function UsersTableClient({ initialUsers }: UsersTableClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Reset password modal state
  const [resetModalUser, setResetModalUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete modal state
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle active/blocked
  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setLoadingId(userId);
    try {
      const res = await toggleUserStatus(userId, currentStatus);
      if (res.success && res.newStatus !== undefined) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: res.newStatus! } : u))
        );
      }
    } finally {
      setLoadingId(null);
    }
  };

  // Submit reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPassword.length < 6) {
      setResetFeedback({ type: "error", message: "Password minimal 6 karakter" });
      return;
    }

    setResetLoading(true);
    setResetFeedback(null);
    try {
      const res = await resetUserPassword(resetModalUser.id, newPassword);
      if (res.success) {
        setResetFeedback({ type: "success", message: "Password pengguna berhasil diperbarui!" });
        setTimeout(() => {
          setResetModalUser(null);
          setNewPassword("");
          setResetFeedback(null);
        }, 1000);
      } else {
        setResetFeedback({ type: "error", message: res.error || "Gagal mereset password" });
      }
    } catch (err: any) {
      setResetFeedback({ type: "error", message: err.message || "Kesalahan sistem" });
    } finally {
      setResetLoading(false);
    }
  };

  // Confirm delete user
  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    setDeleteLoading(true);
    try {
      const res = await deleteUser(deleteModalUser.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
        setDeleteModalUser(null);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case "super_admin":
      case "administrator sistem":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "hrd_admin":
      case "staf rekrutmen":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "finance_admin":
      case "staf keuangan":
      case "akuntan":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "manajer operasional":
      case "ops_manager":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-[#374151]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Daftar Akun Pengguna Terdaftar</h2>
            <p className="text-xs text-[#9ca3af]">
              Total {users.length} staf dan manajer memiliki akses ke sistem Garda ERP.
            </p>
          </div>
        </div>

        <Link href="/dashboard/settings/users/new">
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-md w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Tambah Pengguna Baru
          </Button>
        </Link>
      </div>

      {/* Users Table with Responsive Scroll Container */}
      <div className="border border-[#374151] rounded-2xl overflow-hidden bg-[#111827] shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-[#030712] border-b border-[#374151]">
              <TableRow className="border-[#374151] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider py-3.5">
                  Nama Pengguna & Email
                </TableHead>
                <TableHead className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider py-3.5">
                  Role Penugasan
                </TableHead>
                <TableHead className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider py-3.5">
                  Status Akun
                </TableHead>
                <TableHead className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider py-3.5">
                  Tgl Bergabung
                </TableHead>
                <TableHead className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider py-3.5 text-right">
                  Aksi Otoritas
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#1f2937]">
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-[#9ca3af]">
                    Belum ada data pengguna.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const roleName = u.roles?.name || "Staf Operasional";
                  const badgeStyle = getRoleBadge(roleName);
                  const isLoading = loadingId === u.id;
                  const isProtectedAdmin = u.email === "admin@garda.bujp.id";

                  return (
                    <TableRow
                      key={u.id}
                      className="border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors"
                    >
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {u.full_name}
                          </span>
                          <span className="text-[11px] text-[#9ca3af] flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-[#6b7280]" />
                            {u.email}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeStyle}`}
                        >
                          <Shield className="h-3 w-3" />
                          {roleName}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                            <XCircle className="h-3.5 w-3.5" />
                            Diblokir
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-[#9ca3af]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-[#6b7280]" />
                          {u.created_at
                            ? format(new Date(u.created_at), "dd MMM yyyy", { locale: localeId })
                            : "-"}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active Status */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading || isProtectedAdmin}
                            onClick={() => handleToggle(u.id, u.is_active)}
                            className={`h-8 text-[11px] font-semibold rounded-lg border transition-all ${
                              u.is_active
                                ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.is_active ? (
                              "Blokir"
                            ) : (
                              "Aktifkan"
                            )}
                          </Button>

                          {/* Reset Password */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setResetModalUser(u);
                              setNewPassword("");
                              setResetFeedback(null);
                            }}
                            title="Reset Password Pengguna"
                            className="h-8 border-[#374151] bg-[#111827] text-gray-300 hover:text-white hover:bg-[#1f2937] px-2.5"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                          </Button>

                          {/* Delete Account (protected for main super admin) */}
                          {!isProtectedAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteModalUser(u)}
                              title="Hapus Akun Pengguna"
                              className="h-8 border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/15 px-2.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#374151] bg-[#0b0f19] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reset Password Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#9ca3af] mb-4">
              Setel ulang password baru untuk <strong className="text-white">{resetModalUser.full_name}</strong> ({resetModalUser.email}).
            </p>

            {resetFeedback && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 border ${
                  resetFeedback.type === "success"
                    ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                    : "bg-red-950/30 border-red-500/50 text-red-400"
                }`}
              >
                {resetFeedback.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{resetFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9ca3af]">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-[#374151] bg-[#111827] px-3.5 py-2 text-xs text-white placeholder-[#6b7280] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetModalUser(null)}
                  className="text-xs text-[#9ca3af]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold"
                >
                  {resetLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Simpan Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#0b0f19] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Hapus Akun Pengguna</h3>
            </div>

            <p className="text-xs text-[#9ca3af] mb-6">
              Apakah Anda yakin ingin menghapus akun <strong className="text-white">{deleteModalUser.full_name}</strong> ({deleteModalUser.email})? Tindakan ini bersifat permanen dan mencabut seluruh akses login.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteModalUser(null)}
                className="text-xs text-[#9ca3af]"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={deleteLoading}
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Hapus Akun
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
