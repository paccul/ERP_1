"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { siteFormSchema, type SiteFormValues } from "@/lib/validations/site";
import type { Database, Tables } from "@/types/database.types";

export type SiteWithDetails = Tables<"sites"> & {
  client: {
    id: string;
    company_name: string;
    code: string;
  } | null;
  active_personnel_count: number;
  checkpoint_count: number;
};

export async function getClientsDropdown(): Promise<
  Array<{ id: string; company_name: string; code: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, company_name, code")
    .eq("status", "active")
    .order("company_name", { ascending: true });
  return (data as Array<{ id: string; company_name: string; code: string }>) || [];
}

export async function getSites(filters?: {
  clientId?: string;
  status?: string;
  search?: string;
}): Promise<{ data: SiteWithDetails[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("sites")
      .select("*")
      .order("name", { ascending: true });

    if (filters?.clientId && filters.clientId !== "all") {
      query = query.eq("client_id", filters.clientId);
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${term},code.ilike.${term},address.ilike.${term}`);
    }

    const { data: sitesData, error: siteErr } = await query;
    if (siteErr) throw siteErr;

    const [
      { data: clients },
      { data: personnel },
      { data: checkpoints },
    ] = await Promise.all([
      supabase.from("clients").select("id, company_name, code"),
      supabase.from("personnel").select("id, current_site_id").eq("status", "active"),
      supabase.from("checkpoints").select("id, site_id"),
    ]);

    const clientMap = new Map(
      ((clients as Array<{ id: string; company_name: string; code: string }>) || []).map((c) => [c.id, c])
    );

    const personnelCounts = new Map<string, number>();
    if (personnel) {
      for (const p of (personnel as Array<{ id: string; current_site_id: string | null }>)) {
        if (p.current_site_id) {
          personnelCounts.set(
            p.current_site_id,
            (personnelCounts.get(p.current_site_id) || 0) + 1
          );
        }
      }
    }

    const cpCounts = new Map<string, number>();
    if (checkpoints) {
      for (const cp of (checkpoints as Array<{ id: string; site_id: string }>)) {
        cpCounts.set(cp.site_id, (cpCounts.get(cp.site_id) || 0) + 1);
      }
    }

    const data: SiteWithDetails[] = ((sitesData as Tables<"sites">[]) || []).map((s) => ({
      ...s,
      client: clientMap.get(s.client_id) || null,
      active_personnel_count: personnelCounts.get(s.id) || 0,
      checkpoint_count: cpCounts.get(s.id) || 0,
    }));

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getSites:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil data lokasi jaga" };
  }
}

export async function getSiteById(id: string): Promise<{
  data:
    | (Tables<"sites"> & {
        client: Tables<"clients"> | null;
        checkpoints: Tables<"checkpoints">[];
        personnel: Tables<"personnel">[];
      })
    | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data: site, error: siteErr } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (siteErr) throw siteErr;

    const [
      { data: client },
      { data: checkpoints },
      { data: personnel },
    ] = await Promise.all([
      supabase.from("clients").select("*").eq("id", (site as Tables<"sites">).client_id).single(),
      supabase.from("checkpoints").select("*").eq("site_id", id).order("patrol_order", { ascending: true }),
      supabase.from("personnel").select("*").eq("current_site_id", id),
    ]);

    return {
      data: {
        ...(site as Tables<"sites">),
        client: (client as unknown as Tables<"clients">) || null,
        checkpoints: (checkpoints as Tables<"checkpoints">[]) || [],
        personnel: (personnel as Tables<"personnel">[]) || [],
      },
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getSiteById:", err);
    return { data: null, error: err instanceof Error ? err.message : "Gagal mengambil detail pos jaga" };
  }
}

export async function createSite(values: SiteFormValues): Promise<{
  success: boolean;
  data?: Tables<"sites">;
  error?: string;
}> {
  try {
    const parsed = siteFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["sites"]["Insert"] = {
      client_id: parsed.data.client_id,
      code: parsed.data.code,
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      required_personnel_per_shift: parsed.data.required_personnel_per_shift,
      monthly_rate_per_personnel: parsed.data.monthly_rate_per_personnel,
      status: parsed.data.status,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("sites") as any)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Kode pos jaga/site sudah digunakan" };
      }
      throw error;
    }

    revalidatePath("/dashboard/sites");
    revalidatePath("/dashboard/clients");
    return { success: true, data: data as Tables<"sites"> };
  } catch (err: unknown) {
    console.error("Error in createSite:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat lokasi jaga" };
  }
}

export async function updateSite(
  id: string,
  values: SiteFormValues
): Promise<{
  success: boolean;
  data?: Tables<"sites">;
  error?: string;
}> {
  try {
    const parsed = siteFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["sites"]["Update"] = {
      client_id: parsed.data.client_id,
      code: parsed.data.code,
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      required_personnel_per_shift: parsed.data.required_personnel_per_shift,
      monthly_rate_per_personnel: parsed.data.monthly_rate_per_personnel,
      status: parsed.data.status,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("sites") as any)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Kode pos jaga sudah digunakan" };
      }
      throw error;
    }

    revalidatePath("/dashboard/sites");
    revalidatePath(`/dashboard/sites/${id}`);
    revalidatePath("/dashboard/clients");
    return { success: true, data: data as Tables<"sites"> };
  } catch (err: unknown) {
    console.error("Error in updateSite:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui lokasi jaga" };
  }
}

export async function deleteSite(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { count, error: countErr } = await supabase
      .from("personnel")
      .select("id", { count: "exact", head: true })
      .eq("current_site_id", id);

    if (countErr) throw countErr;
    if (count && count > 0) {
      return {
        success: false,
        error: `Pos jaga tidak dapat dihapus karena masih menaungi ${count} personel satpam aktif.`,
      };
    }

    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/sites");
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteSite:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus lokasi jaga" };
  }
}
