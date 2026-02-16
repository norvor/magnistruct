"use client";

import { cn } from "@/lib/utils";
import {
    Target,
    RefreshCcw,
    Briefcase,
    CheckSquare,
    Users,
    FolderKanban,

    Activity,
    X,
    FileText,
    Server
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigationGroups = [
    {
        title: "Productivity",
        items: [
            { label: "Tasks", icon: <CheckSquare className="w-5 h-5" />, href: "/dashboard/pm/work-items", desc: "To-do List", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Projects", icon: <FolderKanban className="w-5 h-5" />, href: "/dashboard/pm/projects", desc: "My Work", color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Sprints", icon: <RefreshCcw className="w-5 h-5" />, href: "/dashboard/pm/cycles", desc: "Cycles", color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Goals", icon: <Target className="w-5 h-5" />, href: "/dashboard/pm/goals", desc: "Long-term", color: "text-rose-400", bg: "bg-rose-500/10" },
        ]
    },
    {
        title: "Life OS",
        items: [
            { label: "Journal", icon: <FileText className="w-5 h-5" />, href: "/dashboard/interaction", desc: "Notes & Thoughts", color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Habits", icon: <Activity className="w-5 h-5" />, href: "/dashboard/focus", desc: "Daily Routine", color: "text-violet-400", bg: "bg-violet-500/10" },

        ]
    },
];

export function CommandDrawer({ isOpen, onClose }: CommandDrawerProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[95vw] origin-bottom animate-scale-in">
                <div className="glass-dock rounded-[2rem] p-8 flex flex-col gap-6 relative border-white/20 shadow-[0_32px_128px_rgba(0,0,0,0.8)]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <span className="text-lg font-bold tracking-tight text-white/90">Quick Navigation</span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all border border-white/5"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                        {navigationGroups.map((group) => (
                            <div key={group.title} className="flex flex-col gap-3">
                                <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest px-1">{group.title}</span>
                                <div className="flex flex-col gap-1.5">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => {
                                                router.push(item.href);
                                                onClose();
                                            }}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group text-left active:scale-[0.98]"
                                        >
                                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shrink-0", item.bg, item.color)}>
                                                {item.icon}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.label}</span>
                                                <span className="text-[10px] text-muted-foreground/60 font-medium truncate">{item.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Triangle Pointer */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rotate-45 bg-[#0a0a0f] border-r border-b border-white/20" />
            </div>
        </>
    );
}
