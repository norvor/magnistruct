"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useWorkItems } from "@/lib/hooks/usePM";
import { format, addDays, startOfWeek, endOfWeek, differenceInDays, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Helper to get array of days
const getDaysArray = (start: Date, end: Date) => {
    const arr = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};

export function TimelineView() {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { data: workItems, isLoading } = useWorkItems(orgId);

    // Timeline Configuration
    const today = new Date();
    const startDate = startOfWeek(addDays(today, -14)); // Start 2 weeks ago
    const endDate = endOfWeek(addDays(today, 28)); // End 4 weeks from now

    // Generate dates
    const dates = useMemo(() => {
        const temp = new Date(startDate);
        const days = [];
        while (temp <= endDate) {
            days.push(new Date(temp));
            temp.setDate(temp.getDate() + 1);
        }
        return days;
    }, []);

    // Process actions for timeline
    const timelineActions = useMemo(() => {
        if (!workItems) return [];
        return workItems
            .filter(action => action.due_date || action.created_at) // Must have date
            .map(action => {
                // Heuristic: If no due date, assume 3 day duration from created_at
                // If due date, assume it starts 3 days before due date, or created_at if later
                let end = action.due_date ? new Date(action.due_date) : addDays(new Date(action.created_at), 3);
                let start = new Date(action.created_at);

                // Clamp visual start to make sure bar isn't too long if created long ago
                if (differenceInDays(end, start) > 14) {
                    start = addDays(end, -14);
                }

                // If start is after end, flip them
                if (start > end) {
                    const temp = start;
                    start = end;
                    end = temp;
                }

                return {
                    ...action,
                    start,
                    end,
                    duration: Math.max(1, differenceInDays(end, start) + 1)
                };
            })
            // Filter out actions purely outside range
            .filter(t => t.end >= startDate && t.start <= endDate)
            .sort((a, b) => a.start.getTime() - b.start.getTime());

    }, [workItems]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!timelineActions.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border/40 rounded-lg bg-muted/10 text-muted-foreground gap-2">
                <Calendar className="h-8 w-8 opacity-50" />
                <p>No scheduled actions found in this range.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-card/40 border border-border/40 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Header / Date Axis */}
            <div className="flex border-b border-border/40 bg-muted/30 overflow-x-auto hide-scrollbar">
                <div className="w-64 shrink-0 p-3 border-r border-border/40 font-semibold text-sm sticky left-0 bg-background/95 backdrop-blur z-20">
                    Action
                </div>
                <div className="flex">
                    {dates.map((date) => (
                        <div
                            key={date.toISOString()}
                            className={cn(
                                "w-12 shrink-0 p-2 text-center border-r border-border/20 text-xs flex flex-col items-center justify-center gap-1",
                                isSameDay(date, today) && "bg-primary/10"
                            )}
                        >
                            <span className="text-muted-foreground font-medium">{format(date, 'EEE')}</span>
                            <span className={cn(
                                "font-bold shadow-sm rounded-full w-6 h-6 flex items-center justify-center",
                                isSameDay(date, today) ? "bg-primary text-primary-foreground" : "text-foreground"
                            )}>
                                {format(date, 'd')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline Body */}
            <div className="flex-1 overflow-auto relative">
                <div className="flex flex-col min-w-max">
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex pointer-events-none pl-64">
                        {dates.map((date) => (
                            <div
                                key={`grid-${date.toISOString()}`}
                                className={cn(
                                    "w-12 shrink-0 border-r border-border/10 h-full",
                                    isSameDay(date, today) && "bg-primary/5"
                                )}
                            />
                        ))}
                    </div>

                    {/* Action Rows */}
                    {timelineActions.map((action) => {
                        // Calculate offset
                        const offsetDays = differenceInDays(action.start, startDate);
                        const offsetPx = offsetDays * 48; // 48px is w-12
                        const widthPx = action.duration * 48;

                        return (
                            <div key={action.id} className="flex border-b border-border/20 group hover:bg-muted/10 transition-colors relative z-10">
                                {/* Action Info Column */}
                                <div className="w-64 shrink-0 p-3 border-r border-border/40 bg-background/50 sticky left-0 z-20 flex items-center justify-between gap-2 overflow-hidden">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Badge variant="outline" className={cn(
                                            "w-2 h-2 p-0 rounded-full border-0 shrink-0",
                                            action.priority === 'critical' ? 'bg-red-500' :
                                                action.priority === 'high' ? 'bg-orange-500' :
                                                    action.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                        )} />
                                        <Link href={`/dashboard/actions/${action.id}`} className="truncate text-sm font-medium hover:text-primary transition-colors">
                                            {action.title}
                                        </Link>
                                    </div>
                                    <UserAvatar user={{ name: action.assignee_name || "?" }} size="sm" />
                                </div>

                                {/* Timeline Bar */}
                                <div className="flex py-3 px-0 relative w-full h-12 items-center">
                                    <div
                                        className="h-7 rounded-md bg-primary/80 hover:bg-primary border border-primary-foreground/20 shadow-sm relative group/bar cursor-pointer transition-all hover:scale-[1.01]"
                                        style={{
                                            marginLeft: `${Math.max(0, offsetPx)}px`, // Clamp negative offsets
                                            width: `${Math.max(48, widthPx)}px`
                                        }}
                                        title={`${action.title} (${action.status})`}
                                    >
                                        <div className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-primary-foreground/90 whitespace-nowrap overflow-hidden">
                                            {action.title}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
