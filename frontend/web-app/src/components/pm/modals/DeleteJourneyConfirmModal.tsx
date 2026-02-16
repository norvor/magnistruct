"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteJourneyConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    journeyName?: string;
}

export function DeleteJourneyConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
    journeyName,
}: DeleteJourneyConfirmModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[440px] border-border bg-background/95 backdrop-blur-xl">
                <AlertDialogHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-2">
                        <Trash2 className="h-6 w-6 text-red-500" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold">Delete Journey</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Are you sure you want to delete <span className="text-foreground font-medium">{journeyName || "this journey"}</span>?
                        All associated 'how' actions will be moved to the backlog. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="bg-muted border-border hover:bg-muted/80 transition-colors"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Journey"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
