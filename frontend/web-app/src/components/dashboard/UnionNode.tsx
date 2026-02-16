"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UnionNodeProps {
    id?: string;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    href?: string;
    color?: string;
    className?: string;
    isActive?: boolean;
}

export function UnionNode({
    title,
    subtitle,
    icon: Icon,
    href,
    color = "primary",
    className,
    isActive = false
}: UnionNodeProps) {
    const NodeContent = (
        <GlassCard
            intensity="low"
            variant="hover"
            className={cn(
                "p-3 flex items-center gap-3 transition-all duration-300 border-white/5",
                isActive ? "border-primary/40 bg-primary/10" : "hover:border-primary/20",
                className
            )}
        >
            <div className={cn(
                "p-2 rounded-xl shrink-0 transition-colors",
                `bg-${color}/10 text-${color}`,
                isActive && `bg-${color}/20`
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                    {title}
                </h4>
                {subtitle && (
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold mt-0.5 opacity-60">
                        {subtitle}
                    </p>
                )}
            </div>
        </GlassCard>
    );

    if (href) {
        return (
            <Link href={href} className="block group">
                {NodeContent}
            </Link>
        );
    }

    return NodeContent;
}
