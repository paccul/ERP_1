"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import { itemFormSchema, type ItemFormValues } from "@/lib/validations/item";
import { distributionFormSchema, type DistributionFormValues } from "@/lib/validations/distribution";

export interface ItemWithMetrics extends Tables<"items"> {
  is_low_stock: boolean;
  stock_valuation: number;
}

export interface StockMovementWithDetails extends Tables<"stock_movements"> {
  recipient_display_name?: string;
}

export interface DistributionWithLines extends Tables<"distributions"> {
  lines: Array<
    Tables<"distribution_lines"> & {
      item?: { code: string; name: string; unit: string } | null;
    }
  >;
  personnel?: { full_name: string; kta_number: string | null } | null;
  site?: { name: string; code: string } | null;
  total_quantity: number;
  total_cost: number;
}

// 1. GET ITEMS (MASTER GUDANG LOGISTIK)
export async function getItems(filters?: {
  category?: string;
  search?: string;
  lowStockOnly?: boolean;
}): Promise<{
  data: ItemWithMetrics[];
  stats: {
    totalSku: number;
    totalStockValuation: number;
    criticalStockCount: number;
  };
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase.from("items").select("*").order("name", { ascending: true });

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`code.ilike.${term},name.ilike.${term}`);
    }

    const { data: items, error } = await query;
    if (error) throw error;

    const itemsTyped = ((items as Tables<"items">[]) || []);

    const enriched: ItemWithMetrics[] = itemsTyped.map((i) => {
      const isLowStock = (i.current_stock ?? 0) <= (i.minimum_stock ?? 0);
      const stockValuation = (i.current_stock ?? 0) * (i.unit_price ?? 0);
      return {
        ...i,
        is_low_stock: isLowStock,
        stock_valuation: stockValuation,
      };
    });

    const filtered = filters?.lowStockOnly
      ? enriched.filter((i) => i.is_low_stock)
      : enriched;

    const totalSku = enriched.length;
    const totalStockValuation = enriched.reduce((sum, i) => sum + i.stock_valuation, 0);
    const criticalStockCount = enriched.filter((i) => i.is_low_stock).length;

    return {
      data: filtered,
      stats: {
        totalSku,
        totalStockValuation,
        criticalStockCount,
      },
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getItems:", err);
    return {
      data: [],
      stats: { totalSku: 0, totalStockValuation: 0, criticalStockCount: 0 },
      error: err instanceof Error ? err.message : "Gagal mengambil data barang gudang",
    };
  }
}

