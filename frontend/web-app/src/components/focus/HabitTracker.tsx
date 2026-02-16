'use client';

import { useState } from 'react';
import { useHabits, useToggleHabit, useDeleteHabit } from '@/lib/hooks/useHabits';
import { CreateHabitModal } from './modals/CreateHabitModal';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
    Plus,
    Check,
    Flame,
    MoreHorizontal,
    Trash2,
    Calendar,
    Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export function HabitTracker() {
    const { data: habits, isLoading } = useHabits();
    const { mutate: toggleHabit } = useToggleHabit();
    const { mutate: deleteHabit } = useDeleteHabit();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Plant Component
    // Since I cannot import a new file I just created in the same step easily without ensuring it exists, 
    // I will inline the concept or assume the file assumes it.
    // Wait, I created GrowingPlant.tsx in the previous step. So I can import it.
    // IMPT: I need to add the import statement at the top.

    // Let's rewrite the whole file to be safe and clean.
    return (
        <HabitTrackerContent
            habits={habits}
            isLoading={isLoading}
            toggleHabit={toggleHabit}
            deleteHabit={deleteHabit}
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
        />
    );
}

import { GrowingPlant } from './GrowingPlant';

function HabitTrackerContent({ habits, isLoading, toggleHabit, deleteHabit, isCreateOpen, setIsCreateOpen }: any) {
    if (isLoading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>;
    }

    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Garden</h2>
                    <p className="text-muted-foreground text-sm">Water your habits to help them grow.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4" />
                    New Seed
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                {habits?.map((habit: any) => (
                    <div
                        key={habit.id}
                        className={cn(
                            "group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-500",
                            habit.is_completed_today
                                ? "bg-emerald-900/10 border-emerald-500/30"
                                : "bg-black/20 border-white/5 hover:border-white/10"
                        )}
                    >
                        {/* Left: Plant & Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 flex-shrink-0 bg-white/5 rounded-xl flex items-center justify-center">
                                <GrowingPlant
                                    stage={habit.current_streak}
                                    isWatered={habit.is_completed_today}
                                />
                            </div>

                            <div className="flex flex-col">
                                <span className={cn(
                                    "font-semibold text-lg transition-colors",
                                    habit.is_completed_today ? "text-emerald-400" : "text-foreground"
                                )}>
                                    {habit.title}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Flame className={cn("w-3 h-3", habit.current_streak > 0 && "text-orange-400 fill-orange-400")} />
                                        {habit.current_streak} days
                                    </span>
                                    {habit.current_streak >= 7 && (
                                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            Blooming
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => toggleHabit({ id: habit.id, date: dateStr })}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-10 px-4 rounded-xl border transition-all duration-300 gap-2",
                                    habit.is_completed_today
                                        ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:text-white"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                )}
                            >
                                {habit.is_completed_today ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Watered</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                        <span>Water</span>
                                    </>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                                    <DropdownMenuItem onClick={() => deleteHabit(habit.id)} className="text-red-400 focus:text-red-400 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Prune (Delete)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}

                {habits?.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                        <p>No seeds planted yet.</p>
                        <Button onClick={() => setIsCreateOpen(true)} variant="link" className="text-emerald-400">
                            Plant a seed
                        </Button>
                    </div>
                )}
            </div>

            <CreateHabitModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    );
}

function habitStats(habits: any[] | undefined) {
    if (!habits) return { totalStreak: 0 };
    const totalStreak = habits.reduce((acc, h) => acc + h.current_streak, 0);
    return { totalStreak };
}
