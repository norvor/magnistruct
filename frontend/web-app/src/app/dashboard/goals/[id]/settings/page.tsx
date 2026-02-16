"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Settings } from "lucide-react";

export default function GoalSettingsPage() {
    return (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]" intensity="low">
            <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Goal Settings</h2>
            <p className="text-muted-foreground max-w-md">
                Manage goal details, members, and integrations.
                coming in the next update.
            </p>
        </GlassCard>
    );
}
