"use client";

import { useAuditLogs } from "@/lib/hooks/useAwareness";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { History, FileClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogSectionProps {
    orgId: string;
    entityType: string;
    entityId: string;
}

export function AuditLogSection({ orgId, entityType, entityId }: AuditLogSectionProps) {
    const { data: logs, isLoading } = useAuditLogs(orgId, entityType, entityId);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground font-semibold">
                <History className="h-4 w-4" />
                <h3>History</h3>
            </div>

            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border/50" />

                {logs?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                        <FileClock className="h-8 w-8 opacity-20" />
                        <span className="text-xs italic">No history available</span>
                    </div>
                ) : (
                    logs?.map((log) => (
                        <div key={log.id} className="relative pl-6 flex flex-col gap-1 text-sm group">
                            <div className="absolute left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground ring-4 ring-background group-hover:bg-primary transition-colors" />

                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{log.user_name || "System"}</span>
                                <span className="text-muted-foreground">
                                    {formatAction(log.action)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                                    {formatDistanceToNow(new Date(log.performed_at), { addSuffix: true })}
                                </span>
                            </div>

                            {/* Changes Diff visualization */}
                            {log.changes && Object.keys(log.changes).length > 0 && (
                                <div className="mt-1 bg-muted/30 rounded-md p-2 text-xs font-mono border border-border/30">
                                    {Object.entries(log.changes).map(([field, diff]: [string, any]) => (
                                        <div key={field} className="flex gap-1 overflow-hidden">
                                            <span className="text-muted-foreground">{field}:</span>
                                            <span className="truncate">
                                                <span className="text-red-500 line-through opacity-70 mr-1">{diff.old}</span>
                                                <span className="text-green-500 import { ArrowRight } from 'lucide-react';  ">→ {diff.new}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatAction(action: string) {
    switch (action) {
        case 'create': return 'created this item';
        case 'update': return 'updated';
        case 'delete': return 'deleted';
        default: return action.replace(/_/g, ' ');
    }
}
