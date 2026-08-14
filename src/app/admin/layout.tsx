import { requireAdmin } from "@/lib/auth-utils";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Let's Go Buffalo",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShell userName={user.name} userRole={user.role}>
      {children}
    </AdminShell>
  );
}
