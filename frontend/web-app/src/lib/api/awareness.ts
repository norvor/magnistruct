import api from './client';
import type {
    Notification,
    AuditLog,
    UnreadCountResponse,
} from '../types/awareness';

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsApi = {
    list: async (unreadOnly: boolean = false): Promise<Notification[]> => {
        const response = await api.get<Notification[]>(
            `/awareness/notifications?unread=${unreadOnly}`
        );
        return response.data;
    },

    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await api.get<UnreadCountResponse>('/awareness/notifications/unread-count');
        return response.data;
    },

    markRead: async (id: string): Promise<void> => {
        await api.put(`/awareness/notifications/${id}/read`);
    },

    markAllRead: async (): Promise<void> => {
        await api.put('/awareness/notifications/read-all');
    },
};

// ============================================================================
// AUDIT LOGS API
// ============================================================================

export const auditLogsApi = {
    list: async (entityType?: string, entityId?: string): Promise<AuditLog[]> => {
        const params = new URLSearchParams();
        if (entityType) params.append('entity_type', entityType);
        if (entityId) params.append('entity_id', entityId);

        const response = await api.get<AuditLog[]>(`/awareness/audit-logs${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
    get: async (): Promise<Record<string, any>> => {
        const response = await api.get<Record<string, any>>('/awareness/analytics');
        return response.data;
    },
};

export const awarenessApi = {
    notifications: notificationsApi,
    auditLogs: auditLogsApi,
    analytics: analyticsApi,
};
