import api from './client';
import type {
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    Reaction,
    AddReactionRequest,
    RemoveReactionRequest,
    ReactionSummary,
} from '../types/interaction';

// ============================================================================
// COMMENTS API
// ============================================================================

export const commentsApi = {
    list: async (entityType: string, entityId: string): Promise<Comment[]> => {
        const response = await api.get<Comment[]>(
            `/comments?entity_type=${entityType}&entity_id=${entityId}`
        );
        return response.data;
    },

    get: async (id: string): Promise<Comment> => {
        const response = await api.get<Comment>(`/comments/${id}`);
        return response.data;
    },

    create: async (data: CreateCommentRequest): Promise<Comment> => {
        const response = await api.post<Comment>('/comments', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCommentRequest): Promise<void> => {
        await api.put(`/comments/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/comments/${id}`);
    },

    getRecent: async (): Promise<Comment[]> => {
        const response = await api.get<Comment[]>('/activity/comments'); // Matching updated backend route
        return response.data;
    },
};

// ============================================================================
// REACTIONS API
// ============================================================================

export const reactionsApi = {
    list: async (entityType: string, entityId: string): Promise<Reaction[]> => {
        const response = await api.get<Reaction[]>(
            `/reactions?entity_type=${entityType}&entity_id=${entityId}`
        );
        return response.data;
    },

    add: async (data: AddReactionRequest): Promise<Reaction> => {
        const response = await api.post<Reaction>('/reactions', data);
        return response.data;
    },

    remove: async (data: RemoveReactionRequest): Promise<void> => {
        const params = new URLSearchParams({
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            emoji: data.emoji,
        });
        await api.delete(`/reactions?${params.toString()}`);
    },

    getSummary: async (entityType: string, entityId: string): Promise<ReactionSummary[]> => {
        const response = await api.get<ReactionSummary[]>(
            `/reactions/summary?entity_type=${entityType}&entity_id=${entityId}`
        );
        return response.data;
    },
};

export const interactionApi = {
    comments: commentsApi,
    reactions: reactionsApi,
};
