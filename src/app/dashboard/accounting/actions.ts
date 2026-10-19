"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { accountFormSchema, type AccountFormValues } from "@/lib/validations/account";
import { journalEntryFormSchema, type JournalEntryFormValues } from "@/lib/validations/journal";
import type { Database, Tables } from "@/types/database.types";

export type AccountWithChildren = Tables<"accounts"> & {
  parent_account?: {
    code: string;
    name: string;
  } | null;
  balance?: number;
};

export type JournalEntryWithLines = Tables<"journal_entries"> & {
  lines: Array<
    Tables<"journal_lines"> & {
      account: {
        code: string;
        name: string;
      } | null;
    }
  >;
  total_debit: number;
  total_credit: number;
};

// 1. ACCOUNTS (COA)
export async function getAccounts(): Promise<{ data: AccountWithChildren[]; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .order("code", { ascending: true });

    if (error) throw error;

    const accountList = ((accounts as Tables<"accounts">[]) || []);
    const accountMap = new Map(accountList.map((a) => [a.id, a]));

    const result: AccountWithChildren[] = accountList.map((a) => ({
      ...a,
      parent_account: a.parent_id
        ? {
            code: accountMap.get(a.parent_id)?.code || "",
            name: accountMap.get(a.parent_id)?.name || "",
          }
        : null,
    }));

    return { data: result, error: null };
  } catch (err: unknown) {
    console.error("Error in getAccounts:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil bagan akun" };
  }
}

export async function createAccount(values: AccountFormValues): Promise<{
  success: boolean;
  data?: Tables<"accounts">;
  error?: string;
}> {
  try {
    const parsed = accountFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi akun gagal" };
    }

    const supabase = await createClient();

    const payload: Database["public"]["Tables"]["accounts"]["Insert"] = {
      code: parsed.data.code,
      name: parsed.data.name,
      category: parsed.data.category,
      normal_balance: parsed.data.normal_balance,
      parent_id: parsed.data.parent_id || null,
      is_system: false,
      is_active: parsed.data.is_active,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("accounts") as any)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Nomor kode akun sudah terdaftar di sistem" };
      }
      throw error;
    }

    revalidatePath("/dashboard/accounting/coa");
    revalidatePath("/dashboard/accounting");
    return { success: true, data: data as Tables<"accounts"> };
  } catch (err: unknown) {
    console.error("Error in createAccount:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat akun baru" };
  }
}

export async function deleteAccount(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if system account
    const { data: acc, error: accErr } = await supabase
      .from("accounts")
      .select("is_system, name")
      .eq("id", id)
      .single();

    if (accErr) throw accErr;
    const accTyped = acc as { is_system: boolean | null; name: string } | null;
    if (accTyped && accTyped.is_system) {
      return {
        success: false,
        error: `Akun bawaan sistem "${accTyped.name}" diproteksi dan tidak boleh dihapus.`,
      };
    }

    // Check if account has journal lines
    const { count, error: countErr } = await supabase
      .from("journal_lines")
      .select("id", { count: "exact", head: true })
      .eq("account_id", id);

    if (countErr) throw countErr;
    if (count && count > 0) {
      return {
        success: false,
        error: `Akun tidak dapat dihapus karena sudah memiliki ${count} baris transaksi jurnal.`,
      };
    }

    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/accounting/coa");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error in deleteAccount:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus akun" };
  }
}

