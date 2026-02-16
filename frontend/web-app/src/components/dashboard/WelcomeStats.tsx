"use client";

import { Card } from "@/components/ui/card";
import { Zap, BookOpen, FolderKanban, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const modules = [
    {
        name: "Habits",
        href: "/dashboard/habits",
        icon: Zap,
        color: "from-emerald-400 to-cyan-500",
        shadow: "shadow-emerald-500/20",
        desc: "Daily Routines",
    },

    {
        name: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
        color: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/20",
        desc: "Active Work",
    },
];

export function WelcomeStats() {
    const user = useSelector((state: RootState) => state.auth.user);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{user?.fullName || 'User'}</span>
                    </h1>
                    <p className="text-muted-foreground">Welcome to your life's union station</p>
                </div>

                {/* Quick Module Actions */}
                <div className="flex gap-2">
                    {modules.map((mod) => (
                        <Link key={mod.name} href={mod.href}>
                            <div
                                className="group flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/50 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                title={mod.name}
                            >
                                <mod.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
