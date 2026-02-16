"use client";

import { Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { useAddReaction } from "@/lib/hooks/useInteraction";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "🔥", "❤️", "😄", "🎉", "🚀", "👀", "💯", "✅", "🙌", "✨", "🎯"];

interface ReactionPickerProps {
    entityType: string;
    entityId: string;
    variant?: "default" | "minimal";
}

export function ReactionPicker({ entityType, entityId, variant = "default" }: ReactionPickerProps) {
    const addReaction = useAddReaction();

    const handleSelect = (emoji: string) => {
        addReaction.mutate({ entity_type: entityType, entity_id: entityId, emoji });
    };

    return (
        <Popover
            align="start"
            content={
                <div className="grid grid-cols-4 gap-1 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji)}
                            className="text-lg p-2 hover:bg-primary/10 hover:scale-125 rounded-lg transition-all duration-200 active:scale-95"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            }
        >
            {variant === "minimal" ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all gap-1.5 group"
                >
                    <Smile className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">React</span>
                </Button>
            )}
        </Popover>
    );
}