// 2. JOURNAL ENTRIES (DOUBLE-ENTRY)
export async function getJournalEntries(filters?: {
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<{ data: JournalEntryWithLines[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("journal_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.sourceType && filters.sourceType !== "all") {
      query = query.eq("source_type", filters.sourceType);
    }

    if (filters?.startDate) {
      query = query.gte("entry_date", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("entry_date", filters.endDate);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`entry_number.ilike.${term},description.ilike.${term}`);
    }

    const { data: entries, error } = await query;
    const entriesTyped = ((entries as Tables<"journal_entries">[]) || []);
    const entryIds = entriesTyped.map((e) => e.id);

    // Fetch lines for these entries
    const [
      { data: lines },
      { data: accounts },
    ] = await Promise.all([
      entryIds.length > 0
        ? supabase.from("journal_lines").select("*").in("journal_entry_id", entryIds)
        : Promise.resolve({ data: [] }),
      supabase.from("accounts").select("id, code, name"),
    ]);

    const accountMap = new Map(((accounts as Array<{ id: string; code: string; name: string }>) || []).map((a) => [a.id, a]));

    const linesByEntry = new Map<string, Array<Tables<"journal_lines"> & { account: { code: string; name: string } | null }>>();

    for (const l of ((lines as Tables<"journal_lines">[]) || [])) {
      const enrichedLine = {
        ...l,
        account: accountMap.get(l.account_id) || null,
      };
      const arr = linesByEntry.get(l.journal_entry_id) || [];
      arr.push(enrichedLine);
      linesByEntry.set(l.journal_entry_id, arr);
    }

    const data: JournalEntryWithLines[] = ((entries as Tables<"journal_entries">[]) || []).map((e) => {
      const entryLines = linesByEntry.get(e.id) || [];
      const totalDebit = entryLines.reduce((acc, l) => acc + (l.debit || 0), 0);
      const totalCredit = entryLines.reduce((acc, l) => acc + (l.credit || 0), 0);

      return {
        ...e,
        lines: entryLines,
        total_debit: totalDebit,
        total_credit: totalCredit,
      };
    });

    return { data, error: null };
  } catch (err: unknown) {
    console.error("Error in getJournalEntries:", err);
    return { data: [], error: err instanceof Error ? err.message : "Gagal mengambil daftar jurnal" };
  }
}

export async function createJournalEntry(values: JournalEntryFormValues): Promise<{
  success: boolean;
  journalId?: string;
  error?: string;
}> {
  try {
    const parsed = journalEntryFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validasi entri jurnal gagal" };
    }

    const supabase = await createClient();

    const header = {
      entry_number: parsed.data.entry_number,
      entry_date: parsed.data.entry_date,
      description: parsed.data.description,
    };

    const lines = parsed.data.lines.map((l) => ({
      account_id: l.account_id,
      debit: l.debit || 0,
      credit: l.credit || 0,
      memo: l.memo || null,
    }));

    // Call atomic RPC: validate_and_save_journal_entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: journalId, error } = await (supabase.rpc as any)("validate_and_save_journal_entry", {
      p_header: header,
      p_lines: lines,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Nomor bukti voucher jurnal sudah pernah digunakan" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/accounting/journals");
    revalidatePath("/dashboard/accounting/ledger");
    revalidatePath("/dashboard/accounting");
    return { success: true, journalId: journalId as string };
  } catch (err: unknown) {
    console.error("Error in createJournalEntry:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan entri jurnal" };
  }
}

