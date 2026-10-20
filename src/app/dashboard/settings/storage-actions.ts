"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_COMPANY_LOGOS, BUCKET_AVATARS, ensureStorageBuckets } from "@/lib/supabase/storage";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Upload company logo to Supabase Storage and update institution_settings
 */
export async function uploadCompanyLogo(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return { success: false, error: "File logo tidak ditemukan" };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: "Format file harus PNG, JPG, WebP, atau SVG" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Ukuran file maksimal 2MB" };
    }

    await ensureStorageBuckets();
    const admin = createAdminClient();

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from(BUCKET_COMPANY_LOGOS)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = admin.storage
      .from(BUCKET_COMPANY_LOGOS)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update institution_settings
    const { data: existing } = await (admin as any)
      .from("institution_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await (admin as any)
        .from("institution_settings")
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await (admin as any).from("institution_settings").insert({
        company_name: "PT Garda Utama Security Indonesia",
        license_number: "SIO/542/BIN/X/2023/Mabes-Polri",
        npwp: "01.234.567.8-012.000",
        address: "Gedung Cyber 2 Tower Lt. 15, Jakarta Selatan",
        phone: "021-52994400",
        email: "info@garda.bujp.id",
        logo_url: publicUrl,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/settings/institution");

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("uploadCompanyLogo exception:", err);
    return { success: false, error: err?.message || "Gagal mengunggah logo" };
  }
}

/**
 * Upload admin / user profile avatar to Supabase Storage
 */
export async function uploadUserAvatar(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return { success: false, error: "File foto tidak ditemukan" };
    }

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      return { success: false, error: "Format foto harus PNG, JPG, atau WebP" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Ukuran foto maksimal 2MB" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi autentikasi tidak ditemukan" };
    }

    await ensureStorageBuckets();
    const admin = createAdminClient();

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from(BUCKET_AVATARS)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage avatar upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = admin.storage
      .from(BUCKET_AVATARS)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update Supabase Auth user metadata
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        avatar_url: publicUrl,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("uploadUserAvatar exception:", err);
    return { success: false, error: err?.message || "Gagal mengunggah foto profil" };
  }
}

/**
 * Update current user full name and avatar URL
 */
export async function updateCurrentUserProfile(input: {
  fullName: string;
  avatarUrl?: string | null;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi tidak ditemukan" };
    }

    const admin = createAdminClient();

    // Update Auth user_metadata
    const metadataUpdate: Record<string, any> = {
      ...user.user_metadata,
      full_name: input.fullName,
    };
    if (input.avatarUrl !== undefined) {
      metadataUpdate.avatar_url = input.avatarUrl;
    }

    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: metadataUpdate,
    });

    // Update profiles table
    await (admin as any)
      .from("profiles")
      .update({
        full_name: input.fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("updateCurrentUserProfile error:", err);
    return { success: false, error: err?.message || "Gagal memperbarui profil" };
  }
}
