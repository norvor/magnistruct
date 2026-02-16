'use client';

import { HabitTracker } from '@/components/focus/HabitTracker';
import { GlassCard } from '@/components/ui/glass-card';

export default function FocusPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl">
            {/* Page Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent mb-2">
                    Focus & Habits
                </h1>
                <p className="text-muted-foreground">
                    Build consistency and track your daily routines.
                </p>
            </div>

            <HabitTracker />


        </div>
    );
}
