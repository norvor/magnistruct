"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

interface ActionCardProps {
    action: any;
}

export function ActionCard({ action }: ActionCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: action.id,
        data: {
            type: "Action",
            action,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-40 h-[120px] rounded-2xl border-2 border-primary/50 bg-card/50"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group">
            <GlassCard
                intensity="low"
                variant="hover"
                className="p-4 flex flex-col cursor-grab active:cursor-grabbing border-border/40 hover:border-primary/20 transition-all min-h-[80px] justify-center"
            >
                <Link href={`/dashboard/actions/${action.id}`} className="block">
                    <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                        {action.title}
                    </h4>
                </Link>
                <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-tighter">
                        #{action.id.slice(0, 4)}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${action.status === 'done' ? 'bg-emerald-500/50' :
                        action.status === 'in_progress' ? 'bg-blue-500/50' : 'bg-slate-500/50'
                        }`} />
                </div>
            </GlassCard>
        </div>
    );
}
