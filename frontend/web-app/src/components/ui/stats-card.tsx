import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number; // percentage
        direction: "up" | "down" | "neutral";
        label?: string; // e.g. "vs last month"
    };
    icon?: React.ElementType;
    className?: string;
}

export function StatsCard({ title, value, description, trend, icon: Icon, className }: StatsCardProps) {
    return (
        <Card className={cn("backdrop-blur-xl bg-card/40 border-border/40 shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {trend && (
                        <div className={cn(
                            "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                            trend.direction === 'up' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                trend.direction === 'down' ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                    "bg-muted text-muted-foreground"
                        )}>
                            {trend.direction === 'up' && <ArrowUpRight className="mr-1 h-3 w-3" />}
                            {trend.direction === 'down' && <ArrowDownRight className="mr-1 h-3 w-3" />}
                            {trend.direction === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
                            {trend.value}%
                        </div>
                    )}
                </div>
                {(description || trend?.label) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend?.label ? `${trend.label} ` : ''}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
