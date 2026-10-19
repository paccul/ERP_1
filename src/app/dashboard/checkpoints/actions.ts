"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkpointFormSchema, type CheckpointFormValues } from "@/lib/validations/checkpoint";
import type { Database, Tables } from "@/types/database.types";
import crypto from "crypto";

export type CheckpointWithSite = Tables<"checkpoints"> & {
  site: {
    id: string;
    name: string;
    code: string;
    client?: {
      company_name: string;
    } | null;
  } | null;
};

export async function getCheckpoints(
  siteId?: string
): Promise<{ data: CheckpointWithSite[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("checkpoints")
      .select("*")
      .order("patrol_order", { ascending: true });

    if (siteId && siteId !== "all") {
      query = query.eq("site_id", siteId);
    }

    const { data: checkpointsData, error: cpErr } = await query;
    if (cpErr) throw cpErr;

    const [{ data: sites }, { data: clients }] = await Promise.all([
      supabase.from("sites").select("id, name, code, client_id"),
      supabase.from("clients").select("id, company_name"),
    ]);

    const clientMap = new Map(
      ((clients as Array<{ id: string; company_name: string }>) || []).map((c) => [c.id, c.company_name])
    );

    const siteMap = new Map(
      ((sites as Array<{ id: string; name: string; code: string; client_id: string }>) || []).map((s) => [
        s.id,
        {
          id: s.id,
          name: s.name,
          code: s.code,
          client: s.client_id ? { company_name: clientMap.get(s.client_id) || "" } : null,
        },
      ])
    );

    const data: CheckpointWithSite[] = ((checkpointsData as Tables<"checkpoints">[]) || []).map((cp) => ({
      ...cp,
      site: siteMap.get(cp.site_id) || null,
    }));

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getCheckpoints:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil data checkpoint" };
  }
}

export async function createCheckpoint(values: CheckpointFormValues): Promise<{
  success: boolean;
  data?: Tables<"checkpoints">;
  error?: string;
}> {
  try {
    const parsed = checkpointFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const hash =
      parsed.data.qr_code_hash && parsed.data.qr_code_hash.trim() !== ""
        ? parsed.data.qr_code_hash.trim()
        : `CP-${parsed.data.site_id.substring(0, 8)}-${parsed.data.code}-${crypto.randomBytes(4).toString("hex")}`;

    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["checkpoints"]["Insert"] = {
      site_id: parsed.data.site_id,
      code: parsed.data.code,
      name: parsed.data.name,
      patrol_order: parsed.data.patrol_order,
      qr_code_hash: hash,
    };

    const { data, error } = await supabase
      .from("checkpoints")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Kode checkpoint sudah ada di pos jaga ini" };
      }
      throw error;
    }

    revalidatePath("/dashboard/checkpoints");
    revalidatePath("/dashboard/sites");
    return { success: true, data: data as Tables<"checkpoints"> };
  } catch (err: unknown) {
    console.error("Error in createCheckpoint:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat checkpoint" };
  }
}

export async function deleteCheckpoint(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("checkpoints").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/checkpoints");
    revalidatePath("/dashboard/sites");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteCheckpoint:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus checkpoint" };
  }
}
