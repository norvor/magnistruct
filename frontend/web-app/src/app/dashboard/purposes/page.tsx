"use client";

import { usePurposes, useDeletePurpose } from "@/lib/hooks/useLife";
import { Button } from "@/components/ui/button";
import { Plus, Compass } from "lucide-react";
import { useState } from "react";
import { CreatePurposeModal } from "@/components/life/CreatePurposeModal";
import { PurposeFlashcard } from "@/components/life/PurposeFlashcard";
import { Purpose } from "@/lib/types/life";

export default function PurposesPage() {
    const { data: purposes, isLoading } = usePurposes();
    const deletePurpose = useDeletePurpose();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center">Loading...</div>;
    }

    const handleEdit = (purpose: Purpose) => {
        setEditingPurpose(purpose);
        setIsCreateOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this purpose?')) {
            deletePurpose.mutate(id);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) setEditingPurpose(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">Purposes: The Whys</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Your manifesto. The core values that guide you.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-6 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" /> Define New Why
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purposes?.map((purpose) => (
                    <PurposeFlashcard
                        key={purpose.id}
                        purpose={purpose}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}

                {(!purposes || purposes.length === 0) && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/40 rounded-xl bg-card/20">
                        <div className="h-16 w-16 bg-sky-500/10 rounded-full flex items-center justify-center mb-4">
                            <Compass className="h-8 w-8 text-sky-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Your Manifesto is Empty</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 mb-6">Define your core values, mission, and vision to guide your journey.</p>
                        <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                            Draft Your First Principle
                        </Button>
                    </div>
                )}
            </div>

            <CreatePurposeModal
                open={isCreateOpen}
                onOpenChange={handleOpenChange}
                purpose={editingPurpose}
            />
        </div>
    );
}
