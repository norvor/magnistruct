"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useJourney, useUpdateJourney, useDeleteJourney } from "@/lib/hooks/usePM";
import { format, differenceInDays } from "date-fns";
import { getJourneyStatusLabel, getJourneyStatusColor } from "@/lib/journey-utils";
import { DeleteJourneyConfirmModal } from "@/components/pm/modals/DeleteJourneyConfirmModal";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { EditJourneyModal } from "@/components/pm/modals/EditJourneyModal";
import {
    ChevronLeft,
    Calendar,
    Target,
    Clock,
    MoreVertical,
    Pencil,
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";



export default function JourneyDetailPage() {
    const { id: journeyId } = useParams() as { id: string };
    const router = useRouter();

    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: journey, isLoading: journeyLoading } = useJourney(journeyId);
    const updateJourney = useUpdateJourney();
    const { mutate: deleteJourneyAction, isPending: isDeleting } = useDeleteJourney();

    const handleDelete = async () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        await deleteJourneyAction(journeyId);
        setIsDeleteModalOpen(false);
        router.push('/dashboard/journeys');
    };

    if (journeyLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!journey) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-xl font-semibold text-muted-foreground">Journey not found</p>
                <Link href="/dashboard/journeys">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{journey.name}</h1>
                            <Badge variant="outline" className={cn("capitalize rounded-full", getJourneyStatusColor(journey))}>
                                {getJourneyStatusLabel(journey)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                {journey.start_date && journey.end_date ? Math.abs(differenceInDays(new Date(journey.end_date), new Date(journey.start_date))) : 0} Days Duration
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60 italic font-medium">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {journey.start_date ? format(new Date(journey.start_date), 'MMM d, yyyy') : 'No start date'} — {journey.end_date ? format(new Date(journey.end_date), 'MMM d, yyyy') : 'No end date'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 px-4 shadow-lg shadow-primary/20"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit Journey
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive font-medium" onClick={handleDelete}>
                                Delete Journey
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Simple Duration Visualizer Card */}
            <GlassCard className="p-8 relative overflow-hidden" intensity="medium">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Journey Start</p>
                        <p className="text-lg font-semibold text-white">{journey.start_date ? format(new Date(journey.start_date), 'MMMM d, yyyy') : 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-full h-1 bg-white/5 rounded-full relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-slate-950 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary/40 bg-slate-950" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{journey.start_date && journey.end_date ? Math.abs(differenceInDays(new Date(journey.end_date), new Date(journey.start_date))) : 0} Days Total duration</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Journey End</p>
                        <p className="text-lg font-semibold text-primary/90">{journey.end_date ? format(new Date(journey.end_date), 'MMMM d, yyyy') : 'N/A'}</p>
                    </div>
                </div>
            </GlassCard>

            {/* Goals List (The Whats) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Included Whats (Goals)</h2>
                    <Badge variant="secondary" className="ml-auto bg-white/5 border-white/10 text-[10px]">{journey.compartments?.length || 0}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {journey.compartments?.map((comp) => (
                        <Link key={comp.id} href={`/dashboard/goals/${comp.id}`}>
                            <GlassCard className="p-5 flex items-center justify-between group" variant="hover" intensity="low">
                                <div className="space-y-1">
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{comp.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{comp.status || 'Active'}</p>
                                </div>
                                <ChevronLeft className="h-4 w-4 rotate-180 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </GlassCard>
                        </Link>
                    ))}
                    {(!journey.compartments || journey.compartments.length === 0) && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl border-white/5 bg-white/2">
                            <p className="text-muted-foreground italic">No Whats associated with this When.</p>
                        </div>
                    )}
                </div>
            </div>

            <EditJourneyModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                journey={journey}
            />

            <DeleteJourneyConfirmModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDelete}
                journeyName={journey.name}
                isDeleting={isDeleting}
            />
        </div>
    );
}
