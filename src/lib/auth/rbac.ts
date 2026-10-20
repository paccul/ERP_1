import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SystemModuleKey =
  | "security"
  | "recruitment"
  | "logistics"
  | "finance"
  | "accounting"
  | "reports"
  | "users"
  | "institution";

export interface PermissionDetail {
  can_view: boolean;
  can_manage: boolean;
}

export type UserPermissionMap = Record<string, PermissionDetail>;

export const ALL_MODULE_KEYS: SystemModuleKey[] = [
  "security",
  "recruitment",
  "logistics",
  "finance",
  "accounting",
  "reports",
  "users",
  "institution",
];

export const ROUTE_MODULE_MAP: Record<string, SystemModuleKey> = {
  "/dashboard/personnel": "security",
  "/dashboard/recruitment": "recruitment",
  "/dashboard/clients": "security",
  "/dashboard/roster": "security",
  "/dashboard/logistics": "logistics",
  "/dashboard/invoices": "finance",
  "/dashboard/payroll": "finance",
  "/dashboard/accounting": "accounting",
  "/dashboard/settings": "institution",
  "/dashboard/settings/users": "users",
  "/dashboard/settings/roles": "users",
  "/dashboard/settings/institution": "institution",
  "/dashboard/settings/org-chart": "institution",
  "/dashboard/settings/backup": "institution",
};

/**
 * Super Admin default permissions: 100% full view & manage access
 */
export function getSuperAdminPermissions(): UserPermissionMap {
  const map: UserPermissionMap = {};
  for (const mod of ALL_MODULE_KEYS) {
    map[mod] = { can_view: true, can_manage: true };
  }
  return map;
}

/**
 * Fetch permissions for a specific user & role from Supabase
 */
export async function getCurrentUserPermissions(): Promise<{
  userId: string | null;
  email: string | null;
  roleName: string;
  fullName: string;
  avatarUrl: string | null;
  permissions: UserPermissionMap;
}> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return {
      userId: null,
      email: null,
      roleName: "Tamu",
      fullName: "Pengguna",
      avatarUrl: null,
      permissions: {},
    };
  }

  // Fetch live user directly from Supabase Auth admin to bypass cached session cookie user_metadata
  let user = authUser;
  try {
    const admin = createAdminClient();
    const { data: adminUserData } = await admin.auth.admin.getUserById(authUser.id);
    if (adminUserData?.user) {
      user = adminUserData.user;
    }
  } catch (err) {
    console.warn("Could not fetch fresh user via admin client:", err);
  }

  const userMetaRole = user.user_metadata?.role as string | undefined;
  const userMetaName = user.user_metadata?.full_name as string | undefined;
  const avatarUrl = (user.user_metadata?.avatar_url as string) || null;

  // Query profile and role
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("id, full_name, role_id, roles(id, name)")
    .eq("id", user.id)
    .maybeSingle();

  const roleName =
    profile?.roles?.name ||
    userMetaRole ||
    (user.email === "admin@garda.bujp.id" ? "super_admin" : "Staf Operasional");
  const fullName = profile?.full_name || userMetaName || user.email?.split("@")[0] || "User";

  // Super admin always has 100% full access
  if (
    roleName.toLowerCase() === "super_admin" ||
    roleName.toLowerCase() === "administrator sistem" ||
    roleName.toLowerCase() === "administrator bujp" ||
    user.email === "admin@garda.bujp.id"
  ) {
    return {
      userId: user.id,
      email: user.email || null,
      roleName,
      fullName,
      avatarUrl,
      permissions: getSuperAdminPermissions(),
    };
  }

  // Fetch role permissions
  const roleId = profile?.role_id;
  const permissions: UserPermissionMap = {};

  if (roleId) {
    const { data: perms } = await (supabase as any)
      .from("role_permissions")
      .select("module, can_view, can_manage")
      .eq("role_id", roleId);

    if (perms) {
      for (const p of perms) {
        permissions[p.module] = {
          can_view: Boolean(p.can_view),
          can_manage: Boolean(p.can_manage),
        };
      }
    }
  }

  // Ensure default false for missing modules
  for (const mod of ALL_MODULE_KEYS) {
    if (!permissions[mod]) {
      permissions[mod] = { can_view: false, can_manage: false };
    }
  }

  return {
    userId: user.id,
    email: user.email || null,
    roleName,
    fullName,
    avatarUrl,
    permissions,
  };
}

/**
 * Check if the current user has permission for a specific module and action
 */
export async function checkPermission(
  moduleKey: SystemModuleKey,
  action: "view" | "manage" = "view"
): Promise<boolean> {
  const { permissions, roleName } = await getCurrentUserPermissions();
  if (
    roleName.toLowerCase() === "super_admin" ||
    roleName.toLowerCase() === "administrator bujp" ||
    roleName.toLowerCase() === "administrator sistem"
  ) {
    return true;
  }

  const perm = permissions[moduleKey];
  if (!perm) return false;
  return action === "manage" ? Boolean(perm.can_manage) : Boolean(perm.can_view);
}

/**
 * Server route guard helper for enforcing permissions
 */
export async function requirePermission(
  moduleKey: SystemModuleKey,
  action: "view" | "manage" = "view"
): Promise<{ allowed: boolean; roleName: string }> {
  const allowed = await checkPermission(moduleKey, action);
  const { roleName } = await getCurrentUserPermissions();
  return { allowed, roleName };
}
