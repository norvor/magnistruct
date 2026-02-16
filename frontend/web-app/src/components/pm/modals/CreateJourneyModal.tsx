"use client";

import { useForm } from "react-hook-form";
import { useState, useMemo, useCallback, memo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateJourney, useGoals } from "@/lib/hooks/usePM";
import type { CreateJourneyRequest } from "@/lib/types/pm";
import { Loader2, Calendar, Target, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { addWeeks, addMonths, format } from "date-fns";

interface CreateJourneyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialGoalId?: string; // Renamed from initialProjectId
}

interface JourneyFormProps {
    initialGoalId?: string;
    onClose: () => void;
    createJourney: any;
    goals: any[] | undefined;
}

const JourneyForm = memo(function JourneyForm({ initialGoalId, onClose, createJourney, goals }: JourneyFormProps) {
    // 1. Stable initial state
    const initialConfig = useMemo(() => {
        const start = format(new Date(), 'yyyy-MM-dd');
        const end = format(addWeeks(new Date(start), 2), 'yyyy-MM-dd');
        return {
            start,
            end,
            compartments: initialGoalId ? [initialGoalId] : [] as string[],
        };
    }, [initialGoalId]);

    // 2. Form setup (no reactive watching for compartments)
    const { register, handleSubmit, setValue, getValues } = useForm<CreateJourneyRequest>({
        defaultValues: {
            name: "",
            start_date: initialConfig.start,
            end_date: initialConfig.end,
            status: "planned",
            compartments: initialConfig.compartments,
        }
    });

    // 3. Local decoupled state for UI feedback (avoids useWatch loops)
    const [selectedIds, setSelectedIds] = useState<string[]>(initialConfig.compartments);
    const [duration, setDuration] = useState<string>("2_weeks");

    const updateEndDate = useCallback((startVal: string | undefined, durVal: string) => {
        if (!startVal || durVal === "custom") return;
        const start = new Date(startVal);
        let end: Date;
        switch (durVal) {
            case "1_week": end = addWeeks(start, 1); break;
            case "2_weeks": end = addWeeks(start, 2); break;
            case "1_month": end = addMonths(start, 1); break;
            case "3_months": end = addMonths(start, 3); break;
            default: end = addWeeks(start, 2);
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
            setValue("compartments", next); // Sync to form silently
            return next;
        });
    }, [setValue]);

    const onSubmit = useCallback(async (data: CreateJourneyRequest) => {
        await createJourney.mutateAsync(data);
        onClose();
    }, [createJourney, onClose]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Journey Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., Spring Offensive, Growth Sprint 1"
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
                        <Clock className="w-3.5 h-3.5" /> Duration
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
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {duration === "custom" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="end_date" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        className="bg-muted/50 border-input h-10"
                        {...register("end_date")}
                    />
                </div>
            )}

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
                    {(!goals || goals.length === 0) && (
                        <div className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-border/10 rounded-xl">No Whats found in your Orchard.</div>
                    )}
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={createJourney.isPending} className="px-8 shadow-lg shadow-primary/20">
                    {createJourney.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Begin Journey
                </Button>
            </DialogFooter>
        </form>
    );
});

export function CreateJourneyModal({ open, onOpenChange, initialGoalId }: CreateJourneyModalProps) {
    const createJourney = useCreateJourney();
    const { data: goals } = useGoals();

    const handleClose = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Journey: The When</DialogTitle>
                    <DialogDescription>
                        Define a specific season or execution period for your objectives.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <JourneyForm
                        initialGoalId={initialGoalId}
                        onClose={handleClose}
                        createJourney={createJourney}
                        goals={goals}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
