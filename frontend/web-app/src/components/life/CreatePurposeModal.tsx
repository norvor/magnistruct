"use client";

import { useForm } from "react-hook-form";
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
import { useCreatePurpose, useUpdatePurpose, useLoves } from "@/lib/hooks/useLife";
import { CreatePurposeRequest, Purpose } from "@/lib/types/life";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserAvatar } from "@/components/ui/user-avatar";

interface CreatePurposeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purpose?: Purpose | null;
}

export function CreatePurposeModal({ open, onOpenChange, purpose }: CreatePurposeModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<CreatePurposeRequest>({
        defaultValues: {
            title: "",
            type: "value",
            importance: 3,
            love_ids: [],
        },
    });

    const createPurpose = useCreatePurpose();
    const updatePurpose = useUpdatePurpose();
    const { data: loves } = useLoves();

    const importance = watch("importance");
    const title = watch("title");
    const loveIds = watch("love_ids") || [];
    const isEditing = !!purpose;

    useEffect(() => {
        if (open) {
            if (purpose) {
                setValue("title", purpose.title);
                setValue("type", purpose.type);
                setValue("importance", purpose.importance);
                setValue("description", purpose.description);
                // Map configured loves to IDs
                const currentLoveIds = purpose.loves?.map(l => l.id) || [];
                setValue("love_ids", currentLoveIds);
            } else {
                reset({
                    title: "",
                    type: "value",
                    importance: 3,
                    love_ids: [],
                    description: ""
                });
            }
        }
    }, [open, purpose, setValue, reset]);

    const onSubmit = async (data: CreatePurposeRequest) => {
        if (isEditing && purpose) {
            await updatePurpose.mutateAsync({ id: purpose.id, data });
        } else {
            await createPurpose.mutateAsync(data);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Purpose' : 'Define a Why (Purpose)'}</DialogTitle>
                    <DialogDescription>
                        Articulate a core value or mission statement (max 144 chars).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="title">Statement *</Label>
                            <span className={`text-xs ${title?.length > 144 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {title?.length || 0}/144
                            </span>
                        </div>
                        <Textarea
                            id="title"
                            placeholder="e.g., Radical Transparency, Build the Future"
                            rows={2}
                            maxLength={144}
                            {...register("title", { required: true, maxLength: 144 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Associated Loves (Who is this for?)</Label>
                        <div className="border rounded-md p-4">
                            {!loves || loves.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No loves found. Add people in the 'Loves' section first.</p>
                            ) : (
                                <ToggleGroup
                                    type="multiple"
                                    variant="outline"
                                    value={loveIds}
                                    onValueChange={(vals) => setValue("love_ids", vals)}
                                    className="flex flex-wrap gap-2 justify-start"
                                >
                                    {loves.map((love) => (
                                        <ToggleGroupItem
                                            key={love.id}
                                            value={love.id}
                                            aria-label={love.name}
                                            className="h-auto py-1 px-2 flex gap-2 items-center data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
                                        >
                                            <UserAvatar user={{ name: love.name, avatarUrl: love.avatar_url }} className="h-6 w-6" />
                                            <span className="text-xs">{love.name}</span>
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                onValueChange={(val) => setValue("type", val)}
                                defaultValue="value"
                                value={watch("type")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="value">Core Value</SelectItem>
                                    <SelectItem value="mission">Mission Statement</SelectItem>
                                    <SelectItem value="vision">Vision</SelectItem>
                                    <SelectItem value="principle">Guiding Principle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Importance ({importance})</Label>
                            <Slider
                                defaultValue={[3]}
                                value={[importance || 3]}
                                max={5}
                                min={1}
                                step={1}
                                onValueChange={(vals: number[]) => setValue("importance", vals[0])}
                                className="py-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Elaboration (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Expand on what this means to you..."
                            rows={3}
                            {...register("description")}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createPurpose.isPending || updatePurpose.isPending}>
                            {(createPurpose.isPending || updatePurpose.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Update Purpose' : 'Define Purpose'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
