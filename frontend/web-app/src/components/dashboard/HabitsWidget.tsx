'use client';

import { useHabits, useToggleHabit } from '@/lib/hooks/useHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

export function HabitsWidget() {
    const { data: habits, isLoading } = useHabits();
    const { mutate: toggleHabit } = useToggleHabit();

    const today = format(new Date(), 'yyyy-MM-dd');
    const incompleteHabits = habits?.filter(h => !h.is_completed_today) || [];

    if (isLoading) return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl" />;

    return (
        <Card className="h-[300px] border-border/40 bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-all group overflow-hidden relative flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Zap className="w-24 h-24" />
            </div>

            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Today's Focus
                </CardTitle>
                <Link href="/dashboard/habits">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary">
                        View All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                {incompleteHabits.length === 0 && habits && habits.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium">All habits completed!</p>
                        <p className="text-xs text-muted-foreground">Keep up the streak 🔥</p>
                    </div>
                ) : incompleteHabits.length > 0 ? (
                    incompleteHabits.slice(0, 3).map(habit => (
                        <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group/item">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 rounded-full hover:bg-emerald-500/20 hover:text-emerald-400 p-0"
                                    onClick={() => toggleHabit({ id: habit.id, date: today })}
                                >
                                    <Circle className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium truncate max-w-[150px]">{habit.title}</span>
                            </div>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-muted-foreground", habit.color?.replace('text-', 'text-'))}>
                                {habit.current_streak}🔥
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No habits set.
                        <br />
                        <Link href="/dashboard/habits" className="text-primary hover:underline">Start building routines</Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
