"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ChevronRight, Box } from "lucide-react";
import type { Goal } from "@/lib/types/pm";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface JourneyTrainProps {
    compartments?: Goal[];
    primaryGoalName?: string;
    primaryGoalId?: string;
}

export function JourneyTrain({ compartments = [], primaryGoalName, primaryGoalId }: JourneyTrainProps) {
    return (
        <div className="relative group">
            {/* Train Track Effect */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 rounded-full" />

            <div className="relative flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
                {/* Engine - Primary Goal */}
                <Link href={primaryGoalId ? `/dashboard/goals/${primaryGoalId}` : "#"}>
                    <Card className="flex-shrink-0 w-64 border-2 border-primary/50 bg-primary/10 backdrop-blur-xl relative overflow-hidden group/engine transition-all hover:scale-105">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/engine:opacity-40 transition-opacity">
                            <Box className="h-12 w-12" />
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">When Engine</span>
                            </div>
                            <h4 className="font-bold text-lg line-clamp-1">{primaryGoalName || "Unset Engine"}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Primary What (Goal)</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Connectors & Compartments */}
                {compartments.map((goal, index) => (
                    <div key={goal.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <ChevronRight className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <Link href={`/dashboard/goals/${goal.id}`}>
                            <Card className="flex-shrink-0 w-48 border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all hover:scale-105 active:scale-95">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-3.5 w-3.5 text-secondary" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">The What {index + 1}</span>
                                    </div>
                                    <h4 className="font-semibold text-sm line-clamp-1">{goal.name}</h4>
                                    <Badge variant="outline" className="mt-2 text-[10px] h-5 capitalize">
                                        {goal.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                ))}

                {/* Empty Carriage Slot (Visual) */}
                {compartments.length === 0 && (
                    <div className="flex items-center gap-4 opacity-50">
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <ChevronRight className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <div className="flex-shrink-0 w-48 h-28 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-4">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">No Extra Whats</p>
                            <span className="text-[8px] text-muted-foreground/50 text-center mt-1">Add objectives to this timeline to see them as carriages</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
