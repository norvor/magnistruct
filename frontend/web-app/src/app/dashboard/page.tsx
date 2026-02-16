'use client';

import { WelcomeStats } from '@/components/dashboard/WelcomeStats';
import { HabitsWidget } from '@/components/dashboard/HabitsWidget';

import { UnionStation } from '@/components/dashboard/UnionStation';
import { GlassCard } from '@/components/ui/glass-card';

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto">
            {/* 1. Hero Section */}
            <WelcomeStats />

            {/* 2. Union Station Contextual Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* Main Content: Union Station (9/12) */}
                <div className="xl:col-span-9 space-y-8 min-w-0">
                    <UnionStation />
                </div>

                {/* Sidebar: Control Center (3/12) */}
                <div className="xl:col-span-3 space-y-6 shrink-0 xl:sticky xl:top-6">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="h-1 w-4 bg-primary rounded-full" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Control Center</h3>
                    </div>

                    {/* Habits */}
                    <div className="transform hover:scale-[1.01] transition-transform duration-300">
                        <HabitsWidget />
                    </div>



                    {/* Station Tip */}
                    <GlassCard intensity="low" className="p-4 border-dashed border-white/10">
                        <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                            Union Station anchors your existence to active Journeys. Connect Goals to Journeys to see them converge here.
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

