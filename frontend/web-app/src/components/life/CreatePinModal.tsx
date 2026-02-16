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
import { useCreatePin, useUpdatePin } from "@/lib/hooks/useLife";
import { CreatePinRequest, Pin } from "@/lib/types/life";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>,
});

interface CreatePinModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pin?: Pin | null;
}

export function CreatePinModal({ open, onOpenChange, pin }: CreatePinModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<CreatePinRequest>({
        defaultValues: {
            name: "",
            type: "favorite",
            visited_at: new Date().toISOString().split('T')[0],
        },
    });

    const createPin = useCreatePin();
    const updatePin = useUpdatePin();
    const isEditing = !!pin;

    useEffect(() => {
        if (open) {
            if (pin) {
                setValue("name", pin.name);
                setValue("type", pin.type);
                setValue("address", pin.address);
                setValue("notes", pin.notes);
                setValue("image_url", pin.image_url);
                setValue("visited_at", pin.visited_at ? new Date(pin.visited_at).toISOString().split('T')[0] : '');

                if (pin.latitude !== undefined) setValue("latitude", pin.latitude);
                if (pin.longitude !== undefined) setValue("longitude", pin.longitude);
            } else {
                reset({
                    name: "",
                    type: "favorite",
                    visited_at: new Date().toISOString().split('T')[0],
                    address: "",
                    notes: "",
                    image_url: "",
                    latitude: undefined,
                    longitude: undefined,
                });
            }
        }
    }, [open, pin, setValue, reset]);

    const onSubmit = async (data: CreatePinRequest) => {
        if (isEditing && pin) {
            await updatePin.mutateAsync({ id: pin.id, data });
        } else {
            await createPin.mutateAsync(data);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Pin' : 'Drop a Pin (Where)'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update details for this location.' : 'Mark a significant location in your life map.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Location Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., The Coffee Shop, Kyoto Trip"
                            {...register("name", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Photo</Label>
                        <ImageUpload
                            value={watch("image_url")}
                            onChange={(url) => setValue("image_url", url)}
                            entityType="pin"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address / City</Label>
                        <Input
                            id="address"
                            placeholder="e.g., 123 Main St, New York"
                            {...register("address")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                onValueChange={(val) => setValue("type", val)}
                                defaultValue="favorite"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="home">Home</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="travel">Travel Destination</SelectItem>
                                    <SelectItem value="favorite">Favorite Spot</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="visited_at">Visited Date</Label>
                            <Input
                                id="visited_at"
                                type="date"
                                {...register("visited_at")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location (Click on map to set)</Label>
                        <div className="border rounded-md overflow-hidden">
                            <LocationPicker
                                onLocationSelect={(lat, lng) => {
                                    setValue("latitude", lat);
                                    setValue("longitude", lng);
                                }}
                                initialLat={watch("latitude")}
                                initialLng={watch("longitude")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                {...register("latitude", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                {...register("longitude", { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes / Memories</Label>
                        <Textarea
                            id="notes"
                            placeholder="What makes this place special?"
                            rows={3}
                            {...register("notes")}
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
                        <Button type="submit" disabled={createPin.isPending || updatePin.isPending}>
                            {(createPin.isPending || updatePin.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Update Pin' : 'Drop Pin'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
