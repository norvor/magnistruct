import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionApi } from '../api/interaction';
import type {
    CreateCommentRequest,
    UpdateCommentRequest,
    AddReactionRequest,
    RemoveReactionRequest,
} from '../types/interaction';
import { toast } from 'sonner';

// ============================================================================
// COMMENTS HOOKS
// ============================================================================

export function useComments(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ['comments', entityType, entityId],
        queryFn: () => interactionApi.comments.list(entityType, entityId),
        enabled: !!entityType && !!entityId,
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommentRequest) => interactionApi.comments.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['comments', variables.entity_type, variables.entity_id],
            });
            toast.success('Comment added');
        },
        onError: () => {
            toast.error('Failed to add comment');
        },
    });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCommentRequest }) => interactionApi.comments.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Comment updated');
        },
        onError: () => {
            toast.error('Failed to update comment');
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => interactionApi.comments.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Comment deleted');
        },
        onError: () => {
            toast.error('Failed to delete comment');
        },
    });
}

// ============================================================================
// REACTION HOOKS
// ============================================================================

export function useReactions(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ['reactions', entityType, entityId],
        queryFn: () => interactionApi.reactions.list(entityType, entityId),
        enabled: !!entityType && !!entityId,
    });
}

export function useAddReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddReactionRequest) => interactionApi.reactions.add(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['reactions', variables.entity_type, variables.entity_id],
            });
            queryClient.invalidateQueries({
                queryKey: ['reaction-summary', variables.entity_type, variables.entity_id],
            });
        },
    });
}

export function useRemoveReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RemoveReactionRequest) => interactionApi.reactions.remove(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['reactions', variables.entity_type, variables.entity_id],
            });
            queryClient.invalidateQueries({
                queryKey: ['reaction-summary', variables.entity_type, variables.entity_id],
            });
        },
    });
}

export function useReactionSummary(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ['reaction-summary', entityType, entityId],
        queryFn: () => interactionApi.reactions.getSummary(entityType, entityId),
        enabled: !!entityType && !!entityId,
    });
}

// ============================================================================
// ACTIVITY FEED HOOKS
// ============================================================================

export function useActivityFeed(orgId: string) {
    return useQuery({
        queryKey: ['activity-feed', orgId],
        queryFn: async () => {
            const comments = await interactionApi.comments.getRecent();
            return comments.map((c: any) => ({
                id: c.id,
                type: 'comment',
                user_name: c.user_name,
                entity_type: c.entity_type,
                entity_id: c.entity_id,
                timestamp: c.created_at,
                content: c.content,
            }));
        },
        enabled: !!orgId,
    });
}
