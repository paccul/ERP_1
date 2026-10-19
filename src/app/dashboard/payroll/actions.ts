"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import {
  payrollRunFormSchema,
  type PayrollRunFormValues,
} from "@/lib/validations/payroll";

export interface PayrollRunWithDetails extends Tables<"payroll_runs"> {
  payslips_count: number;
}

export interface PayslipWithPersonnel extends Tables<"payslips"> {
  personnel?: {
    id: string;
    full_name: string;
    kta_number: string | null;
    position: string | null;
    nik: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
  } | null;
  site?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

// 1. GET PAYROLL RUNS (FIN-03)
export async function getPayrollRuns(filters?: {
  search?: string;
}): Promise<{
  data: PayrollRunWithDetails[];
  stats: {
    totalNetPayroll: number;
    totalGrossSalary: number;
    totalDeductions: number;
    postedRunsCount: number;
  };
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("payroll_runs")
      .select("*")
      .order("period_month", { ascending: false });

    if (filters?.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.ilike("period_month", term);
    }

    const { data: runs, error } = await query;
    if (error) throw error;

    const runsTyped = (runs as Tables<"payroll_runs">[]) || [];
    const runIds = runsTyped.map((r) => r.id);

    // Get count of payslips per run
    const { data: payslips } = await (runIds.length > 0
      ? supabase.from("payslips").select("payroll_run_id")
      : Promise.resolve({ data: [] }));

    const countByRun = new Map<string, number>();
    for (const p of ((payslips as Array<{ payroll_run_id: string }>) || [])) {
      const c = countByRun.get(p.payroll_run_id) || 0;
      countByRun.set(p.payroll_run_id, c + 1);
    }

    const data: PayrollRunWithDetails[] = runsTyped.map((r) => ({
      ...r,
      payslips_count: countByRun.get(r.id) || 0,
    }));

    const totalNetPayroll = data.reduce((sum, r) => sum + (r.net_payroll_amount || 0), 0);
    const totalGrossSalary = data.reduce(
      (sum, r) => sum + ((r.total_basic_salary || 0) + (r.total_allowances || 0) + (r.total_overtime || 0)),
      0
    );
    const totalDeductions = data.reduce((sum, r) => sum + (r.total_deductions || 0), 0);
    const postedRunsCount = data.filter((r) => r.status === "posted").length;

    return {
      data,
      stats: {
        totalNetPayroll,
        totalGrossSalary,
        totalDeductions,
        postedRunsCount,
      },
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getPayrollRuns:", err);
    return {
      data: [],
      stats: { totalNetPayroll: 0, totalGrossSalary: 0, totalDeductions: 0, postedRunsCount: 0 },
      error: err instanceof Error ? err.message : "Gagal mengambil daftar penggajian",
    };
  }
}

// 2. GET PAYROLL RUN BY ID
export async function getPayrollRunById(id: string): Promise<{
  run: Tables<"payroll_runs"> | null;
  payslips: PayslipWithPersonnel[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: run, error: runErr },
      { data: slips, error: slipErr },
      { data: personnel },
      { data: sites },
    ] = await Promise.all([
      supabase.from("payroll_runs").select("*").eq("id", id).single(),
      supabase.from("payslips").select("*").eq("payroll_run_id", id),
      supabase.from("personnel").select("id, full_name, kta_number, position, nik, bank_name, bank_account_number"),
      supabase.from("sites").select("id, name, code"),
    ]);

    if (runErr) throw runErr;
    if (slipErr) throw slipErr;

    const personnelMap = new Map(((personnel as any[]) || []).map((p) => [p.id, p]));
    const siteMap = new Map(((sites as Tables<"sites">[]) || []).map((s) => [s.id, s]));

    const enrichedSlips: PayslipWithPersonnel[] = ((slips as Tables<"payslips">[]) || []).map((s) => ({
      ...s,
      personnel: personnelMap.get(s.personnel_id) || null,
      site: s.site_id ? siteMap.get(s.site_id) || null : null,
    }));

    return {
      run: (run as Tables<"payroll_runs">) || null,
      payslips: enrichedSlips,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getPayrollRunById:", err);
    return {
      run: null,
      payslips: [],
      error: err instanceof Error ? err.message : "Gagal mengambil detail payroll",
    };
  }
}

