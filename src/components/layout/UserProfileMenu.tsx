"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  Camera,
  Loader2,
  Check,
  ChevronDown,
  X,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { uploadUserAvatar, updateCurrentUserProfile, deleteUserAvatar } from "@/app/dashboard/settings/storage-actions";
import { Button } from "@/components/ui/button";

interface UserProfileMenuProps {
  userEmail?: string | null;
  userRole?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export function UserProfileMenu({
  userEmail,
  userRole = "Administrator BUJP",
  fullName,
  avatarUrl: initialAvatarUrl,
}: UserProfileMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Edit profile modal state
  const [name, setName] = useState(fullName || userEmail?.split("@")[0] || "Admin");
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(initialAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = fullName || (userEmail ? userEmail.split("@")[0] : "Operasional");
  const isSuperAdmin =
    userRole?.toLowerCase() === "super_admin" ||
    userRole?.toLowerCase() === "administrator sistem" ||
    userRole?.toLowerCase() === "administrator bujp" ||
    userEmail === "admin@garda.bujp.id";

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      setLoggingOut(false);
    }
  };

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Ukuran foto maksimal 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  // Handle Avatar Deletion
  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    setErrorMessage(null);
    try {
      const res = await deleteUserAvatar();
      if (res.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCurrentAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          window.location.reload();
        }, 500);
      } else {
        setErrorMessage(res.error || "Gagal menghapus foto profil");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menghapus foto profil");
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      let finalAvatarUrl = currentAvatar;

      // 1. Upload new avatar if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadUserAvatar(formData);
        if (!uploadRes.success) {
          throw new Error(uploadRes.error || "Gagal mengunggah foto profil");
        }
        finalAvatarUrl = uploadRes.url || currentAvatar;
        setCurrentAvatar(finalAvatarUrl);
      }

      // 2. Update profile data
      const updateRes = await updateCurrentUserProfile({
        fullName: name.trim(),
        avatarUrl: finalAvatarUrl,
      });

      if (!updateRes.success) {
        throw new Error(updateRes.error || "Gagal memperbarui nama profil");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSaveSuccess(false);
        window.location.reload();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  // Initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-all duration-200 hover:border-[#374151] hover:bg-[#111827]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {/* Avatar */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-black font-bold text-xs ring-1 ring-amber-400/30 overflow-hidden shrink-0">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials || <User className="h-4 w-4" />}</span>
            )}
          </div>

          {/* User Info (Desktop) */}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white capitalize truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[10px] text-[#9ca3af] truncate max-w-[130px] font-medium">
              {userRole}
            </span>
          </div>

          <ChevronDown
            className={`h-3.5 w-3.5 text-[#9ca3af] transition-transform duration-200 hidden sm:block ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#374151] bg-[#0b0f19] p-2 text-white shadow-2xl shadow-black/80 backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header info */}
            <div className="border-b border-[#1f2937] px-3 py-2.5 mb-1.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-black font-bold text-sm overflow-hidden">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-[#9ca3af] truncate">{userEmail || "user@bujp.id"}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#d1d5db] transition-colors hover:bg-[#1f2937] hover:text-white"
              >
                <Camera className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Ubah Foto & Profil Saya</span>
              </button>

              {isSuperAdmin && (
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#d1d5db] transition-colors hover:bg-[#1f2937] hover:text-white"
                >
                  <Settings className="h-4 w-4 text-[#9ca3af] shrink-0" />
                  <span>Pengaturan Perusahaan</span>
                </Link>
              )}
            </div>

            {/* Unified Red Logout Button */}
            <div className="border-t border-[#1f2937] pt-1.5 mt-1.5">
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                aria-label="Keluar dari Sistem"
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <LogOut className="h-4 w-4 shrink-0" />
                )}
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-[#374151] bg-[#0b0f19] p-6 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ubah Foto & Profil Saya</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#9ca3af] hover:bg-[#1f2937] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <Check className="h-4 w-4" />
                Profil berhasil diperbarui!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Uploader Preview */}
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <div className="relative group flex h-24 w-24 items-center justify-center rounded-2xl bg-[#111827] text-white font-bold text-2xl ring-2 ring-amber-400/40 overflow-hidden shadow-lg shadow-black/50">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview Foto Profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials || <User className="h-8 w-8 text-[#9ca3af]" />}</span>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Pilih foto baru"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Camera className="h-6 w-6 text-amber-400 mb-1" />
                    <span className="text-[10px] text-white font-medium">Ubah Foto</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSaving || isDeletingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-[#374151] bg-[#111827] text-xs text-[#d1d5db] hover:bg-[#1f2937] hover:text-white"
                  >
                    Pilih Gambar (Maks 2MB)
                  </Button>
                  {(previewUrl || currentAvatar) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSaving || isDeletingAvatar}
                      onClick={handleDeleteAvatar}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      {isDeletingAvatar ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Menghapus...
                        </>
                      ) : (
                        "Hapus Foto"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9ca3af]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full rounded-xl border border-[#374151] bg-[#111827] px-3.5 py-2 text-xs text-white placeholder-[#6b7280] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Readonly Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9ca3af]">Email Akun</label>
                <input
                  type="email"
                  disabled
                  value={userEmail || ""}
                  className="w-full rounded-xl border border-[#374151]/50 bg-[#111827]/40 px-3.5 py-2 text-xs text-[#6b7280] cursor-not-allowed"
                />
              </div>

              {/* Readonly Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9ca3af]">Role Sistem</label>
                <input
                  type="text"
                  disabled
                  value={userRole || ""}
                  className="w-full rounded-xl border border-[#374151]/50 bg-[#111827]/40 px-3.5 py-2 text-xs text-[#6b7280] cursor-not-allowed capitalize"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs text-[#9ca3af] hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 text-black text-xs font-bold hover:brightness-105"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
