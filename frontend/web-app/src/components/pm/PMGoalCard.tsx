"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MoreVertical, Folder, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Goal } from "@/lib/types/pm";

interface PMGoalCardProps {
    goal: Goal;
}

export function PMGoalCard({ goal }: PMGoalCardProps) {
    const statusColors = {
        'active': 'bg-green-500/10 text-green-600 border-green-500/20',
        'planning': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        'paused': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'completed': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        'cancelled': 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    const progress = goal.stats?.total_count && goal.stats.total_count > 0
        ? Math.round((goal.stats.done_count / goal.stats.total_count) * 100)
        : 0;

    return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-md group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-primary/70" />
                            <Link
                                href={`/dashboard/goals/${goal.id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                                {goal.name}
                            </Link>
                        </div>
                        {goal.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {goal.description}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Goal</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.stats?.done_count || 0}/{goal.stats?.total_count || 0} actions</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {goal.target_end_date && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(goal.target_end_date).toLocaleDateString()}</span>
                            </div>
                        )}
                        {goal.lead_name && (
                            <div className="flex items-center gap-1" title={`Lead: ${goal.lead_name}`}>
                                <User className="h-3.5 w-3.5" />
                                <span className="max-w-[100px] truncate">{goal.lead_name}</span>
                            </div>
                        )}
                    </div>
                    <Badge variant="outline" className={statusColors[goal.status] || 'bg-gray-500/10'}>
                        {goal.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
