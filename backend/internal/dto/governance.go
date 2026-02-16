package dto

import "time"

// ============================================================================
// USER INFO (Shared)
// ============================================================================

type UserInfo struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

// ============================================================================
// CUSTODY CHAIN DTOs
// ============================================================================

type CustodyTransferRequest struct {
	EntityType string `json:"entity_type" validate:"required"`
	EntityID   string `json:"entity_id" validate:"required,uuid"`
	NewOwnerID string `json:"new_owner_id" validate:"required,uuid"`
	Reason     string `json:"reason"`
}

type CustodyHistoryResponse struct {
	ID            string    `json:"id"`
	EntityType    string    `json:"entity_type"`
	EntityID      string    `json:"entity_id"`
	PreviousOwner *UserInfo `json:"previous_owner,omitempty"`
	NewOwner      UserInfo  `json:"new_owner"`
	TransferredAt time.Time `json:"transferred_at"`
	Reason        string    `json:"reason,omitempty"`
}

// ============================================================================
// ACCESS GRANTS DTOs (Simplified)
// ============================================================================

type CreateAccessGrantRequest struct {
	EntityType      string `json:"entity_type" validate:"required"`
	EntityID        string `json:"entity_id" validate:"required,uuid"`
	UserID          string `json:"user_id" validate:"required,uuid"`
	PermissionLevel string `json:"permission_level" validate:"required,oneof=read write admin"`
}

type AccessGrantResponse struct {
	ID              string    `json:"id"`
	EntityType      string    `json:"entity_type"`
	EntityID        string    `json:"entity_id"`
	User            UserInfo  `json:"user"`
	PermissionLevel string    `json:"permission_level"`
	GrantedAt       time.Time `json:"granted_at"`
	GrantedBy       *UserInfo `json:"granted_by,omitempty"`
}
