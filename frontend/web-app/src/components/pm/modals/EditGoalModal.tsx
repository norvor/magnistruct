"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGoal } from "@/lib/hooks/usePM";
import { usePurposes } from "@/lib/hooks/useLife";
import type { Goal, UpdateGoalRequest } from "@/lib/types/pm";
import { Loader2, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditGoalModalProps {
    goal: Goal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditGoalModal({ goal, open, onOpenChange }: EditGoalModalProps) {
    const { register, handleSubmit, reset, setValue } = useForm<UpdateGoalRequest>({
        defaultValues: {
            name: goal.name,
            description: goal.description,
            status: goal.status,
            purpose_id: goal.purpose_id,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: goal.name,
                description: goal.description,
                status: goal.status,
                purpose_id: goal.purpose_id,
            });
        }
    }, [open, goal, reset]);

    const updateGoal = useUpdateGoal();
    const { data: purposes } = usePurposes();

    const onSubmit = async (data: UpdateGoalRequest) => {
        await updateGoal.mutateAsync({ id: goal.id, data });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Objective</DialogTitle>
                    <DialogDescription>
                        Update the high-level details of your goal.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Objective Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Q3 Marketing Campaign"
                            {...register("name", { required: true })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the desired outcome..."
                            rows={3}
                            {...register("description")}
                        />
                    </div>

                    {/* Purpose Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Associated Purpose (Why)
                        </Label>
                        <Select
                            onValueChange={(val) => setValue("purpose_id", val)}
                            defaultValue={goal.purpose_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select why..." />
                            </SelectTrigger>
                            <SelectContent>
                                {purposes?.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateGoal.isPending}>
                            {updateGoal.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
