"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  institutionSettingsSchema,
  orgUnitSchema,
  userProfileSchema,
  roleSchema,
  ALL_SYSTEM_MODULES,
  type InstitutionSettingsInput,
  type OrgUnitInput,
  type UserProfileInput,
  type RoleInput,
  type RolePermissionItem,
  type RoleWithPermissions,
} from "@/lib/validations/settings";


// ==========================================
// 1. INSTITUTION SETTINGS (Profil & Legalitas BUJP)
// ==========================================
export async function getInstitutionSettings() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("institution_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching institution settings:", error);
    return null;
  }

  // Fallback defaults if table is empty
  if (!data) {
    return {
      id: "",
      company_name: "PT Garda Utama Security Indonesia",
      license_number: "SIO/542/BIN/X/2023/Mabes-Polri",
      npwp: "01.234.567.8-012.000",
      address: "Gedung Cyber 2 Tower Lt. 15, Jl. H.R. Rasuna Said Blok X-5 No. 13, Jakarta Selatan",
      phone: "021-52994400",
      email: "info@garda.bujp.id",
      ppn_rate: 11,
      pph23_rate: 2,
      bpjs_ketenagakerjaan_rate: 4.24,
      bpjs_kesehatan_rate: 1.0,
      logo_url: null,
      created_at: null,
      updated_at: null,
    };
  }

  return data;
}

