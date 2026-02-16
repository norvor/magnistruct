'use client';

import { useGoals } from '@/lib/hooks/usePM';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';
import { GoalCard } from '@/components/pm/GoalCard';
import Link from 'next/link';

import { useSelector } from 'react-redux';
import { Goal } from '@/lib/types/pm';

export function GoalsWidget() {
    const user = useSelector((state: any) => state.auth.user);
    const { data: goals, isLoading } = useGoals();
    const activeGoals = (goals as Goal[]) || [];

    if (isLoading) return <div className="h-64 animate-pulse bg-muted/50 rounded-2xl" />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Active Whats (Goals)
                </h3>
                <Link href="/dashboard/goals">
                    <Button variant="ghost" size="sm" className="text-xs group">
                        View All <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </div>

            {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeGoals.slice(0, 3).map((goal: Goal) => {
                        // Adapt ProjectResponse to ProjectCardProps (simplified)
                        // Note: ProjectCard expects slightly different props, ideally we'd sanitize this or reuse a type.
                        // Mapping for now based on known ProjectCard props.
                        const cardProps = {
                            id: goal.id,
                            name: goal.name,
                            description: goal.description,
                            progress: (goal.stats?.done_count || 0) / (goal.stats?.total_count || 1) * 100 || 0,
                            totalActions: goal.stats?.total_count || 0,
                            completedActions: goal.stats?.done_count || 0,
                            dueDate: goal.target_end_date ? new Date(goal.target_end_date).toLocaleDateString() : undefined,
                            status: goal.status as any,
                            lead_name: goal.lead_name,
                            cover_image: goal.cover_image,
                            category: goal.category,
                            steps: goal.steps,
                        };
                        return <GoalCard key={goal.id} goal={cardProps} />;
                    })}
                </div>
            ) : (
                <Card className="border-dashed border-border/60 bg-transparent p-8 text-center text-muted-foreground">
                    <p>No active goals.</p>
                    <Link href="/dashboard/goals">
                        <Button variant="link" className="text-primary">Create one</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
