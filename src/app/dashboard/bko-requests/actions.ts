"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bkoFormSchema, type BkoFormValues } from "@/lib/validations/bko";
import type { Tables } from "@/types/database.types";

export type BkoRequestWithDetails = Tables<"bko_requests"> & {
  personnel: {
    id: string;
    full_name: string;
    nik: string;
    position: string;
  } | null;
  origin_site: {
    id: string;
    name: string;
    code: string;
  } | null;
  target_site: {
    id: string;
    name: string;
    code: string;
  } | null;
  approver?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
};

export async function getBkoRequests(filters?: {
  status?: string;
}): Promise<{ data: BkoRequestWithDetails[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("bko_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data: requests, error: bkoErr } = await query;
    if (bkoErr) throw bkoErr;

    const [
      { data: personnel },
      { data: sites },
      { data: profiles },
    ] = await Promise.all([
      supabase.from("personnel").select("id, full_name, nik, position"),
      supabase.from("sites").select("id, name, code"),
      supabase.from("profiles").select("id, full_name, email"),
    ]);

    const personnelMap = new Map(
      ((personnel as Array<{ id: string; full_name: string; nik: string; position: string }>) || []).map((p) => [p.id, p])
    );
    const siteMap = new Map(
      ((sites as Array<{ id: string; name: string; code: string }>) || []).map((s) => [s.id, s])
    );
    const profileMap = new Map(
      ((profiles as Array<{ id: string; full_name: string; email: string }>) || []).map((pr) => [pr.id, pr])
    );

    const data: BkoRequestWithDetails[] = ((requests as Tables<"bko_requests">[]) || []).map((r) => ({
      ...r,
      personnel: personnelMap.get(r.personnel_id) || null,
      origin_site: siteMap.get(r.origin_site_id) || null,
      target_site: siteMap.get(r.target_site_id) || null,
      approver: r.approved_by ? profileMap.get(r.approved_by) || null : null,
    }));

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getBkoRequests:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil data permohonan BKO" };
  }
}

export async function createBkoRequest(values: BkoFormValues): Promise<{
  success: boolean;
  data?: Tables<"bko_requests">;
  error?: string;
}> {
  try {
    const parsed = bkoFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await createClient();

    const payload = {
      personnel_id: parsed.data.personnel_id,
      origin_site_id: parsed.data.origin_site_id,
      target_site_id: parsed.data.target_site_id,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      reason: parsed.data.reason,
      status: "pending",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("bko_requests") as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/bko-requests");
    revalidatePath("/dashboard/roster");
    return { success: true, data: data as Tables<"bko_requests"> };
  } catch (err: unknown) {
    console.error("Error in createBkoRequest:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat permohonan BKO" };
  }
}

export async function approveBko(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Call atomic RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)("approve_bko_request", {
      p_request_id: requestId,
    });

    if (error) throw error;

    revalidatePath("/dashboard/bko-requests");
    revalidatePath("/dashboard/roster");
    revalidatePath("/dashboard/personnel");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in approveBko:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyetujui BKO" };
  }
}

export async function rejectBko(
  requestId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("bko_requests") as any)
      .update({
        status: "rejected",
      })
      .eq("id", requestId);

    if (error) throw error;

    revalidatePath("/dashboard/bko-requests");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in rejectBko:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menolak BKO" };
  }
}
