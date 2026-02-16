"use client";

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
import { useCreateGoal } from "@/lib/hooks/usePM";
import { usePurposes } from "@/lib/hooks/useLife";
import type { CreateGoalRequest } from "@/lib/types/pm";
import { Loader2, Target, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateGoalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateGoalModal({ open, onOpenChange }: CreateGoalModalProps) {
    const user = useSelector((state: any) => state.auth.user);

    const { register, handleSubmit, reset, setValue } = useForm<CreateGoalRequest>({
        defaultValues: {
            name: "",
            description: "",
            status: "active",
            steps: ["", "", "", "", ""],
        },
    });

    const createGoal = useCreateGoal();
    const { data: purposes } = usePurposes();

    const onSubmit = async (data: CreateGoalRequest) => {
        const filteredSteps = data.steps?.filter(s => s && s.trim().length > 0) || [];
        await createGoal.mutateAsync({ ...data, steps: filteredSteps });
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Goal: The What</DialogTitle>
                    <DialogDescription>
                        Define a high-level outcome or result you want to achieve.
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

                    {/* 5 Steps */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border/40">
                        <Label className="flex items-center gap-2 mb-2 font-bold">
                            <Target className="w-4 h-4 text-primary" />
                            5 Steps to Achievement
                        </Label>
                        {[1, 2, 3, 4, 5].map((num, i) => (
                            <div key={num} className="flex gap-2 items-center">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {num}
                                </span>
                                <Input
                                    placeholder={`Step ${num}...`}
                                    className="h-8 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b border-border/20 rounded-none px-0"
                                    {...register(`steps.${i}` as any)}
                                />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createGoal.isPending}>
                            {createGoal.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Objective
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
