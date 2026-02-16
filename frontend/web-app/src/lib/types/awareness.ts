// Awareness Module TypeScript Types
// Matching backend DTOs from internal/dto/awareness.go

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    is_read: boolean;
    created_at: string;
}

export interface CreateNotificationRequest {
    user_id: string;
    title: string;
    content: string;
    type?: string;
    link?: string;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    changes?: Record<string, any>;
    performed_at: string;
    // Joined fields
    user_name?: string;
}

export interface CreateAuditLogRequest {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    changes?: Record<string, any>;
}

export interface UnreadCountResponse {
    unread_count: number;
}