// 3. PRE-POPULATE DATA FOR GENERATING PAYROLL (FIN-03)
export async function getPayrollGenerationData(): Promise<{
  personnelList: Array<{
    id: string;
    full_name: string;
    kta_number: string | null;
    position: string | null;
    current_site_id: string | null;
    site_name: string | null;
    standard_basic_salary: number;
    standard_allowance: number;
  }>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: personnel, error: pErr },
      { data: sites, error: sErr },
    ] = await Promise.all([
      supabase.from("personnel").select("*").eq("status", "active").order("full_name"),
      supabase.from("sites").select("*"),
    ]);

    if (pErr) throw pErr;
    if (sErr) throw sErr;

    const siteMap = new Map(((sites as Tables<"sites">[]) || []).map((s) => [s.id, s]));

    const result = ((personnel as Tables<"personnel">[]) || []).map((p) => {
      const site = p.current_site_id ? siteMap.get(p.current_site_id) : null;
      // Standard UMR / security base salary: 4.800.000 IDR
      const basicSalary = 4800000;
      const allowance = p.position?.toLowerCase().includes("danru") || p.position?.toLowerCase().includes("chief")
        ? 500000
        : 250000;

      return {
        id: p.id,
        full_name: p.full_name,
        kta_number: p.kta_number,
        position: p.position || "Anggota Satpam",
        current_site_id: p.current_site_id,
        site_name: site ? `[${site.code}] ${site.name}` : "Kantor Pusat / Cadangan",
        standard_basic_salary: basicSalary,
        standard_allowance: allowance,
      };
    });

    return { personnelList: result, error: null };
  } catch (err: unknown) {
    console.error("Error in getPayrollGenerationData:", err);
    return {
      personnelList: [],
      error: err instanceof Error ? err.message : "Gagal mengambil data personel untuk payroll",
    };
  }
}

// 4. CREATE PAYROLL RUN & ATOMIC POST TO JOURNAL
export async function createPayrollRun(
  values: PayrollRunFormValues,
  autoPost = false
): Promise<{
  success: boolean;
  payrollRunId?: string;
  journalId?: string;
  error?: string;
}> {
  try {
    const parsed = payrollRunFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const supabase = await createClient();

    // Aggregations
    let totalBasic = 0;
    let totalAllowances = 0;
    let totalOvertime = 0;
    let totalDeductions = 0;
    let netPayrollAmount = 0;

    for (const p of parsed.data.payslips) {
      const deductions =
        (p.bpjs_kesehatan || 0) +
        (p.bpjs_ketenagakerjaan || 0) +
        (p.pph21_amount || 0) +
        (p.uniform_deduction || 0);

      const net = (p.basic_salary || 0) + (p.allowance_position || 0) + (p.overtime_amount || 0) - deductions;

      totalBasic += p.basic_salary || 0;
      totalAllowances += p.allowance_position || 0;
      totalOvertime += p.overtime_amount || 0;
      totalDeductions += deductions;
      netPayrollAmount += net;
    }

    const periodDate = parsed.data.period_month.length === 7
      ? `${parsed.data.period_month}-01`
      : parsed.data.period_month;

    // 1. Insert header
    const runPayload = {
      period_month: periodDate,
      run_date: parsed.data.run_date,
      total_basic_salary: totalBasic,
      total_allowances: totalAllowances,
      total_overtime: totalOvertime,
      total_deductions: totalDeductions,
      net_payroll_amount: netPayrollAmount,
      status: "draft",
    };

    const { data: runResult, error: runErr } = await (supabase.from("payroll_runs") as any)
      .insert(runPayload)
      .select("id")
      .single();

    if (runErr) throw runErr;
    const payrollRunId = runResult?.id;

    // 2. Insert payslips
    const payslipsPayload = parsed.data.payslips.map((p) => {
      const deductions =
        (p.bpjs_kesehatan || 0) +
        (p.bpjs_ketenagakerjaan || 0) +
        (p.pph21_amount || 0) +
        (p.uniform_deduction || 0);
      const net = (p.basic_salary || 0) + (p.allowance_position || 0) + (p.overtime_amount || 0) - deductions;

      return {
        payroll_run_id: payrollRunId,
        personnel_id: p.personnel_id,
        site_id: p.site_id || null,
        basic_salary: p.basic_salary,
        allowance_position: p.allowance_position || 0,
        overtime_amount: p.overtime_amount || 0,
        bpjs_kesehatan: p.bpjs_kesehatan || 0,
        bpjs_ketenagakerjaan: p.bpjs_ketenagakerjaan || 0,
        pph21_amount: p.pph21_amount || 0,
        uniform_deduction: p.uniform_deduction || 0,
        net_salary: net,
      };
    });

    const { error: slipsErr } = await (supabase.from("payslips") as any).insert(payslipsPayload);
    if (slipsErr) {
      await supabase.from("payroll_runs").delete().eq("id", payrollRunId);
      throw slipsErr;
    }

    let journalId: string | undefined = undefined;

    // 3. If autoPost requested, call atomic RPC: post_payroll_to_journal
    if (autoPost) {
      const { data: jId, error: rpcErr } = await (supabase.rpc as any)(
        "post_payroll_to_journal",
        {
          p_payroll_run_id: payrollRunId,
        }
      );

      if (rpcErr) {
        throw new Error(`Payroll tersimpan namun gagal memposting jurnal beban gaji: ${rpcErr.message}`);
      }
      journalId = typeof jId === "string" ? jId : undefined;
    }

    revalidatePath("/dashboard/payroll");
    revalidatePath("/dashboard/accounting/journals");

    return { success: true, payrollRunId, journalId };
  } catch (err: unknown) {
    console.error("Error in createPayrollRun:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memproses payroll",
    };
  }
}

