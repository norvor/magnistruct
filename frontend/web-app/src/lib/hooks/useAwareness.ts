import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { awarenessApi } from '../api/awareness';
import { toast } from 'sonner';

// ============================================================================
// NOTIFICATIONS HOOKS
// ============================================================================

export function useNotifications(unreadOnly: boolean = false) {
    return useQuery({
        queryKey: ['notifications', unreadOnly],
        queryFn: () => awarenessApi.notifications.list(unreadOnly),
        // Refetch often for notifications
        refetchInterval: 30000,
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: awarenessApi.notifications.getUnreadCount,
        refetchInterval: 30000,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => awarenessApi.notifications.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
        onError: () => toast.error('Failed to mark as read'),
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: awarenessApi.notifications.markAllRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            toast.success('All notifications marked as read');
        },
        onError: () => toast.error('Failed to mark all as read'),
    });
}

// ============================================================================
// AUDIT LOGS HOOKS
// ============================================================================

export function useAuditLogs(orgId: string, entityType?: string, entityId?: string) {
    return useQuery({
        queryKey: ['audit-logs', orgId, entityType, entityId],
        queryFn: () => awarenessApi.auditLogs.list(entityType, entityId),
        enabled: !!orgId,
    });
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useAnalytics(orgId: string) {
    return useQuery({
        queryKey: ['analytics', orgId],
        queryFn: () => awarenessApi.analytics.get(),
        enabled: !!orgId,
    });
}
