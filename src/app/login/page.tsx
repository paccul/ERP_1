"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

const initialState: LoginState = {
  error: null,
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className="border-[#374151] bg-[#030712] shadow-2xl">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] ring-1 ring-[#f59e0b]/30">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                GARDA ERP
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-[#9ca3af]">
                Sistem Informasi Manajemen Badan Usaha Jasa Pengamanan
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {state?.error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Pengguna</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#9ca3af]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@perusahaan.co.id"
                    className="pl-9 bg-[#111827] border-[#374151] text-white placeholder-[#6b7280] focus-visible:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <a
                    href="#forgot-password"
                    className="text-[11px] text-[#f59e0b] hover:text-[#d97706] transition-colors"
                  >
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#9ca3af]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9 bg-[#111827] border-[#374151] text-white placeholder-[#6b7280] focus-visible:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#374151] bg-[#111827] text-[#f59e0b] focus:ring-[#f59e0b] focus:ring-offset-black"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-[#9ca3af] cursor-pointer select-none"
                >
                  Ingat saya di perangkat ini
                </label>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 bg-[#f59e0b] text-black hover:bg-[#d97706] font-semibold text-xs tracking-wider uppercase h-10 transition-all focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk ke Portal Garda</span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-[#374151]/50 pt-4 space-y-3">
            <div className="w-full rounded-lg bg-[#111827] p-3 text-left border border-[#374151]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">
                Akun Demo Login (BUJP):
              </span>
              <div className="mt-1.5 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#9ca3af]">
                  <span>Admin: <strong className="text-white">admin@garda.bujp.id</strong></span>
                  <span className="font-mono text-[11px] text-white bg-black/50 px-1.5 py-0.5 rounded">Password123!</span>
                </div>
                <div className="flex items-center justify-between text-[#9ca3af]">
                  <span>Ops: <strong className="text-white">operasional@garda.bujp.id</strong></span>
                  <span className="font-mono text-[11px] text-white bg-black/50 px-1.5 py-0.5 rounded">Password123!</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#6b7280] text-center">
              Terproteksi enkripsi SSL & Supabase Row Level Security (RLS)
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
