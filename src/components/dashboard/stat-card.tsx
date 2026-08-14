import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
        <Icon className="size-4 text-navy" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-navy">{value}</div>
        {description && (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-light-blue mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
