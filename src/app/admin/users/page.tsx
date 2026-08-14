import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { UserRoleEditor } from "@/components/admin/user-role-editor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/admin-utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function UsersPage() {
  const users = await db.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { businesses: true } } },
  });

  return (
    <div>
      <PageHeader title="Users" description={`${users.length} registered users`} />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Businesses</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "MODERATOR" ? "accent" : "secondary"}>
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{user._count.businesses}</TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <UserRoleEditor
                      user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
