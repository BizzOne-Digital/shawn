import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
        <div className="rounded-lg bg-navy/10 p-2">
          <Icon className="h-4 w-4 text-navy" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-navy">{value}</div>
        {description && (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              "text-xs mt-2 font-medium",
              trend.value >= 0 ? "text-green-600" : "text-buffalo-red"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
