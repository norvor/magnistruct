"use client";

import { useCreateSpec } from "@/lib/hooks/usePM";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.string().min(1, "Type is required"),
    content: z.string().optional(),
    entity_type: z.string().optional(),
    entity_id: z.string().optional(),
});

interface CreateSpecModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateSpecModal({ open, onOpenChange }: CreateSpecModalProps) {
    const user = useSelector((state: any) => state.auth.user);
    const orgId = user?.orgId || "";
    const { mutate: createSpec, isPending } = useCreateSpec();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "prd",
            content: "# New Specification\n\nWrite your spec here...",
            entity_type: "project",
            entity_id: "", // TODO: Allow selecting project
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createSpec({
            ...values,
            content: values.content || "",
            entity_type: values.entity_type || "project",
            entity_id: values.entity_id || "global", // Default to global if not selected
        }, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Specification</DialogTitle>
                    <DialogDescription>
                        Create a new technical document or PRD.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Authentication System Redesign" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="prd">PRD</SelectItem>
                                                <SelectItem value="technical_spec">Technical Spec</SelectItem>
                                                <SelectItem value="design_doc">Design Doc</SelectItem>
                                                <SelectItem value="api_doc">API Doc</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Content</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-20 resize-none" placeholder="Brief summary..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Spec
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