// 5. POST PAYROLL TO JOURNAL RPC
export async function postPayrollRun(payrollRunId: string): Promise<{
  success: boolean;
  journalId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: journalId, error: rpcErr } = await (supabase.rpc as any)(
      "post_payroll_to_journal",
      {
        p_payroll_run_id: payrollRunId,
      }
    );

    if (rpcErr) {
      throw new Error(rpcErr.message);
    }

    revalidatePath("/dashboard/payroll");
    revalidatePath(`/dashboard/payroll/${payrollRunId}`);
    revalidatePath("/dashboard/accounting/journals");

    return {
      success: true,
      journalId: typeof journalId === "string" ? journalId : undefined,
    };
  } catch (err: unknown) {
    console.error("Error in postPayrollRun:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memposting payroll ke jurnal",
    };
  }
}

// 6. GET SINGLE PAYSLIP DETAILS (FOR PRINTING SLIP GAJI)
export async function getPayslipById(payslipId: string): Promise<{
  payslip: PayslipWithPersonnel | null;
  institution: Tables<"institution_settings"> | null;
  periodMonth: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const [
      { data: slip, error: slipErr },
      { data: institution },
    ] = await Promise.all([
      supabase.from("payslips").select("*").eq("id", payslipId).single(),
      supabase.from("institution_settings").select("*").limit(1).maybeSingle(),
    ]);

    if (slipErr || !slip) throw new Error("Slip gaji tidak ditemukan");

    const slipTyped = slip as Tables<"payslips">;

    const [
      { data: personnel },
      { data: site },
      { data: run },
    ] = await Promise.all([
      supabase.from("personnel").select("id, full_name, kta_number, position, nik, bank_name, bank_account_number").eq("id", slipTyped.personnel_id).single(),
      slipTyped.site_id ? supabase.from("sites").select("id, name, code").eq("id", slipTyped.site_id).single() : Promise.resolve({ data: null }),
      supabase.from("payroll_runs").select("period_month").eq("id", slipTyped.payroll_run_id).single(),
    ]);

    const result: PayslipWithPersonnel = {
      ...slipTyped,
      personnel: (personnel as any) || null,
      site: (site as any) || null,
    };

    return {
      payslip: result,
      institution: (institution as unknown as Tables<"institution_settings">) || null,
      periodMonth: (run as any)?.period_month || null,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Error in getPayslipById:", err);
    return {
      payslip: null,
      institution: null,
      periodMonth: null,
      error: err instanceof Error ? err.message : "Gagal mengambil slip gaji",
    };
  }
}
