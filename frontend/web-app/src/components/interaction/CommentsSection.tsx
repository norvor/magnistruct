"use client";

import { useState } from "react";
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/lib/hooks/useInteraction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare, Loader2, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionCluster } from "./ReactionCluster";
import { useSelector } from "react-redux";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CommentsSectionProps {
    entityType: string;
    entityId: string;
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
    const user = useSelector((state: any) => state.auth.user);
    const { data: comments, isLoading } = useComments(entityType, entityId);
    const createCommentMutation = useCreateComment();
    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();

    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await createCommentMutation.mutateAsync({
                entity_type: entityType,
                entity_id: entityId,
                content: newComment,
            });
            setNewComment("");
        } catch (error) {
            // Error handled by hook
        }
    };


    const handleUpdate = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            await updateCommentMutation.mutateAsync({
                id,
                data: { content: editContent }
            });
            setEditingCommentId(null);
        } catch (error) { }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await deleteCommentMutation.mutateAsync(id);
        } catch (error) { }
    };

    const startEditing = (id: string, content: string) => {
        setEditingCommentId(id);
        setEditContent(content);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3>Discussion</h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
                        {comments?.length || 0}
                    </span>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading conversation...</p>
                    </div>
                ) : !comments || comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <MessageSquare className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No comments yet</p>
                        <p className="text-xs text-muted-foreground/60">Start the discussion below</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="group relative flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <UserAvatar
                                    user={{ name: comment.user_name || "User" }}
                                    size="md"
                                    className="mt-1 shadow-sm ring-1 ring-border/50"
                                />
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-sm font-bold truncate">
                                                {comment.user_name || "Unknown User"}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {user?.id === comment.user_id && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Popover
                                                    align="end"
                                                    content={
                                                        <div className="p-1 min-w-[120px]">
                                                            <button
                                                                onClick={() => startEditing(comment.id, comment.content)}
                                                                className="flex items-center w-full gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                                                            >
                                                                <Pencil className="h-3 w-3" /> Edit Comment
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(comment.id)}
                                                                className="flex items-center w-full gap-2 px-2 py-1.5 text-xs rounded hover:bg-destructive/10 text-destructive transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Delete
                                                            </button>
                                                        </div>
                                                    }
                                                >
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </Popover>
                                            </div>
                                        )}
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="min-h-[100px] text-sm bg-background ring-1 ring-primary/20"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>
                                                    <X className="mr-1.5 h-3 w-3" /> Cancel
                                                </Button>
                                                <Button size="sm" onClick={() => handleUpdate(comment.id)} disabled={updateCommentMutation.isPending}>
                                                    {updateCommentMutation.isPending ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="mr-1.5 h-3 w-3" />
                                                    )}
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[13px] text-foreground/90 leading-relaxed bg-muted/20 hover:bg-muted/40 transition-colors p-4 rounded-2xl rounded-tl-none border border-border/40 shadow-sm">
                                            {comment.content}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pl-1">
                                        <ReactionCluster entityType="comment" entityId={comment.id} />
                                        <ReactionPicker entityType="comment" entityId={comment.id} />
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors">
                                            Reply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator className="bg-border/40" />

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-4 items-start pt-2">
                <UserAvatar user={{ name: user?.fullName || "You" }} size="md" className="mt-1 shadow-sm ring-1 ring-primary/20" />
                <div className="flex-1 space-y-3">
                    <div className="relative group transition-all duration-300">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts or update the team..."
                            className="min-h-[100px] text-sm bg-muted/5 focus:bg-background border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-xl resize-none"
                            disabled={createCommentMutation.isPending}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-2">
                            <Button
                                type="submit"
                                disabled={!newComment.trim() || createCommentMutation.isPending}
                                size="sm"
                                className="rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                                {createCommentMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-3.5 w-3.5" />
                                        Comment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 px-1 font-medium">
                        Markdown is supported. Press <kbd className="font-sans border bg-muted px-1 rounded text-[9px]">Enter</kbd> to send quickly.
                    </p>
                </div>
            </form>
        </div>
    );
}

