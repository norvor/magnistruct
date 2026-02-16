// Interaction Module TypeScript Types
// Matching backend DTOs from internal/dto/interaction.go

export interface Comment {
    id: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    // Joined user info
    user_name?: string;
    user_email?: string;
}

export interface CreateCommentRequest {
    entity_type: string;
    entity_id: string;
    content: string;
}

export interface UpdateCommentRequest {
    content?: string;
}

export interface Reaction {
    id: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    user_name?: string;
}

export interface AddReactionRequest {
    entity_type: string;
    entity_id: string;
    emoji: string;
}

export interface RemoveReactionRequest {
    entity_type: string;
    entity_id: string;
    emoji: string;
}

export interface ReactionSummary {
    emoji: string;
    count: number;
    user_names: string[];
}
