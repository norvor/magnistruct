"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Purpose } from "@/lib/types/life";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurposeFlashcardProps {
    purpose: Purpose;
    onEdit: (purpose: Purpose) => void;
    onDelete: (id: string) => void;
}

export function PurposeFlashcard({ purpose, onEdit, onDelete }: PurposeFlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleFlip = () => {
        if (!isHovered) return; // Prevent flip on touch devices if not interacting? or just on click
        setIsFlipped(!isFlipped);
    };

    return (
        <div
            className="perspective-1000 w-full h-[250px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* FRONT: The Statement */}
                <Card className={cn(
                    "absolute w-full h-full backface-hidden overflow-hidden flex flex-col justify-between p-6",
                    "bg-gradient-to-br from-background to-muted/20 border-2"
                )}>
                    <CardContent className="p-0 flex items-center justify-center h-full text-center">
                        <div>
                            <h3 className="text-xl font-bold leading-tight tracking-tight mb-2">
                                {purpose.title}
                            </h3>
                            {purpose.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {purpose.description}
                                </p>
                            )}
                        </div>
                    </CardContent>

                    {/* Action buttons visible on hover only if not flipped, but tricky with 3d. 
                        Let's put them absolute top right 
                    */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(purpose)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(purpose.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground opacity-50">
                        Tap / Flip to see Who
                    </div>
                </Card>

                {/* BACK: The Loves */}
                <Card className={cn(
                    "absolute w-full h-full backface-hidden overflow-hidden flex flex-col p-6",
                    "bg-muted/50 border-2",
                )}
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="h-full flex flex-col items-center justify-center">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            For
                        </h4>

                        {(!purpose.loves || purpose.loves.length === 0) ? (
                            <p className="text-sm text-muted-foreground italic">No specific loves associated yet.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {purpose.loves.map(love => (
                                    <div key={love.id} className="flex flex-col items-center gap-1">
                                        <UserAvatar
                                            user={{ name: love.name, avatarUrl: love.avatar_url }}
                                            className="h-12 w-12 border-2 border-background"
                                        />
                                        <span className="text-xs font-medium truncate max-w-[80px]">{love.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
