"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/validations/invoice";

export interface InvoiceWithDetails extends Tables<"invoices"> {
  client?: Tables<"clients"> | null;
  lines: Array<
    Tables<"invoice_lines"> & {
      site?: Tables<"sites"> | null;
    }
  >;
}

export interface ClientWithSites extends Tables<"clients"> {
  sites: Array<
    Tables<"sites"> & {
      active_personnel_count: number;
    }
  >;
}

// 1. GET INVOICES LIST & METRICS (FIN-01)
export async function getInvoices(filters?: {
  status?: string;
  search?: string;
}): Promise<{
  data: InvoiceWithDetails[];
  stats: {
    totalInvoiced: number;
    totalUnpaid: number;
    totalPaid: number;
    draftCount: number;
  };
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.ilike("invoice_number", term);
    }

    const { data: invoices, error } = await query;
    if (error) throw error;

    const invoiceList = (invoices as Tables<"invoices">[]) || [];
    const invoiceIds = invoiceList.map((i) => i.id);
    const clientIds = Array.from(new Set(invoiceList.map((i) => i.client_id)));

    const [
      { data: clients },
      { data: lines },
      { data: sites },
    ] = await Promise.all([
      clientIds.length > 0
        ? supabase.from("clients").select("*").in("id", clientIds)
        : Promise.resolve({ data: [] }),
      invoiceIds.length > 0
        ? supabase.from("invoice_lines").select("*").in("invoice_id", invoiceIds)
        : Promise.resolve({ data: [] }),
      supabase.from("sites").select("*"),
    ]);

    const clientMap = new Map(((clients as Tables<"clients">[]) || []).map((c) => [c.id, c]));
    const siteMap = new Map(((sites as Tables<"sites">[]) || []).map((s) => [s.id, s]));

    const linesByInvoice = new Map<string, Array<Tables<"invoice_lines"> & { site?: Tables<"sites"> | null }>>();

    for (const l of ((lines as Tables<"invoice_lines">[]) || [])) {
      const enrichedLine = {
        ...l,
        site: siteMap.get(l.site_id) || null,
      };
      const arr = linesByInvoice.get(l.invoice_id) || [];
      arr.push(enrichedLine);
      linesByInvoice.set(l.invoice_id, arr);
    }

    const data: InvoiceWithDetails[] = invoiceList.map((inv) => ({
      ...inv,
      client: clientMap.get(inv.client_id) || null,
      lines: linesByInvoice.get(inv.id) || [],
    }));

    // Calculate metrics
    const totalInvoiced = data.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const totalUnpaid = data
      .filter((i) => i.status === "issued")
      .reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const totalPaid = data
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const draftCount = data.filter((i) => i.status === "draft").length;

    return {
      data,
      stats: {
        totalInvoiced,
        totalUnpaid,
        totalPaid,
        draftCount,
      },
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getInvoices:", err);
    return {
      data: [],
      stats: { totalInvoiced: 0, totalUnpaid: 0, totalPaid: 0, draftCount: 0 },
      error: err instanceof Error ? err.message : "Gagal mengambil daftar tagihan",
    };
  }
}

// 2. GET INVOICE BY ID (FOR PRINT & DETAIL VIEW)
export async function getInvoiceById(id: string): Promise<{
  invoice: InvoiceWithDetails | null;
  institution: Tables<"institution_settings"> | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: inv, error: invErr },
      { data: lines, error: lineErr },
      { data: institution },
    ] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase.from("invoice_lines").select("*").eq("invoice_id", id),
      supabase.from("institution_settings").select("*").limit(1).maybeSingle(),
    ]);

    if (invErr) throw invErr;
    if (lineErr) throw lineErr;

    const invTyped = inv as Tables<"invoices">;

    const [
      { data: client },
      { data: sites },
    ] = await Promise.all([
      supabase.from("clients").select("*").eq("id", invTyped.client_id).single(),
      supabase.from("sites").select("*"),
    ]);

    const siteMap = new Map(((sites as Tables<"sites">[]) || []).map((s) => [s.id, s]));

    const enrichedLines = ((lines as Tables<"invoice_lines">[]) || []).map((l) => ({
      ...l,
      site: siteMap.get(l.site_id) || null,
    }));

    const result: InvoiceWithDetails = {
      ...invTyped,
      client: (client as unknown as Tables<"clients">) || null,
      lines: enrichedLines,
    };

    return {
      invoice: result,
      institution: (institution as unknown as Tables<"institution_settings">) || null,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getInvoiceById:", err);
    return {
      invoice: null,
      institution: null,
      error: err instanceof Error ? err.message : "Gagal mengambil detail faktur",
    };
  }
}

