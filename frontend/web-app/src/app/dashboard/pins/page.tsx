"use client";

import { usePins, useDeletePin } from "@/lib/hooks/useLife";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trash2, Navigation2, LayoutGrid, Map as MapIcon, Edit2, BookOpen } from "lucide-react";
import { useState } from "react";
import { CreatePinModal } from "@/components/life/CreatePinModal";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import dynamic from 'next/dynamic';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Pin } from "@/lib/types/life";

// Dynamically import map to avoid SSR issues
const PinsMap = dynamic(() => import('@/components/life/PinsMap'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse">Loading Map...</div>
});

const PinsScrapbook = dynamic(() => import('@/components/life/PinsScrapbook'), {
    loading: () => <div className="h-[600px] w-full flex items-center justify-center">Loading Scrapbook...</div>
});

export default function PinsPage() {
    const { data: pins, isLoading } = usePins();
    const deletePin = useDeletePin();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPin, setEditingPin] = useState<Pin | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map' | 'scrapbook'>('list');

    const handleEdit = (pin: Pin) => {
        setEditingPin(pin);
        setIsCreateOpen(true);
    };

    const handleCreate = () => {
        setEditingPin(null);
        setIsCreateOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center">Loading...</div>;
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'home': return "bg-green-500/10 text-green-500 border-green-500/20";
            case 'work': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'travel': return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case 'favorite': return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">Pins: The Wheres</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Your map. Significant locations and memories.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-muted/50 p-1 rounded-lg border border-border/50">
                        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'map' | 'scrapbook')}>
                            <ToggleGroupItem value="list" aria-label="List View" className="data-[state=on]:bg-background data-[state=on]:shadow-sm">
                                <LayoutGrid className="h-4 w-4 mr-2" /> List
                            </ToggleGroupItem>
                            <ToggleGroupItem value="map" aria-label="Map View" className="data-[state=on]:bg-background data-[state=on]:shadow-sm">
                                <MapIcon className="h-4 w-4 mr-2" /> Map
                            </ToggleGroupItem>
                            <ToggleGroupItem value="scrapbook" aria-label="Scrapbook View" className="data-[state=on]:bg-background data-[state=on]:shadow-sm">
                                <BookOpen className="h-4 w-4 mr-2" /> Scrapbook
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <Button onClick={handleCreate} className="rounded-full px-6 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> Drop New Pin
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pins?.map((pin) => (
                        <Card key={pin.id} className="group border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all hover:scale-[1.02] overflow-hidden relative min-h-[300px] flex flex-col">

                            {pin.image_url ? (
                                <div className="h-48 w-full relative">
                                    <img
                                        src={pin.image_url}
                                        alt={pin.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className={`capitalize backdrop-blur-md bg-white/20 text-white border-none`}>
                                            {pin.type}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-3 left-4 text-white max-w-[90%]">
                                        <h3 className="text-xl font-bold truncate">{pin.name}</h3>
                                        {pin.address && (
                                            <p className="text-xs text-white/80 truncate mt-0.5">{pin.address}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center relative">
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className={`capitalize ${getTypeColor(pin.type)} border bg-background/50`}>
                                            {pin.type}
                                        </Badge>
                                    </div>
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 border-background ${getTypeColor(pin.type).replace('bg-', 'text-').replace('/10', '')}`}>
                                        <MapPin className="h-8 w-8" />
                                    </div>
                                </div>
                            )}

                            {!pin.image_url && (
                                <CardHeader className="flex flex-row items-start gap-4 pb-2 pt-4">
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-lg font-bold truncate pr-6">{pin.name}</CardTitle>
                                        {pin.address && (
                                            <p className="text-xs text-muted-foreground truncate mt-1">{pin.address}</p>
                                        )}
                                    </div>
                                </CardHeader>
                            )}

                            <CardContent className="space-y-3 text-sm pt-4 flex-1">
                                {pin.visited_at && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Badge variant="outline" className="opacity-70 font-mono text-xs">
                                            {format(new Date(pin.visited_at), 'MMM d, yyyy')}
                                        </Badge>
                                    </div>
                                )}

                                {pin.notes && (
                                    <p className="text-muted-foreground line-clamp-3 text-xs italic">
                                        "{pin.notes}"
                                    </p>
                                )}

                                {(pin.latitude && pin.longitude) && (viewMode === 'list') && (
                                    <div className="text-[10px] text-muted-foreground/40 font-mono mt-auto pt-2">
                                        {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-primary h-8 px-2"
                                        onClick={() => handleEdit(pin)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                                        onClick={() => {
                                            if (confirm('Remove this pin?')) {
                                                deletePin.mutate(pin.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {pin.latitude && pin.longitude && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary h-8 px-2 gap-1 text-xs"
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`, '_blank')}
                                    >
                                        Google Maps <Navigation2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {(!pins || pins.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/40 rounded-xl">
                            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <MapPin className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold">No Pins Dropped Yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">Start mapping your world. Pins appear here when you add significant locations.</p>
                            <Button onClick={handleCreate} variant="outline">
                                Drop Your First Pin
                            </Button>
                        </div>
                    )}
                </div>
            ) : viewMode === 'map' ? (
                <PinsMap pins={pins || []} />
            ) : (
                <PinsScrapbook pins={pins || []} onEdit={handleEdit} />
            )}

            <CreatePinModal open={isCreateOpen} onOpenChange={setIsCreateOpen} pin={editingPin} />
        </div>
    );
}
