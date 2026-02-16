package dto

import "time"

// ============================================================================
// AWARENESS LAYER - Notifications
// ============================================================================

type CreateNotificationRequest struct {
	UserID  string `json:"user_id" validate:"required"`
	Title   string `json:"title" validate:"required"`
	Content string `json:"content" validate:"required"`
	Type    string `json:"type,omitempty"` // info, success, warning, error
	Link    string `json:"link,omitempty"`
}

type NotificationResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Type      string    `json:"type"`
	Link      string    `json:"link,omitempty"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

// ============================================================================
// AWARENESS LAYER - Audit Logs
// ============================================================================

type CreateAuditLogRequest struct {
	UserID     string                 `json:"user_id"`
	Action     string                 `json:"action"` // create, update, delete
	EntityType string                 `json:"entity_type"`
	EntityID   string                 `json:"entity_id"`
	Changes    map[string]interface{} `json:"changes,omitempty"`
}

type AuditLogResponse struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	Action      string                 `json:"action"`
	EntityType  string                 `json:"entity_type"`
	EntityID    string                 `json:"entity_id"`
	Changes     map[string]interface{} `json:"changes,omitempty"`
	PerformedAt time.Time              `json:"performed_at"`
	// Joined fields
	UserName string `json:"user_name,omitempty"`
}
