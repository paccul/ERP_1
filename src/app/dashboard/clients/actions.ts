"use server";

import { revalidatePath } from "next/cache";
import { createClient as getSupabaseClient } from "@/lib/supabase/server";
import { clientFormSchema, type ClientFormValues } from "@/lib/validations/client";
import type { Database, Tables } from "@/types/database.types";

export type ClientWithSiteCount = Tables<"clients"> & {
  site_count: number;
};

export async function getClients(filters?: {
  status?: string;
  search?: string;
}): Promise<{ data: ClientWithSiteCount[]; error: string | null }> {
  try {
    const supabase = await getSupabaseClient();

    let query = supabase
      .from("clients")
      .select("*")
      .order("company_name", { ascending: true });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`company_name.ilike.${term},code.ilike.${term},pic_name.ilike.${term}`);
    }

    const { data: clientsData, error: clientErr } = await query;
    if (clientErr) throw clientErr;

    const { data: sitesData } = await supabase.from("sites").select("id, client_id");

    const siteCounts = new Map<string, number>();
    if (sitesData) {
      for (const s of (sitesData as Array<{ id: string; client_id: string }>)) {
        siteCounts.set(s.client_id, (siteCounts.get(s.client_id) || 0) + 1);
      }
    }

    const data: ClientWithSiteCount[] = ((clientsData as Tables<"clients">[]) || []).map((c) => ({
      ...c,
      site_count: siteCounts.get(c.id) || 0,
    }));

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getClients:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil data klien" };
  }
}

export async function getClientById(id: string): Promise<{
  data: (Tables<"clients"> & { sites: Tables<"sites">[] }) | null;
  error: string | null;
}> {
  try {
    const supabase = await getSupabaseClient();

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientErr) throw clientErr;

    const { data: sites, error: siteErr } = await supabase
      .from("sites")
      .select("*")
      .eq("client_id", id)
      .order("name", { ascending: true });

    if (siteErr) throw siteErr;

    return {
      data: {
        ...(client as Tables<"clients">),
        sites: (sites as Tables<"sites">[]) || [],
      },
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getClientById:", err);
    return { data: null, error: err instanceof Error ? err.message : "Gagal mengambil detail klien" };
  }
}

export async function createClient(values: ClientFormValues): Promise<{
  success: boolean;
  data?: Tables<"clients">;
  error?: string;
}> {
  try {
    const parsed = clientFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await getSupabaseClient();

    const payload: Database["public"]["Tables"]["clients"]["Insert"] = {
      code: parsed.data.code,
      company_name: parsed.data.company_name,
      npwp: parsed.data.npwp || null,
      billing_address: parsed.data.billing_address,
      pic_name: parsed.data.pic_name,
      pic_phone: parsed.data.pic_phone,
      pic_email: parsed.data.pic_email || null,
      contract_end_date: parsed.data.contract_end_date,
      status: parsed.data.status,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("clients") as any)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Kode klien mitra sudah digunakan" };
      }
      throw error;
    }

    revalidatePath("/dashboard/clients");
    return { success: true, data: data as Tables<"clients"> };
  } catch (err: unknown) {
    console.error("Error in createClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal mendaftarkan klien" };
  }
}

export async function updateClient(
  id: string,
  values: ClientFormValues
): Promise<{
  success: boolean;
  data?: Tables<"clients">;
  error?: string;
}> {
  try {
    const parsed = clientFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await getSupabaseClient();

    const payload: Database["public"]["Tables"]["clients"]["Update"] = {
      code: parsed.data.code,
      company_name: parsed.data.company_name,
      npwp: parsed.data.npwp || null,
      billing_address: parsed.data.billing_address,
      pic_name: parsed.data.pic_name,
      pic_phone: parsed.data.pic_phone,
      pic_email: parsed.data.pic_email || null,
      contract_end_date: parsed.data.contract_end_date,
      status: parsed.data.status,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("clients") as any)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Kode klien sudah digunakan oleh entitas lain" };
      }
      throw error;
    }

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${id}`);
    return { success: true, data: data as Tables<"clients"> };
  } catch (err: unknown) {
    console.error("Error in updateClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui data klien" };
  }
}

export async function deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    const { count, error: countErr } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("client_id", id);

    if (countErr) throw countErr;
    if (count && count > 0) {
      return {
        success: false,
        error: `Klien tidak dapat dihapus karena masih memiliki ${count} lokasi jaga/site aktif.`,
      };
    }

    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus klien" };
  }
}
