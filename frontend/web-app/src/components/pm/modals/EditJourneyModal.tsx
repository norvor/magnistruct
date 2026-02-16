"use client";

import { useForm } from "react-hook-form";
import { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateJourney, useDeleteJourney, useGoals } from "@/lib/hooks/usePM";
import type { Journey, UpdateJourneyRequest } from "@/lib/types/pm";
import { Loader2, Calendar, Target, Clock, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { addWeeks, addMonths, format, differenceInDays } from "date-fns";
import { DeleteJourneyConfirmModal } from "./DeleteJourneyConfirmModal";

interface EditJourneyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journey: Journey;
}

interface EditJourneyFormProps {
    journey: Journey;
    onClose: () => void;
    updateJourney: any;
    deleteJourney: any;
    goals: any[] | undefined;
}

const EditJourneyForm = memo(function EditJourneyForm({ journey, onClose, updateJourney, deleteJourney, goals }: EditJourneyFormProps) {
    const router = useRouter();
    // 1. Map initial compartments to IDs
    const initialCompartmentIds = useMemo(() =>
        journey.compartments?.map(c => c.id) || [],
        [journey.compartments]);

    // 2. Stable initial config
    const initialConfig = useMemo(() => ({
        name: journey.name,
        start_date: journey.start_date ? format(new Date(journey.start_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        end_date: journey.end_date ? format(new Date(journey.end_date), 'yyyy-MM-dd') : format(addWeeks(new Date(), 2), 'yyyy-MM-dd'),
        status: journey.status,
        compartments: initialCompartmentIds,
    }), [journey, initialCompartmentIds]);

    // 3. Form setup
    const { register, handleSubmit, setValue, getValues } = useForm<UpdateJourneyRequest>({
        defaultValues: initialConfig
    });

    // 4. Local decoupled state
    const [selectedIds, setSelectedIds] = useState<string[]>(initialConfig.compartments);
    const [duration, setDuration] = useState<string>("custom"); // Default to custom for editing to not overwrite existing end_date immediately

    const updateEndDate = useCallback((startVal: string | undefined, durVal: string) => {
        if (!startVal || durVal === "custom") return;
        const start = new Date(startVal);
        let end: Date;
        switch (durVal) {
            case "1_week": end = addWeeks(start, 1); break;
            case "2_weeks": end = addWeeks(start, 2); break;
            case "1_month": end = addMonths(start, 1); break;
            case "3_months": end = addMonths(start, 3); break;
            default: return; // Don't update for custom
        }
        setValue("end_date", format(end, 'yyyy-MM-dd'));
    }, [setValue]);

    const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("start_date", val);
        updateEndDate(val, duration);
    }, [setValue, updateEndDate, duration]);

    const handleDurationChange = useCallback((val: string) => {
        setDuration(val);
        updateEndDate(getValues("start_date"), val);
    }, [getValues, updateEndDate]);

    const handleGoalToggle = useCallback((goalId: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = checked ? [...prev, goalId] : prev.filter(id => id !== goalId);
            setValue("compartments", next);
            return next;
        });
    }, [setValue]);

    const onSubmit = useCallback(async (data: UpdateJourneyRequest) => {
        await updateJourney.mutateAsync({ id: journey.id, data });
        onClose();
    }, [journey.id, updateJourney, onClose]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        await deleteJourney.mutateAsync(journey.id);
        setIsDeleteModalOpen(false);
        onClose();
        // If we are on the detail page, redirect to the journeys list
        if (typeof window !== "undefined" && window.location.pathname.includes(`/journeys/${journey.id}`)) {
            router.push('/dashboard/journeys');
        }
    }, [journey.id, deleteJourney, onClose, router]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Journey Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., Spring Offensive"
                    className="bg-muted/50 border-input h-10"
                    {...register("name", { required: true })}
                />
            </div>

            {/* Timeline & Duration */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Start Date
                    </Label>
                    <Input
                        id="start_date"
                        type="date"
                        className="bg-muted/50 border-input h-10"
                        {...register("start_date")}
                        onChange={handleStartDateChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Set Duration
                    </Label>
                    <Select
                        value={duration}
                        onValueChange={handleDurationChange}
                    >
                        <SelectTrigger className="bg-muted/50 border-input h-10">
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1_week">1 Week</SelectItem>
                            <SelectItem value="2_weeks">2 Weeks</SelectItem>
                            <SelectItem value="1_month">1 Month</SelectItem>
                            <SelectItem value="3_months">3 Months</SelectItem>
                            <SelectItem value="custom">Maintain Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="end_date" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">End Date</Label>
                <Input
                    id="end_date"
                    type="date"
                    className="bg-muted/50 border-input h-10"
                    {...register("end_date")}
                />
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Status</Label>
                <Select
                    value={getValues("status")}
                    onValueChange={(val) => setValue("status", val)}
                >
                    <SelectTrigger className="bg-muted/50 border-input h-10">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Multi-Goal Selection */}
            <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-primary" /> Included Whats (Goals)
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {goals?.map((goal) => (
                        <div
                            key={goal.id}
                            className="flex items-center space-x-3 p-3 rounded-xl bg-muted/30 border border-border/10 hover:border-border/20 transition-colors"
                        >
                            <Checkbox
                                id={`goal-${goal.id}`}
                                checked={selectedIds.includes(goal.id)}
                                onCheckedChange={(checked) => handleGoalToggle(goal.id, !!checked)}
                                className="border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{goal.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DialogFooter className="pt-6 flex justify-between items-center bg-muted/20 p-6 -mx-6 -mb-6 rounded-b-[var(--radius)]">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                    onClick={handleDeleteClick}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Journey
                </Button>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={updateJourney.isPending} className="px-8 shadow-lg shadow-primary/20">
                        {updateJourney.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </DialogFooter>
            <DeleteJourneyConfirmModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDelete}
                journeyName={journey.name}
                isDeleting={deleteJourney.isPending}
            />
        </form>
    );
});

export function EditJourneyModal({ open, onOpenChange, journey }: EditJourneyModalProps) {
    const updateJourney = useUpdateJourney();
    const deleteJourney = useDeleteJourney();
    const { data: goals } = useGoals();

    const handleClose = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Journey: {journey.name}</DialogTitle>
                    <DialogDescription>
                        Modify your execution period or associated objectives.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <EditJourneyForm
                        journey={journey}
                        onClose={handleClose}
                        updateJourney={updateJourney}
                        deleteJourney={deleteJourney}
                        goals={goals}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
