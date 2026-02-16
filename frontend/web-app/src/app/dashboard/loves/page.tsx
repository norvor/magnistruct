"use client";

import { useLoves, useDeleteLove } from "@/lib/hooks/useLife";
import { Button } from "@/components/ui/button";
import { Plus, Users, Heart, Trash2, Calendar, LayoutGrid, BookOpen, Edit2 } from "lucide-react";
import { useState } from "react";
import { CreateLoveModal } from "@/components/life/CreateLoveModal";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import dynamic from "next/dynamic";
import { Love } from "@/lib/types/life";

const LovesScrapbook = dynamic(() => import('@/components/life/LovesScrapbook'), {
    loading: () => <div className="h-[600px] w-full flex items-center justify-center">Loading Scrapbook...</div>
});

export default function LovesPage() {
    const { data: loves, isLoading } = useLoves();
    const deleteLove = useDeleteLove();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingLove, setEditingLove] = useState<Love | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'scrapbook'>('list');

    const handleEdit = (love: Love) => {
        setEditingLove(love);
        setIsCreateOpen(true);
    };

    const handleCreate = () => {
        setEditingLove(null);
        setIsCreateOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-rose-600 bg-clip-text text-transparent">Loves: The Whos</h1>
                    <p className="text-muted-foreground mt-1 text-lg">The people who make life meaningful.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-muted/50 p-1 rounded-lg border border-border/50">
                        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'scrapbook')}>
                            <ToggleGroupItem value="list" aria-label="List View" className="data-[state=on]:bg-background data-[state=on]:shadow-sm">
                                <LayoutGrid className="h-4 w-4 mr-2" /> List
                            </ToggleGroupItem>
                            <ToggleGroupItem value="scrapbook" aria-label="Scrapbook View" className="data-[state=on]:bg-background data-[state=on]:shadow-sm">
                                <BookOpen className="h-4 w-4 mr-2" /> Scrapbook
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Button onClick={handleCreate} className="rounded-full px-6 shadow-lg shadow-primary/20 bg-rose-600 hover:bg-rose-700 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> Add Person
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loves?.map((love) => (
                        <Card key={love.id} className="group border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all hover:scale-[1.02] overflow-hidden relative min-h-[300px] flex flex-col">

                            {love.avatar_url ? (
                                <div className="h-48 w-full relative">
                                    <img
                                        src={love.avatar_url}
                                        alt={love.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-3 left-4 text-white">
                                        <h3 className="text-xl font-bold truncate">{love.name}</h3>
                                        <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white border-none capitalize backdrop-blur-md">
                                            {love.relationship}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                                    <Avatar className="h-16 w-16 border-4 border-white/10">
                                        <AvatarFallback className="bg-rose-500 text-white text-2xl font-bold">
                                            {love.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )}

                            {!love.avatar_url && (
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-lg font-bold truncate">{love.name}</CardTitle>
                                        <Badge variant="secondary" className="mt-1 text-xs bg-rose-500/10 text-rose-500 border-none capitalize">
                                            {love.relationship}
                                        </Badge>
                                    </div>
                                </CardHeader>
                            )}

                            <CardContent className="space-y-3 text-sm pt-4 flex-1">
                                {love.birthday && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                                        <span>{format(new Date(love.birthday), 'MMMM d, yyyy')}</span>
                                    </div>
                                )}
                                {love.notes && (
                                    <p className="text-muted-foreground line-clamp-3 text-xs italic">
                                        "{love.notes}"
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary h-8 px-2"
                                    onClick={() => handleEdit(love)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this person?')) {
                                            deleteLove.mutate(love.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {(!loves || loves.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/40 rounded-xl">
                            <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                                <Heart className="h-8 w-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-semibold">No Loves Added Yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">Start building your circle of "Whos" by adding people who matter to you.</p>
                            <Button onClick={handleCreate} variant="outline">
                                Add Your First Person
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <LovesScrapbook loves={loves || []} onEdit={handleEdit} />
            )}

            <CreateLoveModal open={isCreateOpen} onOpenChange={setIsCreateOpen} love={editingLove} />
        </div>
    );
}