// 3. GET DATA FOR INVOICE FORM (FIN-02)
export async function getInvoiceFormData(): Promise<{
  clients: ClientWithSites[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: clients, error: clientErr },
      { data: sites, error: siteErr },
      { data: personnel, error: pErr },
    ] = await Promise.all([
      supabase.from("clients").select("*").eq("status", "active").order("company_name"),
      supabase.from("sites").select("*").eq("status", "active"),
      supabase.from("personnel").select("id, current_site_id").eq("status", "active"),
    ]);

    if (clientErr) throw clientErr;
    if (siteErr) throw siteErr;
    if (pErr) throw pErr;

    // Count active personnel per site
    const personnelCountBySite = new Map<string, number>();
    for (const p of ((personnel as Array<{ id: string; current_site_id: string | null }>) || [])) {
      if (p.current_site_id) {
        const c = personnelCountBySite.get(p.current_site_id) || 0;
        personnelCountBySite.set(p.current_site_id, c + 1);
      }
    }

    const sitesByClient = new Map<string, Array<Tables<"sites"> & { active_personnel_count: number }>>();

    for (const s of ((sites as Tables<"sites">[]) || [])) {
      const pCount = personnelCountBySite.get(s.id) || s.required_personnel_per_shift || 1;
      const enrichedSite = {
        ...s,
        active_personnel_count: pCount,
      };
      const arr = sitesByClient.get(s.client_id) || [];
      arr.push(enrichedSite);
      sitesByClient.set(s.client_id, arr);
    }

    const result: ClientWithSites[] = ((clients as Tables<"clients">[]) || []).map((c) => ({
      ...c,
      sites: sitesByClient.get(c.id) || [],
    }));

    return { clients: result, error: null };
  } catch (err: unknown) {
    console.error("Error in getInvoiceFormData:", err);
    return {
      clients: [],
      error: err instanceof Error ? err.message : "Gagal memuat data form invoice",
    };
  }
}

