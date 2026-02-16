"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PMStatsProps {
    stats: {
        label: string;
        value: string | number;
        change?: string;
        changeType?: 'increase' | 'decrease';
        icon: LucideIcon;
        color: string;
        bgColor: string;
    }[];
}

export function PMStats({ stats }: PMStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/40 bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            {stat.change && (
                                <span className={cn(
                                    "text-xs font-medium",
                                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-bold tracking-tight">
                                {stat.value}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
