"use client";

import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "hover" | "active";
    intensity?: "low" | "medium" | "high";
}

export function GlassCard({
    children,
    className,
    variant = "default",
    intensity = "medium",
    ...props
}: GlassCardProps) {

    const intensityMap = {
        low: "bg-card/40 border-border/40",
        medium: "bg-card/60 border-border/50",
        high: "bg-card/80 border-border/60"
    };

    const variants = {
        default: {
            y: 0,
            scale: 1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        },
        hover: {
            y: -4,
            scale: 1.01,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            borderColor: "var(--primary)"
        },
        active: {
            scale: 0.98,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }
    };

    return (
        <motion.div
            className={cn(
                "backdrop-blur-xl rounded-2xl border transition-all relative overflow-hidden text-card-foreground",
                intensityMap[intensity],
                className
            )}
            initial="default"
            whileHover={variant === "hover" ? "hover" : undefined}
            whileTap={variant === "hover" ? "active" : undefined}
            variants={variants}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            {...props}
        >
            {/* Dynamic atmosphere overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
