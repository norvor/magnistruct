"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useWorkItem,
    useUpdateWorkItem,
    useDeleteWorkItem,
} from "@/lib/hooks/usePM";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    MoreVertical,
    Trash2,
    Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export default function ActionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // Data Hooks
    const { data: workItem, isLoading } = useWorkItem(id);

    // Mutation Hooks
    const updateWorkItem = useUpdateWorkItem();
    const deleteWorkItem = useDeleteWorkItem();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!workItem) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h2 className="text-xl font-semibold">Task Not Found</h2>
                <Button variant="outline" onClick={() => router.push("/dashboard/actions")}>
                    Back to Board
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteWorkItem.mutateAsync(id);
            router.push("/dashboard/actions");
        }
    };

    const handleStatusChange = (newStatus: any) => {
        updateWorkItem.mutate({
            id,
            data: { status: newStatus }
        });
    };

    const statusColors: Record<string, string> = {
        'todo': 'text-slate-400 bg-slate-500/10',
        'in_progress': 'text-blue-400 bg-blue-500/10',
        'done': 'text-emerald-400 bg-emerald-500/10',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full hover:bg-white/10 -ml-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                            <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content (Left) */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`${statusColors[workItem.status] || ''} capitalize px-3 py-1 text-xs font-semibold tracking-wide border-0`}>
                                    {workItem.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs font-mono text-muted-foreground opacity-50 uppercase tracking-widest">
                                    Action-{id.slice(0, 4)}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight tracking-tight">{workItem.title}</h1>
                        </div>

                        <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light">
                            {workItem.description ? (
                                <ReactMarkdown>{workItem.description}</ReactMarkdown>
                            ) : (
                                <p className="text-muted-foreground/50 italic text-base">No details provided for this task.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="space-y-8">
                    {/* Status Quick Toggle */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Change Status</label>
                        <div className="flex flex-col gap-2">
                            {['todo', 'in_progress', 'done'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium ${workItem.status === status
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'done' ? 'bg-emerald-500' :
                                        status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-500'
                                        }`} />
                                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Created</span>
                            <span className="text-xs text-slate-400">
                                {workItem.created_at ? format(new Date(workItem.created_at), "MMMM d, yyyy") : 'Unknown date'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Last Updated</span>
                            <span className="text-xs text-slate-400">
                                {workItem.updated_at ? formatDistanceToNow(new Date(workItem.updated_at), { addSuffix: true }) : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
