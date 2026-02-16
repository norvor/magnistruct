"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useWorkItems } from "@/lib/hooks/usePM";

import { ActionKanban } from "@/components/pm/ActionKanban";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { ActionsTable } from "@/components/pm/ActionsTable";
import { CreateActionModal } from "@/components/pm/modals/CreateActionModal";
import {
    Plus,
    Search,
    Columns,
    ListFilter,
} from "lucide-react";

export default function ActionsPage() {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { data: workItems, isLoading } = useWorkItems(orgId);
    const [viewMode, setViewMode] = useState<"list" | "board" | "timeline">("board");
    const [searchQuery, setSearchQuery] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredItems = workItems?.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">The Hows</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Your simple list of tasks and actions.</p>
                </div>
                <Button className="gap-2 px-6" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    New Task
                </Button>
            </div>
            {/* Toolbar */}
            <GlassCard className="p-2 flex items-center justify-between gap-4 shrink-0 z-20" intensity="high">

                <div className="flex bg-muted/50 rounded-xl p-1 ml-auto mr-2">
                    <div className="relative flex items-center">
                        {/* Active Background Pill */}
                        <div
                            className={`absolute inset-y-0 w-1/2 bg-background rounded-lg shadow-sm transition-all duration-300 ease-out ${viewMode === "list" ? "translate-x-full" : "translate-x-0"
                                }`}
                        />

                        <button
                            onClick={() => setViewMode("board")}
                            className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors duration-300 ${viewMode === "board" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Columns className="w-4 h-4" />
                            <span className="text-sm font-medium">Board</span>
                        </button>

                        <button
                            onClick={() => setViewMode("list")}
                            className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors duration-300 ${viewMode === "list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <ListFilter className="w-4 h-4" />
                            <span className="text-sm font-medium">List</span>
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* Views Content */}
            <div className="flex-1 min-h-0 relative">
                {viewMode === "board" && (
                    <div className="h-full overflow-hidden">
                        <ActionKanban />
                    </div>
                )}

                {viewMode === "list" && (
                    <div className="h-full overflow-y-auto pr-2">
                        <GlassCard intensity="low" className="overflow-hidden">
                            <ActionsTable actions={filteredItems} />
                        </GlassCard>
                    </div>
                )}
            </div>

            <CreateActionModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />


        </div >
    );
}
