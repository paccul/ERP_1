"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResultItem {
  id: string;
  category: "personnel" | "client" | "site" | "item" | "invoice";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const cleanQ = query.trim();
  const results: SearchResultItem[] = [];

  try {
    // 1. Search Personnel (Table: personnel)
    const { data: personnel } = await supabase
      .from("personnel")
      .select("id, full_name, nik, kta_number, gada_level, status")
      .or(`full_name.ilike.%${cleanQ}%,nik.ilike.%${cleanQ}%,kta_number.ilike.%${cleanQ}%`)
      .limit(5);

    const pList = (personnel as unknown as Array<{
      id: string;
      full_name: string;
      nik: string | null;
      kta_number: string | null;
      gada_level: string | null;
      status: string;
    }>) || [];

    for (const p of pList) {
      results.push({
        id: p.id,
        category: "personnel",
        title: p.full_name,
        subtitle: `NIK: ${p.nik || "-"} | KTA: ${p.kta_number || "Belum ada"} | Gada: ${p.gada_level || "-"}`,
        href: `/dashboard/personnel/${p.id}`,
        badge: p.status,
      });
    }

    // 2. Search Clients (Table: clients)
    const { data: clients } = await supabase
      .from("clients")
      .select("id, company_name, code, pic_name")
      .or(`company_name.ilike.%${cleanQ}%,code.ilike.%${cleanQ}%,pic_name.ilike.%${cleanQ}%`)
      .limit(5);

    const cList = (clients as unknown as Array<{
      id: string;
      company_name: string;
      code: string;
      pic_name: string | null;
    }>) || [];

    for (const c of cList) {
      results.push({
        id: c.id,
        category: "client",
        title: c.company_name,
        subtitle: `Kode: ${c.code} | PIC: ${c.pic_name || "-"}`,
        href: `/dashboard/clients`,
        badge: "Klien Mitra",
      });
    }

    // 3. Search Sites (Table: sites)
    const { data: sites } = await supabase
      .from("sites")
      .select("id, name, address, monthly_rate_per_personnel")
      .or(`name.ilike.%${cleanQ}%,address.ilike.%${cleanQ}%`)
      .limit(5);

    const sList = (sites as unknown as Array<{
      id: string;
      name: string;
      address: string | null;
      monthly_rate_per_personnel: number;
    }>) || [];

    for (const s of sList) {
      results.push({
        id: s.id,
        category: "site",
        title: s.name,
        subtitle: s.address || "Lokasi Pengamanan",
        href: `/dashboard/clients`,
        badge: "Pos Jaga",
      });
    }

    // 4. Search Logistic Items (Table: items)
    const { data: items } = await supabase
      .from("items")
      .select("id, name, code, current_stock, unit")
      .or(`name.ilike.%${cleanQ}%,code.ilike.%${cleanQ}%`)
      .limit(5);

    const iList = (items as unknown as Array<{
      id: string;
      name: string;
      code: string;
      current_stock: number;
      unit: string;
    }>) || [];

    for (const i of iList) {
      results.push({
        id: i.id,
        category: "item",
        title: i.name,
        subtitle: `Kode: ${i.code} | Stok: ${i.current_stock} ${i.unit}`,
        href: `/dashboard/logistics/detail/${i.id}`,
        badge: "Logistik",
      });
    }

    // 5. Search Invoices (Table: invoices)
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, total_amount, status")
      .ilike("invoice_number", `%${cleanQ}%`)
      .limit(5);

    const invList = (invoices as unknown as Array<{
      id: string;
      invoice_number: string;
      total_amount: number;
      status: string;
    }>) || [];

    for (const inv of invList) {
      results.push({
        id: inv.id,
        category: "invoice",
        title: `Faktur: ${inv.invoice_number}`,
        subtitle: `Total: Rp ${(inv.total_amount || 0).toLocaleString("id-ID")}`,
        href: `/dashboard/invoices/${inv.id}`,
        badge: inv.status,
      });
    }

    return results;
  } catch (err) {
    console.error("Error in searchGlobal:", err);
    return [];
  }
}
