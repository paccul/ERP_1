import { getCurrentUserPermissions } from "@/lib/auth/rbac";
import { getInstitutionSettings } from "@/app/dashboard/settings/actions";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Dashboard Operasional | Garda BUJP ERP",
  description: "Sistem Manajemen Badan Usaha Jasa Pengamanan",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userPerms, institutionSettings] = await Promise.all([
    getCurrentUserPermissions(),
    getInstitutionSettings(),
  ]);

  return (
    <DashboardShell
      userEmail={userPerms.email}
      userRole={userPerms.roleName}
      fullName={userPerms.fullName}
      avatarUrl={userPerms.avatarUrl}
      companyLogoUrl={institutionSettings?.logo_url || null}
      permissions={userPerms.permissions}
    >
      {children}
    </DashboardShell>
  );
}
