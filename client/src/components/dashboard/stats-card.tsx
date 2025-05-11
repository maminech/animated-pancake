import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  subtitle,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-standard shadow p-6", className)}>
      <div className="flex items-center">
        <div className={cn("flex-shrink-0 p-3 rounded-full", iconBgColor)}>
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            {subtitle && (
              <span className="ml-2 text-sm text-secondary">{subtitle}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