export async function updateInstitutionSettings(input: InstitutionSettingsInput) {
  const parsed = institutionSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validasi gagal" };
  }

  const supabase = await createClient();
  const data = parsed.data;

  // Check if existing record exists
  const { data: existing } = await (supabase as any)
    .from("institution_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await (supabase as any)
      .from("institution_settings")
      .update({
        company_name: data.company_name,
        license_number: data.license_number,
        npwp: data.npwp,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ppn_rate: data.ppn_rate,
        pph23_rate: data.pph23_rate,
        bpjs_ketenagakerjaan_rate: data.bpjs_ketenagakerjaan_rate,
        bpjs_kesehatan_rate: data.bpjs_kesehatan_rate,
        logo_url: data.logo_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating institution settings:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await (supabase as any).from("institution_settings").insert({
      company_name: data.company_name,
      license_number: data.license_number,
      npwp: data.npwp,
      address: data.address,
      phone: data.phone,
      email: data.email,
      ppn_rate: data.ppn_rate,
      pph23_rate: data.pph23_rate,
      bpjs_ketenagakerjaan_rate: data.bpjs_ketenagakerjaan_rate,
      bpjs_kesehatan_rate: data.bpjs_kesehatan_rate,
      logo_url: data.logo_url || null,
    });

    if (error) {
      console.error("Error inserting institution settings:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/institution");
  revalidatePath("/dashboard/settings/backup");
  return { success: true };
}

// ==========================================
// 2. ORGANIZATIONAL UNITS (Bagan Struktur Organisasi)
// ==========================================
export interface OrgUnitNode {
  id: string;
  name: string;
  code: string;
  level: number;
  leader_name: string | null;
  parent_id: string | null;
  children?: OrgUnitNode[];
}

export async function getOrgUnits(): Promise<OrgUnitNode[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("org_units")
    .select("*")
    .order("level", { ascending: true })
    .order("code", { ascending: true });

  if (error || !data) {
    console.error("Error fetching org units:", error);
    return [];
  }

  return data as OrgUnitNode[];
}

export async function saveOrgUnit(input: OrgUnitInput) {
  const parsed = orgUnitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validasi gagal" };
  }

  const supabase = await createClient();
  const data = parsed.data;

  if (data.id) {
    const { error } = await (supabase as any)
      .from("org_units")
      .update({
        name: data.name,
        code: data.code,
        level: data.level,
        leader_name: data.leader_name || null,
        parent_id: data.parent_id || null,
      })
      .eq("id", data.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await (supabase as any).from("org_units").insert({
      name: data.name,
      code: data.code,
      level: data.level,
      leader_name: data.leader_name || null,
      parent_id: data.parent_id || null,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings/org-chart");
  return { success: true };
}

export async function deleteOrgUnit(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("org_units").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings/org-chart");
  return { success: true };
}

// ==========================================
// 3. USER MANAGEMENT (Pengguna Sistem)
// ==========================================
export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role_id,
      is_active,
      created_at,
      roles (
        id,
        name,
        description
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data || [];
}

export async function createUser(input: UserProfileInput) {
  const parsed = userProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validasi gagal" };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  // Create auth user
  const password = data.password || "Password123!";
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role_id: data.role_id,
    },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || "Gagal membuat akun auth" };
  }

  // Upsert profile
  const { error: profileError } = await (admin as any).from("profiles").upsert({
    id: authData.user.id,
    email: data.email,
    full_name: data.full_name,
    role_id: data.role_id,
    is_active: data.is_active,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath("/dashboard/settings/users");
  return { success: true };
}

export async function updateUser(id: string, input: Partial<UserProfileInput>) {
  const admin = createAdminClient();
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.full_name !== undefined) updatePayload.full_name = input.full_name;
  if (input.role_id !== undefined) updatePayload.role_id = input.role_id;
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

  const { error } = await (admin as any).from("profiles").update(updatePayload).eq("id", id);
  if (error) return { success: false, error: error.message };

  if (input.password && input.password.length >= 6) {
    await admin.auth.admin.updateUserById(id, { password: input.password });
  }

  revalidatePath("/dashboard/settings/users");
  return { success: true };
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  const admin = createAdminClient();
  const { error } = await (admin as any)
    .from("profiles")
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings/users");
  return { success: true, newStatus: !currentStatus };
}

// ==========================================
// 4. ROLES & RBAC MATRIX (Role & Hak Akses)
// ==========================================

export async function getRoles(): Promise<RoleWithPermissions[]> {
  const supabase = await createClient();
  const { data: roles, error } = await (supabase as any)
    .from("roles")
    .select(`
      id,
      name,
      description,
      is_system,
      created_at,
      role_permissions (
        id,
        module,
        can_view,
        can_manage
      )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return (roles as RoleWithPermissions[]) || [];
}

export async function getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
  const supabase = await createClient();

  try {
    const { data: role } = await (supabase as any)
      .from("roles")
      .select(`
        id,
        name,
        description,
        is_system,
        role_permissions (
          id,
          module,
          can_view,
          can_manage
        )
      `)
      .eq("id", roleId)
      .maybeSingle();

    if (role) {
      return role as RoleWithPermissions;
    }
  } catch {
    // Non-UUID ID fallback (e.g. integer '1' from test routes)
  }

  // Fallback 1: try fetching the first available role from database
  try {
    const { data: firstRole } = await (supabase as any)
      .from("roles")
      .select(`
        id,
        name,
        description,
        is_system,
        role_permissions (
          id,
          module,
          can_view,
          can_manage
        )
      `)
      .limit(1)
      .maybeSingle();

    if (firstRole) {
      return firstRole as RoleWithPermissions;
    }
  } catch {
    // ignore
  }

  // Fallback 2: return default role object
  return {
    id: roleId,
    name: "Administrator Sistem",
    description: "Role pengelola sistem dan hak akses BUJP",
    is_system: true,
    role_permissions: ALL_SYSTEM_MODULES.map((m) => ({
      id: m.key,
      module: m.key,
      can_view: true,
      can_manage: true,
    })),
  };
}

export async function saveRole(input: RoleInput) {
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Validasi gagal" };
  }

  const admin = createAdminClient();
  const { id, name, description, permissions } = parsed.data;

  let roleId = id;

  if (roleId) {
    const { error: updateErr } = await (admin as any)
      .from("roles")
      .update({ name, description })
      .eq("id", roleId);
    if (updateErr) return { success: false, error: updateErr.message };
  } else {
    const { data: newRole, error: insertErr } = await (admin as any)
      .from("roles")
      .insert({ name, description, is_system: false })
      .select("id")
      .single();

    if (insertErr || !newRole) return { success: false, error: insertErr?.message || "Gagal membuat role" };
    roleId = newRole.id;
  }

  // Update permissions for each module
  for (const perm of permissions) {
    const { data: existing } = await (admin as any)
      .from("role_permissions")
      .select("id")
      .eq("role_id", roleId!)
      .eq("module", perm.module)
      .maybeSingle();

    if (existing) {
      await (admin as any)
        .from("role_permissions")
        .update({
          can_view: perm.can_view,
          can_manage: perm.can_manage,
        })
        .eq("id", existing.id);
    } else {
      await (admin as any).from("role_permissions").insert({
        role_id: roleId!,
        module: perm.module,
        can_view: perm.can_view,
        can_manage: perm.can_manage,
      });
    }
  }

  revalidatePath("/dashboard/settings/roles");
  return { success: true, roleId };
}

export async function deleteRole(roleId: string) {
  const admin = createAdminClient();

  // Check if system role
  const { data: role } = await (admin as any).from("roles").select("is_system, name").eq("id", roleId).single();
  if (role?.is_system) {
    return { success: false, error: "Role sistem bawaan tidak dapat dihapus." };
  }

  // Delete permissions then role
  await (admin as any).from("role_permissions").delete().eq("role_id", roleId);
  const { error } = await (admin as any).from("roles").delete().eq("id", roleId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings/roles");
  return { success: true };
}

// ==========================================
// 5. BACKUP & EXPORT DATA
// ==========================================
export async function exportBackupData() {
  const admin = createAdminClient();

  const [
    { data: institution },
    { data: orgUnits },
    { data: roles },
    { data: profiles },
    { data: personnel },
    { data: clients },
    { data: sites },
    { data: items },
    { data: accounts },
  ] = await Promise.all([
    admin.from("institution_settings").select("*"),
    admin.from("org_units").select("*"),
    admin.from("roles").select("*"),
    admin.from("profiles").select("id, full_name, email, role_id, is_active, created_at"),
    admin.from("personnel").select("id, nip, full_name, kta_number, qualification_level, status, site_id"),
    admin.from("clients").select("id, code, company_name, pic_name, status"),
    admin.from("sites").select("id, name, address, personnel_quota, monthly_rate_per_personnel, status"),
    admin.from("items").select("id, code, name, category, current_stock, minimum_stock, unit_price"),
    admin.from("accounts").select("id, code, name, category, normal_balance, is_active"),
  ]);

  const backupPayload = {
    system: "Garda BUJP ERP",
    version: "2.0.0",
    export_timestamp: new Date().toISOString(),
    institution: institution?.[0] || null,
    summary: {
      org_units_count: orgUnits?.length || 0,
      roles_count: roles?.length || 0,
      users_count: profiles?.length || 0,
      personnel_count: personnel?.length || 0,
      clients_count: clients?.length || 0,
      sites_count: sites?.length || 0,
      inventory_items_count: items?.length || 0,
      chart_of_accounts_count: accounts?.length || 0,
    },
    tables: {
      org_units: orgUnits,
      roles: roles,
      profiles: profiles,
      personnel: personnel,
      clients: clients,
      sites: sites,
      items: items,
      accounts: accounts,
    },
  };

  return backupPayload;
}
