"use client";

import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, ListTodo, CalendarRange, Settings } from "lucide-react";
import Link from "next/link";
import { useGoal } from "@/lib/hooks/usePM";

export default function GoalDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const id = params?.id as string;
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";

    const { data: goal, isLoading } = useGoal(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h2 className="text-xl font-semibold">Goal not found</h2>
                <Link href="/dashboard/goals">
                    <Button variant="outline">Back to Goals: The Whats</Button>
                </Link>
            </div>
        );
    }

    const navItems = [
        { label: "Overview", icon: LayoutDashboard, href: `/dashboard/goals/${id}`, color: "text-blue-400 bg-blue-500/10", desc: "Stats & Summary", exact: true },
        { label: "Board", icon: ListTodo, href: `/dashboard/goals/${id}/board`, color: "text-emerald-400 bg-emerald-500/10", desc: "Kanban View" },
        { label: "Timeline", icon: CalendarRange, href: `/dashboard/goals/${id}/timeline`, color: "text-purple-400 bg-purple-500/10", desc: "Roadmap" },
        { label: "Settings", icon: Settings, href: `/dashboard/goals/${id}/settings`, color: "text-gray-400 bg-gray-500/10", desc: "Config" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Minimalist Header */}
            <div className="flex flex-col gap-6">
                <Link href="/dashboard/goals" className="w-fit">
                    <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Goals
                    </Button>
                </Link>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">
                        {goal.name}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
                        {goal.description}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-4">
                {children}
            </div>
        </div>
    );
}
