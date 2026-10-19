"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rosterFormSchema, type RosterFormValues } from "@/lib/validations/roster";
import type { Database, Tables } from "@/types/database.types";

export type RosterWithDetails = Tables<"roster_assignments"> & {
  personnel: {
    id: string;
    full_name: string;
    nik: string;
    position: string;
  } | null;
  site: {
    id: string;
    name: string;
    code: string;
  } | null;
  shift: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
  } | null;
};

export async function getShifts(): Promise<Tables<"shifts">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shifts")
    .select("*")
    .order("start_time", { ascending: true });
  return (data as Tables<"shifts">[]) || [];
}

export async function getPersonnelForRoster(siteId?: string): Promise<
  Array<{ id: string; full_name: string; nik: string; position: string; current_site_id: string | null }>
> {
  const supabase = await createClient();
  let query = supabase
    .from("personnel")
    .select("id, full_name, nik, position, current_site_id")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (siteId && siteId !== "all") {
    query = query.eq("current_site_id", siteId);
  }

  const { data } = await query;
  return (data as Array<{ id: string; full_name: string; nik: string; position: string; current_site_id: string | null }>) || [];
}

export async function getRoster(filters: {
  siteId?: string;
  startDate: string;
  endDate: string;
}): Promise<{ data: RosterWithDetails[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("roster_assignments")
      .select("*")
      .gte("date", filters.startDate)
      .lte("date", filters.endDate)
      .order("date", { ascending: true });

    if (filters.siteId && filters.siteId !== "all") {
      query = query.eq("site_id", filters.siteId);
    }

    const { data: assignmentsData, error: rosterErr } = await query;
    if (rosterErr) throw rosterErr;

    const [
      { data: personnel },
      { data: sites },
      { data: shifts },
    ] = await Promise.all([
      supabase.from("personnel").select("id, full_name, nik, position"),
      supabase.from("sites").select("id, name, code"),
      supabase.from("shifts").select("id, name, start_time, end_time"),
    ]);

    const personnelMap = new Map(
      ((personnel as Array<{ id: string; full_name: string; nik: string; position: string }>) || []).map((p) => [p.id, p])
    );
    const siteMap = new Map(
      ((sites as Array<{ id: string; name: string; code: string }>) || []).map((s) => [s.id, s])
    );
    const shiftMap = new Map(
      ((shifts as Array<{ id: string; name: string; start_time: string; end_time: string }>) || []).map((sh) => [sh.id, sh])
    );

    const data: RosterWithDetails[] = ((assignmentsData as Tables<"roster_assignments">[]) || []).map((r) => ({
      ...r,
      personnel: personnelMap.get(r.personnel_id) || null,
      site: siteMap.get(r.site_id) || null,
      shift: r.shift_id ? shiftMap.get(r.shift_id) || null : null,
    }));

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getRoster:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil jadwal jaga" };
  }
}

export async function assignShift(values: RosterFormValues): Promise<{
  success: boolean;
  data?: Tables<"roster_assignments">;
  error?: string;
}> {
  try {
    const parsed = rosterFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi data gagal" };
    }

    const supabase = await createClient();

    // Check conflict: Does the personnel already have an assignment on this date?
    const { data: existing } = await supabase
      .from("roster_assignments")
      .select("id, site_id, shift_id")
      .eq("personnel_id", parsed.data.personnel_id)
      .eq("date", parsed.data.date)
      .maybeSingle();

    if (existing) {
      const updatePayload: Database["public"]["Tables"]["roster_assignments"]["Update"] = {
        site_id: parsed.data.site_id,
        shift_id: parsed.data.shift_id || null,
        status: parsed.data.status,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("roster_assignments") as any)
        .update(updatePayload)
        .eq("id", (existing as { id: string }).id)
        .select()
        .single();

      if (error) throw error;
      revalidatePath("/dashboard/roster");
      return { success: true, data: data as Tables<"roster_assignments"> };
    }

    const insertPayload: Database["public"]["Tables"]["roster_assignments"]["Insert"] = {
      personnel_id: parsed.data.personnel_id,
      site_id: parsed.data.site_id,
      shift_id: parsed.data.shift_id || null,
      date: parsed.data.date,
      status: parsed.data.status,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("roster_assignments") as any)
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Personel sudah memiliki jadwal pada tanggal ini" };
      }
      throw error;
    }

    revalidatePath("/dashboard/roster");
    return { success: true, data: data as Tables<"roster_assignments"> };
  } catch (err: unknown) {
    console.error("Error in assignShift:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan jadwal" };
  }
}

export async function deleteRosterAssignment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("roster_assignments").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/roster");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteRosterAssignment:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus jadwal" };
  }
}
