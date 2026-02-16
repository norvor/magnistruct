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
import { useCreateLove, useUpdateLove, usePins } from "@/lib/hooks/useLife";
import { CreateLoveRequest, Love, Pin } from "@/lib/types/life";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";

interface CreateLoveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    love?: Love | null;
}

export function CreateLoveModal({ open, onOpenChange, love }: CreateLoveModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<CreateLoveRequest>({
        defaultValues: {
            name: "",
            relationship: "friend",
            notes: "",
            pin_ids: [],
        },
    });

    const createLove = useCreateLove();
    const updateLove = useUpdateLove();
    const isEditing = !!love;

    useEffect(() => {
        if (love) {
            setValue("name", love.name);
            setValue("relationship", love.relationship);
            setValue("birthday", love.birthday || "");
            setValue("avatar_url", love.avatar_url || "");
            setValue("notes", love.notes || "");
            // Extract IDs from associated pins
            const pinIds = love.pins?.map(p => p.id) || [];
            setValue("pin_ids", pinIds);
        } else {
            reset({
                name: "",
                relationship: "friend",
                notes: "",
                pin_ids: [],
            });
        }
    }, [love, reset, setValue, open]);

    const onSubmit = async (data: CreateLoveRequest) => {
        const currentPinIds = watch("pin_ids");
        const payload = { ...data, pin_ids: currentPinIds };

        if (isEditing && love) {
            await updateLove.mutateAsync({ id: love.id, data: payload });
        } else {
            await createLove.mutateAsync(payload);
        }
        reset();
        onOpenChange(false);
    };

    const isLoading = createLove.isPending || updateLove.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Person' : 'Add New Who (Love)'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update details about this person.' : 'Add a person who matters to you.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Jane Doe"
                            {...register("name", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Select
                            onValueChange={(val) => setValue("relationship", val)}
                            defaultValue="friend"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="mentor">Mentor</SelectItem>
                                <SelectItem value="colleague">Colleague</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        <Input
                            id="birthday"
                            type="date"
                            {...register("birthday")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Photo</Label>
                        <ImageUpload
                            value={watch("avatar_url")}
                            onChange={(url) => setValue("avatar_url", url)}
                            entityType="love"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Why they matter, key memories, etc."
                            {...register("notes")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Associated Locations (Pins)</Label>
                        <PinsMultiSelect
                            selectedIds={watch("pin_ids") || []}
                            onSelect={(ids) => setValue("pin_ids", ids)}
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Update Person' : 'Add Person'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PinsMultiSelect({ selectedIds, onSelect }: { selectedIds: string[], onSelect: (ids: string[]) => void }) {
    const { data: pins } = usePins();

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelect(selectedIds.filter(pid => pid !== id));
        } else {
            onSelect([...selectedIds, id]);
        }
    };

    return (
        <div className="border rounded-md p-3 space-y-3">
            <div className="max-h-[120px] overflow-y-auto space-y-1">
                {pins?.map(pin => (
                    <div
                        key={pin.id}
                        className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors ${selectedIds.includes(pin.id) ? 'bg-primary/10' : 'hover:bg-muted'}`}
                        onClick={() => handleToggle(pin.id)}
                    >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selectedIds.includes(pin.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                            {selectedIds.includes(pin.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm truncate flex-1">{pin.name}</span>
                        <Badge variant="outline" className="text-[10px] h-5">{pin.type}</Badge>
                    </div>
                ))}
                {(!pins || pins.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No pins available. Create one first!</p>}
            </div>
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t">
                    {selectedIds.map(id => {
                        const pin = pins?.find(p => p.id === id);
                        if (!pin) return null;
                        return (
                            <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
                                {pin.name}
                                <div
                                    className="cursor-pointer hover:bg-black/10 rounded-full p-0.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle(id);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </div>
                            </Badge>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
