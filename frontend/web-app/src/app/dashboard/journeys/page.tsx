"use client";

import { useSelector } from "react-redux";
import { useJourneys, useDeleteJourney } from "@/lib/hooks/usePM";
import { CreateJourneyModal } from "@/components/pm/modals/CreateJourneyModal";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Plus,
    Calendar,
    ArrowRight,
    RefreshCcw,
    CheckCircle2,
    CircleDashed,
    Trash2,
    Target,
    Clock,
    History
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { isPast, differenceInDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { getJourneyStatusLabel, getJourneyStatusColor } from "@/lib/journey-utils";
import { DeleteJourneyConfirmModal } from "@/components/pm/modals/DeleteJourneyConfirmModal";

const JourneyCard = ({ journey, onDelete }: { journey: any, onDelete: (id: string, e: React.MouseEvent) => void }) => {
    const total = journey.stats ? journey.stats.total_count : 0;
    const done = journey.stats ? journey.stats.done_count : 0;
    const progress = total > 0 ? (done / total) * 100 : 0;

    const isOverdue = journey.end_date && isPast(new Date(journey.end_date)) && journey.status !== 'completed';
    const durationDays = (journey.start_date && journey.end_date)
        ? Math.abs(differenceInDays(new Date(journey.end_date), new Date(journey.start_date)))
        : 0;

    return (
        <Link href={`/dashboard/journeys/${journey.id}`} className="block h-full group">
            <GlassCard variant="hover" className="cursor-pointer p-0 relative overflow-hidden h-full" intensity="medium">
                {/* Status Indicator Stripe */}
                <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-1 opacity-80",
                    getJourneyStatusColor(journey).split(' ')[0].replace('/10', '')
                )} />

                <div className="p-5 pl-7 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{journey.name}</h3>
                                {isOverdue && <Badge variant="destructive" className="text-[10px] h-5">Overdue</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{journey.goal || "No goal set"}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={cn("rounded-full", getJourneyStatusColor(journey))}>
                                {getJourneyStatusLabel(journey)}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => onDelete(journey.id, e)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {durationDays} Days
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                            <Target className="h-3.5 w-3.5 text-emerald-500" />
                            {journey.compartments?.length || 0} Whats Included
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className={progress === 100 ? "text-emerald-400" : "text-muted-foreground"}>{Math.round(progress)}% Complete</span>
                            <span className="text-muted-foreground">{done}/{total} Done</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-black/20" indicatorClassName={
                            progress === 100 ? "bg-emerald-500" :
                                journey.status === 'active' ? "bg-emerald-500" : "bg-blue-500"
                        } />
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
};

export default function JourneysPage() {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { data: journeys, isLoading } = useJourneys(orgId);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { mutate: deleteJourney, isPending: isDeleting } = useDeleteJourney();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [journeyToDelete, setJourneyToDelete] = useState<any>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const now = new Date();

    const activeJourneys = journeys?.filter(j => {
        if (!j.start_date || !j.end_date) return false;
        const start = startOfDay(new Date(j.start_date));
        const end = endOfDay(new Date(j.end_date));
        return !isAfter(start, now) && !isBefore(end, now);
    }) || [];

    const plannedJourneys = journeys?.filter(j => {
        if (!j.start_date) return false;
        const start = startOfDay(new Date(j.start_date));
        return isAfter(start, now);
    }) || [];

    const completedJourneys = journeys?.filter(j => {
        if (!j.end_date) return false;
        const end = endOfDay(new Date(j.end_date));
        return isBefore(end, now);
    }) || [];

    const handleDeleteClick = (journey: any, e: React.MouseEvent) => {
        e.preventDefault();
        setJourneyToDelete(journey);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (journeyToDelete) {
            await deleteJourney(journeyToDelete.id);
            setDeleteModalOpen(false);
            setJourneyToDelete(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Journeys: The Whens</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Execution timelines and focus periods.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                    <Plus className="mr-2 h-5 w-5" />
                    New Journey
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Active Column */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Current Seasons
                        </h2>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-full h-5">
                            {activeJourneys.length}
                        </Badge>
                    </div>
                    {activeJourneys.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {activeJourneys.map(journey => (
                                <JourneyCard key={journey.id} journey={journey} onDelete={(id, e) => handleDeleteClick(journey, e)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/30 border border-dashed border-border/50 rounded-2xl">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground/90">No current work</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">This is where your active seasons and sprints will appear.</p>
                        </div>
                    )}
                </div>

                {/* Planned Column */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest font-bold text-blue-400 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Upcoming Seasons
                        </h2>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-full h-5">
                            {plannedJourneys.length}
                        </Badge>
                    </div>
                    {plannedJourneys.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {plannedJourneys.map(journey => (
                                <JourneyCard key={journey.id} journey={journey} onDelete={(id, e) => handleDeleteClick(journey, e)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/30 border border-dashed border-border/50 rounded-2xl opacity-60">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground/90">Quiet horizon</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">No upcoming journeys or planning phases scheduled yet.</p>
                        </div>
                    )}
                </div>

                {/* Past Column */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            Past Seasons
                        </h2>
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 rounded-full h-5">
                            {completedJourneys.length}
                        </Badge>
                    </div>
                    {completedJourneys.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {completedJourneys.map(journey => (
                                <JourneyCard key={journey.id} journey={journey} onDelete={(id, e) => handleDeleteClick(journey, e)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/30 border border-dashed border-border/50 rounded-2xl opacity-40">
                            <div className="h-12 w-12 rounded-full bg-slate-500/10 flex items-center justify-center mb-4">
                                <History className="w-6 h-6 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground/90">No history yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">Previously finished work and archives will be collected here.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateJourneyModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            <DeleteJourneyConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={confirmDelete}
                journeyName={journeyToDelete?.name}
                isDeleting={isDeleting}
            />
        </div>
    );
}
