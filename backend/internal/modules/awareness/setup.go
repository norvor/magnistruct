package awareness

import (
	"fmt"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
)

func Init() {
	fmt.Println("✅ Awareness Module: Ready (Notifications, Audit Logs, Analytics)")
}

func SetupRoutes() func(chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.Middleware)

		// Notifications
		r.Get("/notifications", HandleListNotifications)
		r.Get("/notifications/unread-count", HandleGetUnreadCount)
		r.Put("/notifications/{id}/read", HandleMarkNotificationRead)
		r.Put("/notifications/read-all", HandleMarkAllRead)

		// Audit Logs
		r.Get("/audit-logs", HandleListAuditLogs)

		// Analytics
		r.Get("/analytics", HandleGetAnalytics)
	}
}
