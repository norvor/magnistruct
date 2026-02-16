"use client";

import { useAuditLogs } from "@/lib/hooks/useAwareness";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AuditLog } from "@/lib/types/awareness";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AuditLogPage() {
    const orgId = "org-1"; // TODO: get from auth
    const { data: logs, isLoading } = useAuditLogs(orgId);

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "user_name",
            header: "User",
            cell: ({ row }) => {
                const user = {
                    name: row.original.user_name || "Unknown",
                    email: "", // We don't have email in AuditLog yet, maybe separate join
                };
                return (
                    <div className="flex items-center gap-2">
                        <UserAvatar user={user} size="sm" />
                        <span className="font-medium text-sm">{user.name}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const action = row.getValue("action") as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                if (action.includes("create")) variant = "default";
                if (action.includes("update")) variant = "secondary";
                if (action.includes("delete")) variant = "destructive";

                return <Badge variant={variant} className="capitalize">{action}</Badge>;
            },
        },
        {
            accessorKey: "entity_type",
            header: "Entity",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium capitalize">{row.original.entity_type}</span>
                    <span className="text-xs text-muted-foreground font-mono">#{row.original.entity_id.substring(0, 8)}</span>
                </div>
            ),
        },
        {
            accessorKey: "performed_at",
            header: "Time",
            cell: ({ row }) => {
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(row.getValue("performed_at")), { addSuffix: true })}
                    </span>
                );
            },
        },
        {
            id: "details",
            header: "Changes",
            cell: ({ row }) => {
                const changes = row.original.changes;
                if (!changes) return <span className="text-xs text-muted-foreground">-</span>;
                return (
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
                        {Object.keys(changes).length} fields changed
                    </code>
                );
            }
        }
    ];

    if (isLoading) {
        return <div className="p-8 text-center">Loading audit logs...</div>;
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                    <p className="text-muted-foreground">
                        Track all activities and changes across your organization.
                    </p>
                </div>
            </div>

            <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        <CardTitle>System Audit Trail</CardTitle>
                    </div>
                    <CardDescription>
                        View a chronological record of system events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={logs || []} searchKey="user_name" searchPlaceholder="Filter by user..." />
                </CardContent>
            </Card>
        </div>
    );
}
