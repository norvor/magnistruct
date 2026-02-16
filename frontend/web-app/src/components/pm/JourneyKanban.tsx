"use client";

import { useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { useUpdateWorkItem } from "@/lib/hooks/usePM";
import type { Action } from "@/lib/types/pm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, CheckCircle, Eye, ListTodo } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COLUMNS = [
    { id: "todo", label: "To Do", icon: ListTodo, color: "text-gray-600", bgColor: "bg-gray-500/10" },
    { id: "in_progress", label: "In Progress", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
    { id: "review", label: "In Review", icon: Eye, color: "text-blue-600", bgColor: "bg-blue-500/10" },
    { id: "done", label: "Completed", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-500/10" },
] as const;

const priorityColors = {
    low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-600 border-red-500/20",
    critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface ActionCardProps {
    action: Action;
    isOverlay?: boolean;
}

function ActionCard({ action, isOverlay }: ActionCardProps) {
    return (
        <Card className={cn(
            "transition-all border-border/40 bg-card/80 backdrop-blur-sm",
            !isOverlay && "hover:shadow-md",
            isOverlay && "shadow-xl border-primary/20 scale-[1.02] cursor-grabbing"
        )}>
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm line-clamp-2 flex-1">{action.title}</p>
                    <Badge variant="outline" className={cn("text-xs shrink-0", priorityColors[action.priority as keyof typeof priorityColors])}>
                        {action.priority}
                    </Badge>
                </div>
                {action.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {action.description}
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs font-normal">
                        {action.type}
                    </Badge>
                    {action.assignee_id && (
                        <UserAvatar
                            user={{ name: action.assignee_name || "Unassigned" }}
                            size="sm"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function DraggableActionCard({ action }: { action: Action }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: action.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(isDragging && "opacity-0")}
            {...listeners}
            {...attributes}
        >
            <Link href={`/dashboard/actions/${action.id}`}>
                <ActionCard action={action} />
            </Link>
        </div>
    );
}

function DroppableColumn({ column, children, count }: {
    column: typeof COLUMNS[number],
    children: React.ReactNode,
    count: number
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const Icon = column.icon;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-80 flex flex-col rounded-xl transition-colors duration-200",
                isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : "bg-transparent"
            )}
        >
            <div className={cn(
                "flex items-center gap-2 mb-4 p-3 rounded-lg",
                column.bgColor
            )}>
                <Icon className={cn("h-4 w-4", column.color)} />
                <h3 className={cn("font-semibold text-sm", column.color)}>
                    {column.label}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                    {count}
                </Badge>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4 pb-4">
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
}

interface JourneyKanbanProps {
    actions: Action[];
    isLoading?: boolean;
}

export function JourneyKanban({ actions, isLoading }: JourneyKanbanProps) {
    const updateAction = useUpdateWorkItem();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const groupedActions = useMemo(() => {
        const groups: Record<string, Action[]> = {
            "todo": [],
            "in_progress": [],
            "review": [],
            "done": [],
        };

        actions.forEach((action) => {
            if (groups[action.status]) {
                groups[action.status].push(action);
            }
        });

        return groups;
    }, [actions]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const actionId = active.id as string;
        const newStatus = over.id as string;

        const action = actions.find((t) => t.id === actionId);

        if (action && action.status !== newStatus) {
            updateAction.mutate({
                id: actionId,
                data: { status: newStatus as any },
            });
        }

        setActiveId(null);
    };

    const activeAction = actions.find((t) => t.id === activeId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Clock className="h-8 w-8 animate-spin text-primary/40" />
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full overflow-x-auto min-h-[500px]">
                {COLUMNS.map((column) => {
                    const columnActions = groupedActions[column.id] || [];
                    return (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            count={columnActions.length}
                        >
                            {columnActions.map((action) => (
                                <DraggableActionCard key={action.id} action={action} />
                            ))}
                            {columnActions.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg border-border/40">
                                    No actions
                                </div>
                            )}
                        </DroppableColumn>
                    );
                })}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeAction && (
                    <div className="w-[304px]">
                        <ActionCard action={activeAction} isOverlay />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
