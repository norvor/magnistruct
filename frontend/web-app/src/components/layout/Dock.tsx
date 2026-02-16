"use client";

import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Layers,
    Settings,
    Trophy,
    LayoutGrid,
    MessageSquare,
    Zap,
    BookOpen,
    ChevronDown,
    Heart,
    Compass,
    MapPin,
    CheckSquare,
} from "lucide-react";
import { DockItem } from "./DockItem";
import { MagnistructLogo } from "@/components/ui/MagnistructLogo";
import { useMotionValue, AnimatePresence, motion } from "framer-motion";
import { useState, useRef } from "react";

export function Dock() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mouseX = useMotionValue(Infinity);

    return (
        <AnimatePresence mode="wait">
            {!isCollapsed ? (
                <motion.div
                    key="expanded-dock"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-4"
                    onMouseMove={(e) => mouseX.set(e.pageX)}
                    onMouseLeave={() => mouseX.set(Infinity)}
                >
                    <div className="glass-dock rounded-[2.5rem] p-4 flex items-end gap-3 h-[110px] border-border/50 shadow-2xl bg-background/60 backdrop-blur-2xl px-6 supports-[backdrop-filter]:bg-background/20">

                        <DockItem
                            icon={<MagnistructLogo className="w-9 h-9" showBg={false} />}
                            label="Home"
                            isActive={pathname === "/dashboard"}
                            onClick={() => router.push("/dashboard")}
                            mouseX={mouseX}
                            color="#60A5FA" // Blue
                        />

                        <div className="w-[1px] h-10 bg-border/40 self-center mx-2" />

                        <DockItem
                            icon={<Trophy className="w-6 h-6" />}
                            label="The Whats"
                            isActive={pathname.startsWith("/dashboard/goals")}
                            onClick={() => router.push("/dashboard/goals")}
                            mouseX={mouseX}
                            color="#A855F7" // Purple
                        />

                        <DockItem
                            icon={<CheckSquare className="w-6 h-6" />}
                            label="The Hows"
                            isActive={pathname.startsWith("/dashboard/actions")}
                            onClick={() => router.push("/dashboard/actions")}
                            mouseX={mouseX}
                            color="#F97316" // Orange
                        />

                        <DockItem
                            icon={<Zap className="w-6 h-6" />}
                            label="The Whens"
                            isActive={pathname.startsWith("/dashboard/journeys")}
                            onClick={() => router.push("/dashboard/journeys")}
                            mouseX={mouseX}
                            color="#F59E0B" // Amber
                        />

                        <DockItem
                            icon={<Heart className="w-6 h-6" />}
                            label="The Whos"
                            isActive={pathname.startsWith("/dashboard/loves")}
                            onClick={() => router.push("/dashboard/loves")}
                            mouseX={mouseX}
                            color="#E11D48" // Rose
                        />

                        <DockItem
                            icon={<Compass className="w-6 h-6" />}
                            label="The Whys"
                            isActive={pathname.startsWith("/dashboard/purposes")}
                            onClick={() => router.push("/dashboard/purposes")}
                            mouseX={mouseX}
                            color="#4F46E5" // Indigo
                        />

                        <DockItem
                            icon={<MapPin className="w-6 h-6" />}
                            label="The Wheres"
                            isActive={pathname.startsWith("/dashboard/pins")}
                            onClick={() => router.push("/dashboard/pins")}
                            mouseX={mouseX}
                            color="#10B981" // Emerald
                        />

                        <div className="w-[1px] h-10 bg-white/10 self-center mx-2" />

                        <DockItem
                            icon={<Zap className="w-6 h-6" />}
                            label="Habits"
                            isActive={pathname.startsWith("/dashboard/habits")}
                            onClick={() => router.push("/dashboard/habits")}
                            mouseX={mouseX}
                            color="#10B981" // Emerald
                        />





                        <div className="w-[1px] h-10 bg-white/10 self-center mx-2" />

                        <DockItem
                            icon={<Settings className="w-6 h-6" />}
                            label="Settings"
                            isActive={pathname.startsWith("/dashboard/settings")}
                            onClick={() => router.push("/dashboard/settings")}
                            mouseX={mouseX}
                            color="#94A3B8" // Slate
                        />
                    </div>

                    {/* Minimize Button */}
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                        title="Minimize Dock"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    key="collapsed-orb"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    drag
                    dragMomentum={false}
                    className="fixed bottom-8 right-8 z-50 cursor-grab active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                >
                    <div
                        onClick={() => setIsCollapsed(false)}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="h-16 w-16 glass-card rounded-full flex items-center justify-center border-primary/20 shadow-2xl shadow-primary/20 hover:scale-110 transition-transform bg-background/80 backdrop-blur-3xl">
                            <MagnistructLogo className="w-10 h-10" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
