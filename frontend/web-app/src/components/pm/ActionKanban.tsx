"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    closestCorners
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";

import { useWorkItems, useUpdateWorkItem, useJourneys } from "@/lib/hooks/usePM";
import { ActionColumn } from "./ActionColumn";
import { ActionCard } from "./ActionCard";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const COLUMNS = [
    { id: "todo", title: "To Do", color: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
    { id: "in_progress", title: "In Progress", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { id: "done", title: "Done", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
];

export function ActionKanban() {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { data: workItems, isLoading } = useWorkItems(orgId);
    const { mutate: updateWorkItem } = useUpdateWorkItem();

    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Group actions by status
    const actionsByColumn = useMemo(() => {
        const grouped: Record<string, any[]> = {
            todo: [],
            in_progress: [],
            done: []
        };

        if (workItems) {
            workItems.forEach((action) => {
                // Handle varied status strings (e.g. "todo" vs "ToDo")
                const normalizedStatus = action.status.toLowerCase().replace(" ", "_");
                if (grouped[normalizedStatus]) {
                    grouped[normalizedStatus].push(action);
                } else {
                    // Fallback for unknown statuses (like legacy 'review' or 'blocked') -> Todo
                    grouped['todo'].push(action);
                }
            });
        }

        return grouped;
    }, [workItems]);

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeAction = workItems?.find(t => t.id === active.id);
        const overId = over.id as string;

        // Check if dropped on a column (empty space) or another card
        let newStatus = overId;

        // If overId is an action ID, find that action's status
        const overAction = workItems?.find(t => t.id === overId);
        if (overAction) {
            newStatus = overAction.status;
        }

        // Normalize status
        newStatus = newStatus.toLowerCase().replace(" ", "_");

        if (activeAction && activeAction.status !== newStatus && COLUMNS.some(c => c.id === newStatus)) {
            updateWorkItem({
                id: activeAction.id,
                data: { status: newStatus }
            });
        }

        setActiveId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeAction = workItems?.find(t => t.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* Increased gap from 4 to 6 (24px) and added px-4 for side padding */}
            <div className="flex h-full gap-6 overflow-x-auto pb-4 px-4 hide-scrollbar">
                {COLUMNS.map((col) => (
                    <ActionColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        actions={actionsByColumn[col.id]}
                        color={col.color}
                    />
                ))}
                {/* Spacer for right padding */}
                <div className="w-1 shrink-0" />
            </div>

            <DragOverlay
                dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: "0.5",
                            },
                        },
                    }),
                }}
            >
                {activeAction ? <ActionCard action={activeAction} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
