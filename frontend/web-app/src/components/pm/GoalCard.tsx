import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CheckCircle2, Circle, ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { GoalPlant } from "./GoalPlant";
import { GlassCard } from "@/components/ui/glass-card";

interface GoalStep {
    id: string;
    title: string;
    is_done: boolean;
}

interface GoalCardProps {
    goal: {
        id: string;
        name: string;
        description?: string;
        progress: number;
        totalActions: number;
        completedActions: number;
        dueDate?: string;
        status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled' | 'on-hold';
        lead_name?: string;
        cover_image?: string;
        category?: string;
        steps?: GoalStep[];
    };
    onToggleStep?: (stepId: string, isDone: boolean) => void;
}

export function GoalCard({ goal, onToggleStep }: GoalCardProps) {
    const statusColors: Record<string, string> = {
        'planning': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'active': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        'paused': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    const total = goal.totalActions || 0;
    const done = goal.completedActions || 0;
    const completedSteps = total > 0 ? Math.min(Math.floor((done / total) * 5), 5) : 0;

    return (
        <Link href={`/dashboard/goals/${goal.id}`} className="block h-full group">
            <GlassCard variant="hover" className="h-full flex flex-col overflow-hidden border-border/10" intensity="medium">
                {/* Header Area with Plant */}
                <div className="h-40 w-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 relative overflow-hidden flex items-center justify-center pt-4">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                    <div className="scale-110 transition-transform duration-500 group-hover:scale-125">
                        <GoalPlant stage={completedSteps} />
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1 gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">{goal.name}</h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {goal.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {goal.description}
                            </p>
                        )}
                    </div>

                    {/* Achievement Plan Summary */}
                    {goal.steps && goal.steps.length > 0 && (
                        <div className="space-y-2 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Achievement Plan</div>
                            <div className="space-y-1.5">
                                {goal.steps.slice(0, 3).map((step) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-2 ${onToggleStep ? 'cursor-pointer hover:opacity-80' : ''}`}
                                        onClick={(e) => {
                                            if (onToggleStep) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onToggleStep(step.id, !step.is_done);
                                            }
                                        }}
                                    >
                                        {step.is_done ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        )}
                                        <span className={`text-[11px] truncate ${step.is_done ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                                {goal.steps.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-5.5 italic">
                                        + {goal.steps.length - 3} more steps
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/10">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="w-3.5 h-3.5" />
                            <span>OBJECTIVE</span>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            Stage {completedSteps}/5
                        </div>
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
