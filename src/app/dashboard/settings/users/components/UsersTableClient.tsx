"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleUserStatus } from "../../actions";
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
          <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-md">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Tambah Pengguna Baru
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      <div className="border border-[#374151] rounded-2xl overflow-hidden bg-[#111827] shadow-sm">
        <Table>
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
                          Nonaktif
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
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleToggle(u.id, u.is_active)}
                        className={`h-8 text-xs font-semibold rounded-lg border transition-all ${
                          u.is_active
                            ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : u.is_active ? (
                          "Blokir Akses"
                        ) : (
                          "Aktifkan"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
