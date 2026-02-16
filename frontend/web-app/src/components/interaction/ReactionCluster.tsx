"use client";

import { useReactions, useAddReaction, useRemoveReaction, useReactionSummary } from "@/lib/hooks/useInteraction";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { ReactionSummary } from "@/lib/types/interaction";

interface ReactionClusterProps {
    entityType: string;
    entityId: string;
}

export function ReactionCluster({ entityType, entityId }: ReactionClusterProps) {
    const user = useSelector((state: any) => state.auth.user);
    const { data: summary } = useReactionSummary(entityType, entityId);
    const { data: myReactions } = useReactions(entityType, entityId);

    const addReaction = useAddReaction();
    const removeReaction = useRemoveReaction();

    const hasReacted = (emoji: string) => {
        if (!user || !myReactions) return false;
        return myReactions.some((r: any) => r.emoji === emoji && r.user_id === user.id);
    };

    const handleToggle = (emoji: string) => {
        if (hasReacted(emoji)) {
            removeReaction.mutate({ entity_type: entityType, entity_id: entityId, emoji });
        } else {
            addReaction.mutate({ entity_type: entityType, entity_id: entityId, emoji });
        }
    };

    if (!summary || summary.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 items-center animate-in fade-in duration-300">
            {summary.map((item: ReactionSummary) => {
                const isActive = hasReacted(item.emoji);
                return (
                    <Button
                        key={item.emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(item.emoji)}
                        className={cn(
                            "h-6 px-2 text-[11px] rounded-full border bg-muted/30 hover:bg-muted font-medium transition-all duration-200 hover:scale-105 active:scale-95",
                            isActive
                                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/15"
                                : "border-border/40 text-muted-foreground"
                        )}
                        title={item.user_names?.join(", ")}
                    >
                        <span className="mr-1 text-[13px] leading-tight select-none">{item.emoji}</span>
                        <span className="tabular-nums">{item.count}</span>
                    </Button>
                );
            })}
        </div>
    );
}

