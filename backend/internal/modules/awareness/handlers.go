package awareness

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// ============================================================================
// NOTIFICATIONS HANDLERS
// ============================================================================

// HandleListNotifications returns user's notifications
func HandleListNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	unreadOnly := r.URL.Query().Get("unread") == "true"

	notifications, err := services.ListUserNotifications(r.Context(), userID, unreadOnly)
	if err != nil {
		http.Error(w, `{"error":"Failed to list notifications"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// HandleGetUnreadCount returns count of unread notifications
func HandleGetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	count, err := services.GetUnreadCount(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to get count"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"unread_count": count})
}

// HandleMarkNotificationRead marks a notification as read
func HandleMarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	notifID := chi.URLParam(r, "id")

	err := services.MarkNotificationRead(r.Context(), notifID, userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to mark as read"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// HandleMarkAllRead marks all notifications as read
func HandleMarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	err := services.MarkAllNotificationsRead(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to mark all as read"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// ============================================================================
// AUDIT LOGS HANDLERS
// ============================================================================

// HandleListAuditLogs returns audit logs for the current user
func HandleListAuditLogs(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")

	logs, err := services.ListAuditLogs(r.Context(), userID, entityType, entityID)
	if err != nil {
		http.Error(w, `{"error":"Failed to get audit logs"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

// HandleGetAnalytics returns basic analytics overview for the user
func HandleGetAnalytics(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	stats := map[string]interface{}{
		"user_id": userID,
		"message": "Analytics overview",
		"available_metrics": []string{
			"productivity_score",
			"habit_consistency",
			"goal_progress",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
