"use client";

import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks/useAwareness";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCheck, Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationList() {
    const { data: notifications, isLoading } = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    // Sort: Unread first, then by date
    const sortedNotifications = notifications?.slice().sort((a, b) => {
        if (a.is_read === b.is_read) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.is_read ? 1 : -1;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>;
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="w-80 sm:w-96">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => markAllRead.mutate()}
                >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Mark all read
                </Button>
            </div>
            <ScrollArea className="h-[300px]">
                <div className="flex flex-col">
                    {sortedNotifications?.map((notification) => (
                        <div
                            key={notification.id}
                            className={cn(
                                "flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                                !notification.is_read && "bg-muted/30"
                            )}
                            onClick={() => !notification.is_read && markRead.mutate(notification.id)}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className={cn("text-sm leading-tight", !notification.is_read && "font-medium")}>
                                    {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.content}
                                </p>
                                <p className="text-[10px] text-muted-foreground pt-1">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            {!notification.is_read && (
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
