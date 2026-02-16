package dto

import "time"

// ============================================================================
// INTERACTION LAYER - Comments
// ============================================================================

type CreateCommentRequest struct {
	EntityType string `json:"entity_type" validate:"required"`
	EntityID   string `json:"entity_id" validate:"required"`
	Content    string `json:"content" validate:"required,min=1"`
}

type UpdateCommentRequest struct {
	Content *string `json:"content" validate:"omitempty,min=1"`
}

type CommentResponse struct {
	ID         string    `json:"id"`
	EntityType string    `json:"entity_type"`
	EntityID   string    `json:"entity_id"`
	UserID     string    `json:"user_id"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	// Joined user info
	UserName  string `json:"user_name,omitempty"`
	UserEmail string `json:"user_email,omitempty"`
}

// ============================================================================
// INTERACTION LAYER - Reactions
// ============================================================================

type AddReactionRequest struct {
	EntityType string `json:"entity_type" validate:"required"`
	EntityID   string `json:"entity_id" validate:"required"`
	Emoji      string `json:"emoji" validate:"required"`
}

type ReactionResponse struct {
	ID         string    `json:"id"`
	EntityType string    `json:"entity_type"`
	EntityID   string    `json:"entity_id"`
	UserID     string    `json:"user_id"`
	Emoji      string    `json:"emoji"`
	CreatedAt  time.Time `json:"created_at"`
	UserName   string    `json:"user_name,omitempty"`
}

type ReactionSummary struct {
	Emoji     string   `json:"emoji"`
	Count     int      `json:"count"`
	UserNames []string `json:"user_names"`
}
