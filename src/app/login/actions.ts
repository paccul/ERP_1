"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export type LoginState = {
  error?: string | null;
  success?: boolean;
};

export async function signIn(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Email atau kata sandi tidak valid. Silakan periksa kembali.",
    };
  }

  // Check if profile exists and whether user is active
  if (data?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, full_name")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile && (profile as { is_active?: boolean }).is_active === false) {
      await supabase.auth.signOut();
      return {
        error: "Akun Anda dinonaktifkan oleh Administrator BUJP.",
      };
    }
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
