import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: { orderBy: { sortOrder: "asc" } },
      _count: { select: { businesses: true, subcategories: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Business Categories"
        description="Manage categories and subcategories shown when businesses list on the site"
      >
        <CreateCategoryDialog />
      </PageHeader>

      <Card className="mb-6 border-dashed">
        <CardContent className="py-4 text-sm text-muted">
          Categories here appear in the business listing form, directory filters, and
          advertising category bids. Inactive categories are hidden from the public site.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-navy">No categories yet</p>
              <p className="mt-2 text-muted max-w-md mx-auto">
                Add your first business category (e.g. Restaurants, Home Services, Retail).
                You can add subcategories when editing each category.
              </p>
              <div className="mt-6">
                <CreateCategoryDialog />
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Businesses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="font-medium text-navy">{cat.name}</div>
                      <div className="text-xs text-muted">{cat.slug}</div>
                    </TableCell>
                    <TableCell>
                      {cat.subcategories.length === 0 ? (
                        <span className="text-muted text-sm">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cat.subcategories.slice(0, 4).map((sub) => (
                            <Badge key={sub.id} variant="outline" className="text-xs">
                              {sub.name}
                            </Badge>
                          ))}
                          {cat.subcategories.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{cat.subcategories.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{cat._count.businesses}</TableCell>
                    <TableCell>
                      <Badge variant={cat.isActive ? "default" : "secondary"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/categories/${cat.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