// 4. CREATE INVOICE (DRAFT OR AUTO-ISSUE) (FIN-02)
export async function createInvoice(
  values: InvoiceFormValues,
  autoPost = false
): Promise<{
  success: boolean;
  invoiceId?: string;
  journalId?: string;
  error?: string;
}> {
  try {
    const parsed = invoiceFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const supabase = await createClient();

    // 1. Calculate subtotal, PPN, PPh23, Total
    const subtotal = parsed.data.lines.reduce((sum, l) => sum + (l.line_total || (l.personnel_count * l.rate_per_personnel)), 0);
    const ppnAmount = Math.round(subtotal * (parsed.data.ppn_rate / 100));
    const pph23Amount = parsed.data.pph23_amount || 0;
    const totalAmount = subtotal + ppnAmount - pph23Amount;

    // Generate unique invoice number: INV-YYYYMM-XXXX
    const periodNormalized = parsed.data.period_month.substring(0, 7).replace("-", "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${periodNormalized}-${randomSuffix}`;

    // Ensure period_month is valid date
    const periodDate = parsed.data.period_month.length === 7
      ? `${parsed.data.period_month}-01`
      : parsed.data.period_month;

    // Insert Invoice Header
    const invPayload = {
      invoice_number: invoiceNumber,
      client_id: parsed.data.client_id,
      period_month: periodDate,
      due_date: parsed.data.due_date,
      subtotal,
      ppn_rate: parsed.data.ppn_rate,
      ppn_amount: ppnAmount,
      pph23_amount: pph23Amount,
      total_amount: totalAmount,
      status: "draft",
    };

    const { data: invResult, error: invErr } = await (supabase.from("invoices") as any)
      .insert(invPayload)
      .select("id")
      .single();

    if (invErr) throw invErr;
    const invoiceId = invResult?.id;

    // Insert Lines
    const linesPayload = parsed.data.lines.map((l) => ({
      invoice_id: invoiceId,
      site_id: l.site_id,
      personnel_count: l.personnel_count,
      rate_per_personnel: l.rate_per_personnel,
      line_total: l.line_total || (l.personnel_count * l.rate_per_personnel),
    }));

    const { error: linesErr } = await (supabase.from("invoice_lines") as any).insert(linesPayload);
    if (linesErr) {
      await supabase.from("invoices").delete().eq("id", invoiceId);
      throw linesErr;
    }

    let journalId: string | undefined = undefined;

    // If autoPost is requested, immediately call post_invoice_to_journal
    if (autoPost) {
      const { data: jId, error: rpcErr } = await (supabase.rpc as any)(
        "post_invoice_to_journal",
        {
          p_invoice_id: invoiceId,
        }
      );

      if (rpcErr) {
        console.warn("Error calling post_invoice_to_journal:", rpcErr);
        throw new Error(`Invoice tersimpan sebagai draf namun gagal memposting jurnal: ${rpcErr.message}`);
      }
      journalId = typeof jId === "string" ? jId : undefined;
    }

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/accounting/journals");
    revalidatePath("/dashboard/accounting/receivables");

    return { success: true, invoiceId, journalId };
  } catch (err: unknown) {
    console.error("Error in createInvoice:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membuat invoice",
    };
  }
}

// 5. ISSUE INVOICE & POST TO JOURNAL (RPC: post_invoice_to_journal)
export async function issueInvoice(invoiceId: string): Promise<{
  success: boolean;
  journalId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: journalId, error: rpcErr } = await (supabase.rpc as any)(
      "post_invoice_to_journal",
      {
        p_invoice_id: invoiceId,
      }
    );

    if (rpcErr) {
      throw new Error(rpcErr.message);
    }

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/accounting/journals");
    revalidatePath("/dashboard/accounting/receivables");

    return {
      success: true,
      journalId: typeof journalId === "string" ? journalId : undefined,
    };
  } catch (err: unknown) {
    console.error("Error in issueInvoice:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menerbitkan invoice",
    };
  }
}

// 6. MARK INVOICE PAID (SETTLEMENT)
export async function markInvoicePaid(invoiceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Fetch invoice info
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) throw new Error("Invoice tidak ditemukan");

    const invTyped = inv as Tables<"invoices">;
    if (invTyped.status !== "issued") {
      return {
        success: false,
        error: `Hanya invoice berstatus "Terbit" yang dapat ditandai lunas (Status saat ini: ${invTyped.status}).`,
      };
    }

    // 2. Post settlement journal: Debit Kas/Bank (11100) vs Kredit Piutang Usaha (11200)
    const [
      { data: accKas },
      { data: accPiutang },
    ] = await Promise.all([
      supabase.from("accounts").select("id").eq("code", "11100").maybeSingle(),
      supabase.from("accounts").select("id").eq("code", "11200").maybeSingle(),
    ]);

    if (accKas && accPiutang) {
      const todayStr = new Date().toISOString().split("T")[0];
      const entryPayload = {
        entry_number: `JRN-PAYMENT-${invTyped.invoice_number}`,
        entry_date: todayStr,
        description: `Pelunasan Pembayaran Tagihan: ${invTyped.invoice_number}`,
      };

      const linesPayload = [
        {
          account_id: (accKas as any).id,
          debit: invTyped.total_amount,
          credit: 0,
          memo: `Penerimaan Kas/Bank Pelunasan Invoice ${invTyped.invoice_number}`,
        },
        {
          account_id: (accPiutang as any).id,
          debit: 0,
          credit: invTyped.total_amount,
          memo: `Pengurangan Piutang Usaha ${invTyped.invoice_number}`,
        },
      ];

      await (supabase.rpc as any)("validate_and_save_journal_entry", {
        p_header: entryPayload,
        p_lines: linesPayload,
      });
    }

    // 3. Update invoice status
    const { error: updErr } = await (supabase.from("invoices") as any)
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", invoiceId);

    if (updErr) throw updErr;

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/accounting/journals");
    revalidatePath("/dashboard/accounting/receivables");

    return { success: true };
  } catch (err: unknown) {
    console.error("Error in markInvoicePaid:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menandai lunas invoice",
    };
  }
}
