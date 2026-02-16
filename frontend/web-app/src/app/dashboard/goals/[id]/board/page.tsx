"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ListTodo } from "lucide-react";

export default function GoalBoardPage() {
    return (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]" intensity="low">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <ListTodo className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Kanban Board</h2>
            <p className="text-muted-foreground max-w-md">
                Visualize your workflow. Drag and drop tasks to update their status.
                Coming in the next update.
            </p>
        </GlassCard>
    );
}
