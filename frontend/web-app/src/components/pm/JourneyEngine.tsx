"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSpec } from "@/lib/hooks/usePM";
import { Book, Edit2, Save, X } from "lucide-react";
import type { Spec } from "@/lib/types/pm";
import ReactMarkdown from "react-markdown";

interface JourneyEngineProps {
    engine?: Spec;
    journeyId: string;
}

export function JourneyEngine({ engine, journeyId }: JourneyEngineProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(engine?.content || "");
    const updateSpec = useUpdateSpec();

    useEffect(() => {
        if (engine) {
            setContent(engine.content);
        }
    }, [engine]);

    const handleSave = async () => {
        if (!engine) return;
        await updateSpec.mutateAsync({
            id: engine.id,
            data: { content }
        });
        setIsEditing(false);
    };

    return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl transition-all hover:bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Book className="h-4 w-4 text-primary" />
                    Personal Dossier (Engine)
                </CardTitle>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleSave} disabled={updateSpec.isPending} className="h-8 w-8 text-primary">
                                <Save className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your journey dossier..."
                        className="min-h-[200px] bg-background/50 border-white/10"
                    />
                ) : (
                    <div className="prose prose-sm prose-invert max-w-none text-muted-foreground min-h-[50px]">
                        {content ? (
                            <ReactMarkdown>{content}</ReactMarkdown>
                        ) : (
                            <p className="italic">No dossier content yet. Click edit to start documenting your journey.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
