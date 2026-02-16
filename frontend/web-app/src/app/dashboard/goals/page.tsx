"use client";

import { useSelector } from "react-redux";
import { useGoals } from "@/lib/hooks/usePM";
import { CreateGoalModal } from "@/components/pm/modals/CreateGoalModal";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    LayoutGrid,
    List,
    MoreHorizontal,
    Plus,
    Search,
    Trees,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { GoalPlant } from "@/components/pm/GoalPlant";
import { GoalCard } from "@/components/pm/GoalCard";
import { useUpdateGoalStep } from "@/lib/hooks/usePM";
import confetti from "canvas-confetti";

export default function GoalsPage() {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { data: goals, isLoading } = useGoals();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list" | "orchard">("orchard");
    const updateStep = useUpdateGoalStep();

    const handleToggleStep = async (stepId: string, isDone: boolean) => {
        await updateStep.mutateAsync({ stepId, data: { is_done: isDone } });
        if (isDone) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
    };

    const filteredGoals = goals?.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const statusColors: Record<string, string> = {
        'planning': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'active': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        'paused': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Goals: The Whats</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Your high-level objectives and outcomes.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                    <Plus className="mr-2 h-5 w-5" />
                    New Goal
                </Button>
            </div>

            {/* Toolbar */}
            <GlassCard className="p-2 flex items-center justify-between gap-4 sticky top-4 z-20" intensity="high">
                <div className="relative flex-1 max-w-md ml-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search objectives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/50 border-border/50 focus:bg-background/80 transition-colors rounded-xl"
                    />
                </div>
                <div className="flex bg-muted/50 rounded-xl p-1 mr-2">
                    <button
                        onClick={() => setViewMode("orchard")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "orchard" ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="Orchard View"
                    >
                        <Trees className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </GlassCard>

            {/* Orchard View */}
            {viewMode === "orchard" && (
                <div className="relative py-12 px-4 rounded-[2rem] overflow-hidden border border-border/30 bg-gradient-to-b from-emerald-500/[0.05] to-transparent">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 relative z-10">
                        {filteredGoals.map((goal, idx) => (
                            <Link
                                key={goal.id}
                                href={`/dashboard/goals/${goal.id}`}
                                className={`group flex flex-col items-center gap-6 transition-all duration-700 hover:scale-105 ${idx % 2 === 0 ? 'translate-y-6' : '-translate-y-6'
                                    }`}
                            >
                                <div className="relative">
                                    {/* Atmospheric Glow */}
                                    <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative z-10 p-10 rounded-full bg-card/10 backdrop-blur-xl border border-border/20 group-hover:border-emerald-500/30 transition-all duration-500 shadow-2xl group-hover:shadow-emerald-500/10">
                                        <div className="scale-125">
                                            {(() => {
                                                const total = goal.stats?.total_count || 0;
                                                const done = goal.stats?.done_count || 0;
                                                const stage = total > 0 ? Math.min(Math.floor((done / total) * 5), 5) : 0;
                                                return <GoalPlant stage={stage} />;
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center space-y-2 max-w-[120px]">
                                    <h3 className="font-bold text-sm leading-tight text-foreground group-hover:text-emerald-500 transition-colors">
                                        {goal.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-1.5 pt-1">
                                        {[...Array(5)].map((_, i) => {
                                            const total = goal.stats?.total_count || 0;
                                            const done = goal.stats?.done_count || 0;
                                            const stage = total > 0 ? Math.min(Math.floor((done / total) * 5), 5) : 0;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i < stage
                                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                                        : 'bg-muted'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Add Seed Placeholder */}
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex flex-col items-center justify-center gap-6 group p-10 rounded-full border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/[0.05] transition-all duration-500 text-muted-foreground hover:text-primary min-h-[160px]"
                        >
                            <div className="p-5 rounded-full bg-muted/50 group-hover:bg-primary/20 transition-colors duration-500">
                                <Plus className="h-8 w-8" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Seed Plant</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGoals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={{
                                ...goal,
                                progress: (goal.stats?.done_count || 0) / (goal.stats?.total_count || 1) * 100,
                                totalActions: goal.stats?.total_count || 0,
                                completedActions: goal.stats?.done_count || 0,
                                dueDate: goal.target_end_date,
                                status: goal.status as any
                            }}
                            onToggleStep={handleToggleStep}
                        />
                    ))}
                </div>
            )}
            {/* List View */}
            {viewMode === "list" && (
                <div className="flex flex-col gap-3">
                    {filteredGoals.map((goal) => (
                        <Link key={goal.id} href={`/dashboard/goals/${goal.id}`} className="block">
                            <GlassCard variant="hover" className="p-4 flex items-center justify-between group cursor-pointer" intensity="low">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 text-emerald-500">
                                        {goal.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{goal.name}</h3>
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                            OBJECTIVE
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            )}

            <CreateGoalModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />
        </div>
    );
}
