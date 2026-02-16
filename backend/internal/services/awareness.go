package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// ============================================================================
// NOTIFICATIONS SERVICE
// ============================================================================

// CreateNotification creates a new notification for a user
func CreateNotification(ctx context.Context, req dto.CreateNotificationRequest) (*dto.NotificationResponse, error) {
	notifType := "info"
	if req.Type != "" {
		notifType = req.Type
	}

	var notifID string
	query := `
		INSERT INTO sys_notifications (user_id, title, content, type, link)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := database.DB.QueryRow(ctx, query, req.UserID, req.Title, req.Content, notifType, req.Link).Scan(&notifID)
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	return GetNotification(ctx, notifID)
}

// ListUserNotifications returns all notifications for a user
func ListUserNotifications(ctx context.Context, userID string, unreadOnly bool) ([]dto.NotificationResponse, error) {
	query := `
		SELECT id, user_id, title, content, type, link, is_read, created_at
		FROM sys_notifications
		WHERE user_id = $1
	`

	if unreadOnly {
		query += " AND is_read = FALSE"
	}

	query += " ORDER BY created_at DESC LIMIT 50"

	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list notifications: %w", err)
	}
	defer rows.Close()

	notifications := []dto.NotificationResponse{}
	for rows.Next() {
		var n dto.NotificationResponse
		err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Content, &n.Type, &n.Link, &n.IsRead, &n.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}
		notifications = append(notifications, n)
	}

	return notifications, nil
}

// GetNotification returns a single notification
func GetNotification(ctx context.Context, notifID string) (*dto.NotificationResponse, error) {
	query := `SELECT id, user_id, title, content, type, link, is_read, created_at FROM sys_notifications WHERE id = $1`

	var n dto.NotificationResponse
	err := database.DB.QueryRow(ctx, query, notifID).Scan(
		&n.ID, &n.UserID, &n.Title, &n.Content, &n.Type, &n.Link, &n.IsRead, &n.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("notification not found: %w", err)
	}

	return &n, nil
}

// MarkNotificationRead marks a notification as read
func MarkNotificationRead(ctx context.Context, notifID, userID string) error {
	query := `UPDATE sys_notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`
	result, err := database.DB.Exec(ctx, query, notifID, userID)

	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// MarkAllNotificationsRead marks all user notifications as read
func MarkAllNotificationsRead(ctx context.Context, userID string) error {
	query := `UPDATE sys_notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`
	_, err := database.DB.Exec(ctx, query, userID)
	return err
}

// GetUnreadCount returns the count of unread notifications
func GetUnreadCount(ctx context.Context, userID string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM sys_notifications WHERE user_id = $1 AND is_read = FALSE`
	err := database.DB.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

// ============================================================================
// AUDIT LOGS SERVICE
// ============================================================================

// CreateAuditLog creates a new audit log entry
func CreateAuditLog(ctx context.Context, req dto.CreateAuditLogRequest) error {
	changesJSON, err := json.Marshal(req.Changes)
	if err != nil {
		changesJSON = []byte("{}")
	}

	query := `
		INSERT INTO sys_audit_logs (user_id, action, entity_type, entity_id, changes)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err = database.DB.Exec(ctx, query, req.UserID, req.Action, req.EntityType, req.EntityID, changesJSON)
	return err
}

// ListAuditLogs returns audit logs with optional filters
func ListAuditLogs(ctx context.Context, userID, entityType, entityID string) ([]dto.AuditLogResponse, error) {
	baseQuery := `
		SELECT a.id, a.user_id, a.action, a.entity_type, a.entity_id, a.changes, a.performed_at,
		       u.full_name
		FROM sys_audit_logs a
		LEFT JOIN sys_users u ON u.id = a.user_id
		WHERE a.user_id = $1
	`

	args := []interface{}{userID}
	argNum := 2

	if entityType != "" {
		baseQuery += fmt.Sprintf(" AND a.entity_type = $%d", argNum)
		args = append(args, entityType)
		argNum++
	}

	if entityID != "" {
		baseQuery += fmt.Sprintf(" AND a.entity_id = $%d", argNum)
		args = append(args, entityID)
	}

	baseQuery += " ORDER BY a.performed_at DESC LIMIT 100"

	rows, err := database.DB.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list audit logs: %w", err)
	}
	defer rows.Close()

	logs := []dto.AuditLogResponse{}
	for rows.Next() {
		var log dto.AuditLogResponse
		var changesJSON []byte

		err := rows.Scan(&log.ID, &log.UserID, &log.Action, &log.EntityType, &log.EntityID, &changesJSON, &log.PerformedAt, &log.UserName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan audit log: %w", err)
		}

		// Parse changes JSON
		if changesJSON != nil {
			json.Unmarshal(changesJSON, &log.Changes)
		}

		logs = append(logs, log)
	}

	return logs, nil
}
