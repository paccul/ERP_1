import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let roleName = "Administrator BUJP";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && (profile as { role_id?: string | null }).role_id) {
      const { data: role } = await supabase
        .from("roles")
        .select("name")
        .eq("id", (profile as { role_id: string }).role_id)
        .maybeSingle();

      if (role && (role as { name?: string }).name) {
        roleName = (role as { name: string }).name;
      }
    }
  }

  return (
    <DashboardShell
      userEmail={user?.email}
      userRole={roleName}
    >
      {children}
    </DashboardShell>
  );
}
