"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ActionCard } from "./ActionCard";
import { Badge } from "@/components/ui/badge";

interface ActionColumnProps {
    id: string;
    title: string;
    actions: any[];
    color?: string;
}

export function ActionColumn({ id, title, actions, color }: ActionColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        // Increased width from 320px to 350px
        <div className="flex flex-col w-[350px] shrink-0 h-full">
            {/* Column Header */}
            <div className={`flex items-center justify-between p-4 mb-4 rounded-xl border backdrop-blur-sm ${color || 'bg-card/40 border-border/40'}`}>
                <h3 className="font-bold text-sm tracking-wide uppercase">{title}</h3>
                <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono text-xs hover:bg-muted/80 min-w-[1.5rem] h-6 flex items-center justify-center p-0 rounded-full">
                    {actions.length}
                </Badge>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                // Increased gap between cards from 3 (12px) to 4 (16px)
                className="flex-1 flex flex-col gap-4 overflow-y-auto px-1 pb-20 mask-gradient-b"
            >
                <SortableContext
                    id={id}
                    items={actions.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {actions.map((action) => (
                        <ActionCard key={action.id} action={action} />
                    ))}
                </SortableContext>

                {/* Empty State / Drop Target Hint */}
                {actions.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-border/20 rounded-2xl flex items-center justify-center text-muted-foreground/30 text-sm font-medium">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
