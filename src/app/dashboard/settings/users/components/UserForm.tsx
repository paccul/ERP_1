"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileInput } from "@/lib/validations/settings";
import { createUser } from "../../actions";
import { uploadUserAvatar } from "../../storage-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Camera,
  Upload,
} from "lucide-react";
import Link from "next/link";

interface UserFormProps {
  roles: Array<{ id: string; name: string; description: string | null }>;
}

export function UserForm({ roles }: UserFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role_id: roles[0]?.id || "",
      is_active: true,
      password: "Password123!",
      avatar_url: null,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran foto profil maksimal 2MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const onSubmit = async (values: UserProfileInput) => {
    setIsPending(true);
    setErrorMsg(null);
    try {
      let uploadedAvatarUrl = values.avatar_url || null;

      // Upload avatar to storage if file selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await uploadUserAvatar(formData);
        if (uploadRes.success && uploadRes.url) {
          uploadedAvatarUrl = uploadRes.url;
        }
      }

      const res = await createUser({
        ...values,
        avatar_url: uploadedAvatarUrl,
      });

      if (res.success) {
        router.push("/dashboard/settings/users");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal membuat pengguna baru.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat mendaftarkan pengguna.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {errorMsg && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-red-950/30 border border-red-500/50 text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
          <div className="p-2.5 bg-[#f59e0b]/15 text-[#f59e0b] rounded-xl">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Informasi Akun Pengguna</h2>
            <p className="text-xs text-[#9ca3af]">
              Akun baru akan otomatis dibuatkan kredensial login Supabase Auth.
            </p>
          </div>
        </div>

        {/* Foto Profil Pengguna (Opsional) */}
        <div className="flex items-center gap-5 p-3 rounded-xl bg-[#030712] border border-[#374151]/50">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1f2937] border border-[#374151] overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Foto Profil"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-[#9ca3af]" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#d1d5db]">
              Foto Profil Pengguna (Opsional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#374151] bg-[#111827] text-white hover:bg-[#1f2937] text-xs h-8"
            >
              <Upload className="h-3 w-3 mr-1.5 text-amber-400" />
              {avatarPreview ? "Ganti Foto" : "Unggah Foto Profil"}
            </Button>
            <p className="text-[10px] text-[#6b7280]">
              Format PNG, JPG, WebP. Maksimal 2MB.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#f59e0b]" />
              Nama Lengkap Staf / Manajer *
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Misal: Agus Setiawan, S.H."
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.full_name && (
              <p className="text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#60a5fa]" />
              Email Login *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="nama@garda.bujp.id"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role_id" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              Role Wewenang (RBAC) *
            </Label>
            <select
              id="role_id"
              {...register("role_id")}
              className="w-full bg-[#030712] border border-[#374151] rounded-lg px-3 text-xs sm:text-sm text-white h-10 focus:outline-none focus:border-[#f59e0b]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.description ? `— ${r.description}` : ""}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-xs text-red-400">{errors.role_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-[#d1d5db] font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#c084fc]" />
              Password Awal *
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Minimal 6 karakter"
              className="bg-[#030712] border-[#374151] text-white focus:border-[#f59e0b] h-10 text-xs sm:text-sm"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
            <p className="text-[11px] text-[#6b7280]">
              Pengguna disarankan mengganti kata sandi setelah pertama kali login.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href="/dashboard/settings/users" className="w-full sm:w-auto">
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
              Mendaftarkan Akun...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengguna Baru
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
