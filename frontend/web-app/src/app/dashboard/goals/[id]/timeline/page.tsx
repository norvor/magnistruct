"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { CalendarRange } from "lucide-react";

export default function GoalTimelinePage() {
    return (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]" intensity="low">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <CalendarRange className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Timeline View</h2>
            <p className="text-muted-foreground max-w-md">
                Plan your roadmap with a Gantt chart view. Track dependencies and milestones.
                Coming in the next update.
            </p>
        </GlassCard>
    );
}
