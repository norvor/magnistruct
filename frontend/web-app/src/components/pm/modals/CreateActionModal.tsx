"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateWorkItem, useJourneys, useGoals } from "@/lib/hooks/usePM";
import type { CreateWorkItemRequest } from "@/lib/types/pm";
import { Loader2, Target } from "lucide-react";

interface CreateActionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialGoalId?: string;
    initialJourneyId?: string;
}

export function CreateActionModal({
    open,
    onOpenChange,
    initialGoalId,
    initialJourneyId
}: CreateActionModalProps) {
    const user = useSelector((state: any) => state.auth.user);

    const { register, handleSubmit, reset, watch, setValue } = useForm<CreateWorkItemRequest>({
        defaultValues: {
            title: "",
            description: "",
            type: "action",
            status: "todo",
            priority: "medium",
            assignee_id: user?.id,
            goal_id: initialGoalId,
            journey_id: initialJourneyId,
        },
    });

    const createWorkItem = useCreateWorkItem();
    const { data: journeys } = useJourneys();
    const { data: goals } = useGoals();

    // Reset form when modal opens or initial values change
    useEffect(() => {
        if (open) {
            reset({
                title: "",
                description: "",
                type: "action",
                status: "todo",
                priority: "medium",
                assignee_id: user?.id,
                goal_id: initialGoalId,
                journey_id: initialJourneyId,
            });
        }
    }, [open, initialGoalId, initialJourneyId, reset, user?.id]);

    const onSubmit = async (data: CreateWorkItemRequest) => {
        await createWorkItem.mutateAsync(data);
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Action</DialogTitle>
                    <DialogDescription>
                        Add a new action, improvement, or feature
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
                        <Input
                            id="title"
                            placeholder="What needs to be done?"
                            className="h-12 text-lg bg-muted/50 border-input focus:border-primary/50 transition-all"
                            {...register("title", { required: true })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Add more details about this task..."
                            rows={6}
                            className="bg-muted/50 border-input focus:border-primary/50 transition-all resize-none"
                            {...register("description")}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createWorkItem.isPending}
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        >
                            {createWorkItem.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
