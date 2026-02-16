"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
    useMotionTemplate
} from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DockItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    mouseX?: any;
    color?: string;
}

export function DockItem({ icon, label, isActive, onClick, mouseX, color = "currentColor" }: DockItemProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // 1. Magnification Logic
    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [64, 100, 64]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 15 });

    // 2. 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [20, -20]), { stiffness: 150, damping: 15 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]), { stiffness: 150, damping: 15 });

    function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.button
                    ref={ref}
                    style={{ width, rotateX, rotateY, perspective: 1000 }}
                    onClick={onClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => setIsHovered(true)}
                    whileHover={{ y: -16, transition: { type: "spring", stiffness: 300, damping: 15 } }}
                    whileTap={{ scale: 0.85 }}
                    className={cn(
                        "relative aspect-square flex items-center justify-center rounded-2xl transition-[background-color] duration-500",
                        isActive
                            ? "bg-muted/40 border border-border/50 shadow-xl"
                            : "bg-transparent hover:bg-muted/30 border border-transparent hover:border-border/30",
                        "backdrop-blur-xl group overflow-visible"
                    )}
                >
                    {/* Module Color Glow Base */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-2xl"
                        style={{ backgroundColor: color }}
                    />

                    {/* Living Icon Inner */}
                    <motion.div
                        className="relative z-10 w-9 h-9 flex items-center justify-center pointer-events-none"
                        animate={isActive ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                        <div
                            style={{ color: isHovered || isActive ? color : undefined }}
                            className={cn(
                                "transition-all duration-500 group-hover:scale-110 drop-shadow-md",
                                !isActive && !isHovered && "text-muted-foreground"
                            )}
                        >
                            {icon}
                        </div>
                    </motion.div>

                    {/* Active indicator dot */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                layoutId="active-dot"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Premium Shine Layer */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-foreground/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Glass Rim Light */}
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
            </TooltipTrigger>

            <TooltipContent
                sideOffset={30}
                className="bg-popover/90 backdrop-blur-3xl border border-border/50 text-popover-foreground font-bold tracking-widest px-4 py-2 rounded-2xl animate-scale-in shadow-xl"
            >
                <p className="text-[10px] uppercase">{label}</p>
            </TooltipContent>
        </Tooltip >
    );
}