// 3. GENERAL LEDGER (BUKU BESAR)
export async function getGeneralLedger(
  accountId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  account: Tables<"accounts"> | null;
  lines: Array<{
    id: string;
    entry_number: string;
    entry_date: string;
    description: string;
    debit: number;
    credit: number;
    running_balance: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accErr || !account) {
      return {
        account: null,
        lines: [],
        totalDebit: 0,
        totalCredit: 0,
        endingBalance: 0,
        error: "Akun COA tidak ditemukan",
      };
    }

    let query = supabase
      .from("journal_lines")
      .select("id, debit, credit, memo, journal_entry_id")
      .eq("account_id", accountId);

    const { data: lines, error: lineErr } = await query;
    if (lineErr) throw lineErr;

    const entryIds = ((lines as Array<{ journal_entry_id: string }>) || []).map((l) => l.journal_entry_id);

    const { data: entries } = entryIds.length > 0
      ? await supabase.from("journal_entries").select("id, entry_number, entry_date, description").in("id", entryIds)
      : { data: [] };

    const entryMap = new Map(((entries as Array<{ id: string; entry_number: string; entry_date: string; description: string }>) || []).map((e) => [e.id, e]));

    // Sort by entry_date ascending
    const combined = ((lines as Array<{ id: string; debit: number; credit: number; memo: string | null; journal_entry_id: string }>) || []).map((l) => {
      const entry = entryMap.get(l.journal_entry_id);
      return {
        id: l.id,
        entry_number: entry?.entry_number || "-",
        entry_date: entry?.entry_date || "2026-01-01",
        description: l.memo || entry?.description || "-",
        debit: l.debit || 0,
        credit: l.credit || 0,
      };
    });

    combined.sort((a, b) => a.entry_date.localeCompare(b.entry_date));

    let runningBalance = 0;
    const isDebitNormal = (account as Tables<"accounts">).normal_balance === "debit";

    const ledgerLines = combined.map((row) => {
      if (isDebitNormal) {
        runningBalance += row.debit - row.credit;
      } else {
        runningBalance += row.credit - row.debit;
      }

      return {
        ...row,
        running_balance: runningBalance,
      };
    });

    const totalDebit = combined.reduce((acc, l) => acc + l.debit, 0);
    const totalCredit = combined.reduce((acc, l) => acc + l.credit, 0);

    return {
      account: account as Tables<"accounts">,
      lines: ledgerLines,
      totalDebit,
      totalCredit,
      endingBalance: runningBalance,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getGeneralLedger:", err);
    return {
      account: null,
      lines: [],
      totalDebit: 0,
      totalCredit: 0,
      endingBalance: 0,
      error: err instanceof Error ? err.message : "Gagal menyusun buku besar",
    };
  }
}

// 4. RECEIVABLES SUBSIDIARY LEDGER (BUKU PEMBANTU PIUTANG)
export async function getReceivablesLedger(): Promise<{
  clients: Array<{
    client_id: string;
    client_name: string;
    client_code: string;
    total_invoiced: number;
    total_paid: number;
    outstanding_balance: number;
  }>;
  totalReceivables: number;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: clients },
      { data: invoices },
    ] = await Promise.all([
      supabase.from("clients").select("id, company_name, code"),
      supabase.from("invoices").select("id, client_id, total_amount, status"),
    ]);

    const receivablesMap = new Map<
      string,
      { total_invoiced: number; total_paid: number; outstanding: number }
    >();

    for (const inv of ((invoices as Array<{ client_id: string; total_amount: number; status: string }>) || [])) {
      const cur = receivablesMap.get(inv.client_id) || {
        total_invoiced: 0,
        total_paid: 0,
        outstanding: 0,
      };

      if (inv.status === "issued" || inv.status === "paid") {
        cur.total_invoiced += inv.total_amount || 0;
      }

      if (inv.status === "paid") {
        cur.total_paid += inv.total_amount || 0;
      } else if (inv.status === "issued") {
        cur.outstanding += inv.total_amount || 0;
      }

      receivablesMap.set(inv.client_id, cur);
    }

    let grandTotalReceivables = 0;

    const clientRows = ((clients as Array<{ id: string; company_name: string; code: string }>) || []).map((c) => {
      const stats = receivablesMap.get(c.id) || {
        total_invoiced: 0,
        total_paid: 0,
        outstanding: 0,
      };
      grandTotalReceivables += stats.outstanding;

      return {
        client_id: c.id,
        client_name: c.company_name,
        client_code: c.code,
        total_invoiced: stats.total_invoiced,
        total_paid: stats.total_paid,
        outstanding_balance: stats.outstanding,
      };
    });

    return {
      clients: clientRows,
      totalReceivables: grandTotalReceivables,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getReceivablesLedger:", err);
    return {
      clients: [],
      totalReceivables: 0,
      error: err instanceof Error ? err.message : "Gagal mengambil buku pembantu piutang",
    };
  }
}
