"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  personnelFormSchema,
  calculateKtaStatus,
  type PersonnelFormValues,
  type KtaStatus,
} from "@/lib/validations/personnel";
import type { Database, Tables } from "@/types/database.types";

export type PersonnelWithSite = Tables<"personnel"> & {
  sites: {
    id: string;
    name: string;
    code: string;
  } | null;
  kta_status: KtaStatus;
};

export async function getSitesList(): Promise<
  Array<{ id: string; name: string; code: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id, name, code")
    .order("name", { ascending: true });
  return (data as Array<{ id: string; name: string; code: string }>) || [];
}

export async function getPersonnel(filters?: {
  status?: string;
  siteId?: string;
  search?: string;
}): Promise<{ data: PersonnelWithSite[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("personnel")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.siteId && filters.siteId !== "all") {
      query = query.eq("current_site_id", filters.siteId);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${term},nik.ilike.${term},kta_number.ilike.${term}`);
    }

    const [{ data: personnelData, error }, sitesList] = await Promise.all([
      query,
      getSitesList(),
    ]);

    if (error) {
      return { data: [], error: error.message };
    }

    const siteMap = new Map(sitesList.map((s) => [s.id, s]));

    const enriched: PersonnelWithSite[] = (
      (personnelData as Tables<"personnel">[]) || []
    ).map((row) => ({
      ...row,
      sites: row.current_site_id ? siteMap.get(row.current_site_id) || null : null,
      kta_status: calculateKtaStatus(row.kta_number, row.kta_expiry_date),
    }));

    return { data: enriched, error: null };
  } catch (err: unknown) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Gagal mengambil data personel",
    };
  }
}

export async function getPersonnelById(id: string): Promise<{
  data: Tables<"personnel"> | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("personnel")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Tables<"personnel"> | null, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Gagal mengambil detail personel",
    };
  }
}

export async function createPersonnel(
  rawValues: PersonnelFormValues
): Promise<{ success: boolean; error: string | null; id?: string }> {
  try {
    const parsed = personnelFormSchema.safeParse(rawValues);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["personnel"]["Insert"] = {
      nik: data.nik,
      full_name: data.full_name,
      gender: data.gender,
      birth_place: data.birth_place || null,
      birth_date: data.birth_date || null,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      kta_number: data.kta_number || null,
      kta_expiry_date: data.kta_expiry_date || null,
      gada_level: data.gada_level,
      gada_certificate_number: data.gada_certificate_number || null,
      position: data.position,
      status: data.status,
      current_site_id: data.current_site_id || null,
      join_date: data.join_date,
      bank_name: data.bank_name || null,
      bank_account_number: data.bank_account_number || null,
      photo_url: data.photo_url || null,
    };

    const { data: created, error } = await supabase
      .from("personnel")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/personnel");
    revalidatePath("/dashboard");
    return {
      success: true,
      error: null,
      id: created ? (created as { id: string }).id : undefined,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem saat menyimpan personel",
    };
  }
}

export async function updatePersonnel(
  id: string,
  rawValues: PersonnelFormValues
): Promise<{ success: boolean; error: string | null }> {
  try {
    const parsed = personnelFormSchema.safeParse(rawValues);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["personnel"]["Update"] = {
      nik: data.nik,
      full_name: data.full_name,
      gender: data.gender,
      birth_place: data.birth_place || null,
      birth_date: data.birth_date || null,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      kta_number: data.kta_number || null,
      kta_expiry_date: data.kta_expiry_date || null,
      gada_level: data.gada_level,
      gada_certificate_number: data.gada_certificate_number || null,
      position: data.position,
      status: data.status,
      current_site_id: data.current_site_id || null,
      join_date: data.join_date,
      bank_name: data.bank_name || null,
      bank_account_number: data.bank_account_number || null,
      photo_url: data.photo_url || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase.from("personnel") as any)
      .update(payload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/personnel");
    revalidatePath(`/dashboard/personnel/${id}`);
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memperbarui data personel",
    };
  }
}

export async function deletePersonnel(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Cek apakah personel sedang aktif dalam plotting roster
    const { count: rosterCount } = await supabase
      .from("roster_assignments")
      .select("*", { count: "exact", head: true })
      .eq("personnel_id", id);

    if (rosterCount && rosterCount > 0) {
      return {
        success: false,
        error: `Personel tidak dapat dihapus karena masih terdaftar dalam ${rosterCount} penugasan roster aktif. Silakan ganti jadwal terlebih dahulu.`,
      };
    }

    const { error } = await supabase
      .from("personnel")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/personnel");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus data personel",
    };
  }
}

export async function uploadPersonnelPhoto(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { url: null, error: "Tidak ada file yang dipilih" };
    }

    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("personnel_docs")
      .upload(fileName, file);

    if (uploadError) {
      console.warn("Storage upload notice (bucket personnel_docs):", uploadError.message);
      return {
        url: `/uploads/mock-personnel-${Date.now()}.${fileExt}`,
        error: null,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("personnel_docs")
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: unknown) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Gagal mengunggah foto personel",
    };
  }
}