// 2. GET ITEM BY ID & KARTU STOK
export async function getItemById(id: string): Promise<{
  item: ItemWithMetrics | null;
  movements: Tables<"stock_movements">[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: item, error: itemErr },
      { data: movements, error: movErr },
    ] = await Promise.all([
      supabase.from("items").select("*").eq("id", id).single(),
      supabase
        .from("stock_movements")
        .select("*")
        .eq("item_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (itemErr) throw itemErr;
    if (movErr) throw movErr;

    const itemTyped = item as Tables<"items">;
    const enrichedItem: ItemWithMetrics = {
      ...itemTyped,
      is_low_stock: (itemTyped.current_stock ?? 0) <= (itemTyped.minimum_stock ?? 0),
      stock_valuation: (itemTyped.current_stock ?? 0) * (itemTyped.unit_price ?? 0),
    };

    return {
      item: enrichedItem,
      movements: (movements as Tables<"stock_movements">[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getItemById:", err);
    return {
      item: null,
      movements: [],
      error: err instanceof Error ? err.message : "Gagal mengambil detail item barang",
    };
  }
}

// 3. CREATE ITEM
export async function createItem(values: ItemFormValues): Promise<{
  success: boolean;
  itemId?: string;
  error?: string;
}> {
  try {
    const parsed = itemFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const supabase = await createClient();

    // Check code uniqueness
    const { data: existing } = await supabase
      .from("items")
      .select("id")
      .eq("code", parsed.data.code.trim().toUpperCase())
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Kode barang "${parsed.data.code}" sudah digunakan. Gunakan kode lain.`,
      };
    }

    const payload = {
      code: parsed.data.code.trim().toUpperCase(),
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      unit: parsed.data.unit.trim(),
      size: parsed.data.size?.trim() || null,
      unit_price: parsed.data.unit_price,
      minimum_stock: parsed.data.minimum_stock,
      initial_stock: parsed.data.initial_stock,
      current_stock: parsed.data.initial_stock,
      notes: parsed.data.notes?.trim() || null,
    };

    const { data: created, error } = await (supabase.from("items") as any)
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;

    // If initial stock > 0, log first stock movement
    if (parsed.data.initial_stock > 0 && created) {
      await (supabase.from("stock_movements") as any).insert({
        item_id: created.id,
        movement_type: "in",
        quantity: parsed.data.initial_stock,
        balance_after: parsed.data.initial_stock,
        reference_number: "INIT-STOCK",
        recipient_type: "internal",
        recipient_id: null,
        notes: "Saldo awal inventaris barang saat registrasi master",
      });
    }

    revalidatePath("/dashboard/logistics");
    return { success: true, itemId: created?.id };
  } catch (err: unknown) {
    console.error("Error in createItem:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menambahkan item barang",
    };
  }
}

// 4. UPDATE ITEM
export async function updateItem(
  id: string,
  values: ItemFormValues
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const parsed = itemFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const supabase = await createClient();

    // Check code uniqueness
    const { data: existing } = await supabase
      .from("items")
      .select("id")
      .eq("code", parsed.data.code.trim().toUpperCase())
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Kode barang "${parsed.data.code}" sudah digunakan oleh barang lain.`,
      };
    }

    const payload = {
      code: parsed.data.code.trim().toUpperCase(),
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      unit: parsed.data.unit.trim(),
      size: parsed.data.size?.trim() || null,
      unit_price: parsed.data.unit_price,
      minimum_stock: parsed.data.minimum_stock,
      notes: parsed.data.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase.from("items") as any)
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/logistics");
    revalidatePath(`/dashboard/logistics/detail/${id}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in updateItem:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui item barang",
    };
  }
}

// 5. DELETE ITEM
export async function deleteItem(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check distribution lines
    const { count: distCount, error: distErr } = await supabase
      .from("distribution_lines")
      .select("id", { count: "exact", head: true })
      .eq("item_id", id);

    if (distErr) throw distErr;
    if (distCount && distCount > 0) {
      return {
        success: false,
        error: `Barang tidak dapat dihapus karena sudah memiliki ${distCount} riwayat distribusi kaporlap.`,
      };
    }

    // Delete stock movements first if any
    await supabase.from("stock_movements").delete().eq("item_id", id);

    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/logistics");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteItem:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus item barang",
    };
  }
}

// 6. METADATA FOR DISTRIBUTION FORM
export async function getDistributionFormMetadata(): Promise<{
  items: Tables<"items">[];
  personnel: Array<{ id: string; full_name: string; kta_number: string | null }>;
  sites: Array<{ id: string; name: string; code: string }>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: items },
      { data: personnel },
      { data: sites },
    ] = await Promise.all([
      supabase.from("items").select("*").gt("current_stock", 0).order("name"),
      supabase.from("personnel").select("id, full_name, kta_number").eq("status", "active").order("full_name"),
      supabase.from("sites").select("id, name, code").eq("status", "active").order("name"),
    ]);

    return {
      items: (items as Tables<"items">[]) || [],
      personnel: (personnel as Array<{ id: string; full_name: string; kta_number: string | null }>) || [],
      sites: (sites as Array<{ id: string; name: string; code: string }>) || [],
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getDistributionFormMetadata:", err);
    return {
      items: [],
      personnel: [],
      sites: [],
      error: err instanceof Error ? err.message : "Gagal mengambil data form distribusi",
    };
  }
}

// 7. CREATE DISTRIBUTION & ATOMIC POSTING TO JOURNAL (LOG-05)
export async function createDistribution(values: DistributionFormValues): Promise<{
  success: boolean;
  distributionId?: string;
  journalId?: string;
  error?: string;
}> {
  try {
    const parsed = distributionFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const supabase = await createClient();

    // Verify stock availability for each item
    for (const line of parsed.data.lines) {
      const { data: itemData, error: itemErr } = await supabase
        .from("items")
        .select("name, current_stock")
        .eq("id", line.item_id)
        .single();

      if (itemErr || !itemData) {
        return { success: false, error: "Item barang tidak ditemukan di sistem." };
      }

      const currentStock = (itemData as { name: string; current_stock: number }).current_stock ?? 0;
      if (currentStock < line.quantity) {
        return {
          success: false,
          error: `Stok tidak mencukupi untuk item "${(itemData as any).name}". Tersedia: ${currentStock}, Diminta: ${line.quantity}.`,
        };
      }
    }

    // Generate unique distribution number: DST-YYYYMMDD-XXXX
    const dateStr = parsed.data.distribution_date.replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const distributionNumber = `DST-${dateStr}-${randomSuffix}`;

    // 1. Insert header
    const distPayload = {
      distribution_number: distributionNumber,
      distribution_date: parsed.data.distribution_date,
      target_type: parsed.data.target_type,
      personnel_id: parsed.data.target_type === "personnel" ? parsed.data.personnel_id : null,
      site_id: parsed.data.target_type === "site" ? parsed.data.site_id : null,
      recipient_name: parsed.data.recipient_name.trim(),
      notes: parsed.data.notes?.trim() || null,
    };

    const { data: distResult, error: distErr } = await (supabase.from("distributions") as any)
      .insert(distPayload)
      .select("id")
      .single();

    if (distErr) throw distErr;
    const distributionId = distResult?.id;

    // 2. Insert lines
    const linesPayload = parsed.data.lines.map((l) => ({
      distribution_id: distributionId,
      item_id: l.item_id,
      quantity: l.quantity,
      unit_cost: l.unit_cost,
    }));

    const { error: linesErr } = await (supabase.from("distribution_lines") as any).insert(linesPayload);
    if (linesErr) {
      // rollback header if failed
      await supabase.from("distributions").delete().eq("id", distributionId);
      throw linesErr;
    }

    // 3. Call atomic RPC: process_distribution_with_journal
    const { data: journalId, error: rpcErr } = await (supabase.rpc as any)(
      "process_distribution_with_journal",
      {
        p_distribution_id: distributionId,
      }
    );

    if (rpcErr) {
      console.warn("RPC Warning / Error:", rpcErr);
      // RPC error could be stock or missing accounts, bubble up
      throw new Error(`Gagal memproses mutasi stok & jurnal: ${rpcErr.message}`);
    }

    revalidatePath("/dashboard/logistics");
    revalidatePath("/dashboard/logistics/history");
    revalidatePath("/dashboard/accounting/journals");

    return {
      success: true,
      distributionId,
      journalId: typeof journalId === "string" ? journalId : undefined,
    };
  } catch (err: unknown) {
    console.error("Error in createDistribution:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memproses distribusi kaporlap",
    };
  }
}

// 8. GET DISTRIBUTIONS HISTORY
export async function getDistributions(filters?: {
  search?: string;
}): Promise<{
  data: DistributionWithLines[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("distributions")
      .select("*")
      .order("distribution_date", { ascending: false });

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`distribution_number.ilike.${term},recipient_name.ilike.${term}`);
    }

    const { data: distributions, error } = await query;
    if (error) throw error;

    const distList = (distributions as Tables<"distributions">[]) || [];
    const distIds = distList.map((d) => d.id);

    // Fetch lines, personnel, sites, items
    const [
      { data: lines },
      { data: personnel },
      { data: sites },
      { data: items },
    ] = await Promise.all([
      distIds.length > 0
        ? supabase.from("distribution_lines").select("*").in("distribution_id", distIds)
        : Promise.resolve({ data: [] }),
      supabase.from("personnel").select("id, full_name, kta_number"),
      supabase.from("sites").select("id, name, code"),
      supabase.from("items").select("id, code, name, unit"),
    ]);

    const itemMap = new Map(((items as Array<{ id: string; code: string; name: string; unit: string }>) || []).map((i) => [i.id, i]));
    const personnelMap = new Map(((personnel as Array<{ id: string; full_name: string; kta_number: string | null }>) || []).map((p) => [p.id, p]));
    const siteMap = new Map(((sites as Array<{ id: string; name: string; code: string }>) || []).map((s) => [s.id, s]));

    const linesByDist = new Map<string, Array<Tables<"distribution_lines"> & { item?: { code: string; name: string; unit: string } | null }>>();

    for (const l of ((lines as Tables<"distribution_lines">[]) || [])) {
      const enrichedLine = {
        ...l,
        item: itemMap.get(l.item_id) || null,
      };
      const arr = linesByDist.get(l.distribution_id) || [];
      arr.push(enrichedLine);
      linesByDist.set(l.distribution_id, arr);
    }

    const data: DistributionWithLines[] = distList.map((d) => {
      const dLines = linesByDist.get(d.id) || [];
      const totalQty = dLines.reduce((acc, l) => acc + (l.quantity || 0), 0);
      const totalCost = dLines.reduce((acc, l) => acc + ((l.quantity || 0) * (l.unit_cost || 0)), 0);

      return {
        ...d,
        lines: dLines,
        personnel: d.personnel_id ? personnelMap.get(d.personnel_id) || null : null,
        site: d.site_id ? siteMap.get(d.site_id) || null : null,
        total_quantity: totalQty,
        total_cost: totalCost,
      };
    });

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getDistributions:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Gagal mengambil riwayat distribusi",
    };
  }
}
