"use client";

import { useWorkItems } from "@/lib/hooks/usePM";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingActionsWidget() {
    const user = useSelector((state: any) => state.auth.user);
    // Fetch only first 5 not-done actions
    const { data: workItems, isLoading } = useWorkItems({ status: 'todo' }); // Corrected filter

    // Client-side slice if API doesn't support limit yet
    const actions = workItems?.slice(0, 6) || [];

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    return (
        <Card className="h-full border-border/50 bg-background/60 backdrop-blur-xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-violet-500" />
                    My Hows (Actions)
                </CardTitle>
                <Link href="/dashboard/actions">
                    <Button variant="ghost" size="sm" className="text-xs">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-3">
                    {actions.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            No pending Hows! 🎉
                        </div>
                    ) : (
                        actions.map((action) => (
                            <div
                                key={action.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-accent/40 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {action.title}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>#{action.id.substring(0, 4)}</span>
                                            <span>•</span>
                                            <span className={action.priority === 'critical' ? 'text-red-500 font-medium' : ''}>
                                                {action.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={action.status} className="shrink-0 text-[10px]" />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
