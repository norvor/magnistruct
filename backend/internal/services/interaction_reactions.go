package services

import (
	"context"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// ============================================================================
// REACTIONS SERVICE
// ============================================================================

// AddReaction adds an emoji reaction to an entity or comment
func AddReaction(ctx context.Context, req dto.AddReactionRequest, userID string) (*dto.ReactionResponse, error) {
	var reactionID string
	query := `
		INSERT INTO sys_reactions (entity_type, entity_id, user_id, emoji)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (entity_type, entity_id, user_id, emoji) DO NOTHING
		RETURNING id
	`

	err := database.DB.QueryRow(ctx, query, req.EntityType, req.EntityID, userID, req.Emoji).Scan(&reactionID)
	if err != nil {
		// Check if it's a conflict (already exists)
		// If so, just return the existing reaction
		return GetUserReaction(ctx, req.EntityType, req.EntityID, userID, req.Emoji)
	}

	return GetReactionByID(ctx, reactionID)
}

// RemoveReaction removes a user's reaction
func RemoveReaction(ctx context.Context, entityType, entityID, emoji, userID string) error {
	query := `DELETE FROM sys_reactions WHERE entity_type = $1 AND entity_id = $2 AND user_id = $3 AND emoji = $4`
	result, err := database.DB.Exec(ctx, query, entityType, entityID, userID, emoji)
	
	if err != nil {
		return fmt.Errorf("failed to remove reaction: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("reaction not found")
	}

	return nil
}

// ListReactions returns all reactions for an entity
func ListReactions(ctx context.Context, entityType, entityID string) ([]dto.ReactionResponse, error) {
	query := `
		SELECT r.id, r.entity_type, r.entity_id, r.user_id, r.emoji, r.created_at,
		       u.full_name
		FROM sys_reactions r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.entity_type = $1 AND r.entity_id = $2
		ORDER BY r.created_at ASC
	`

	rows, err := database.DB.Query(ctx, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to list reactions: %w", err)
	}
	defer rows.Close()

	reactions := []dto.ReactionResponse{}
	for rows.Next() {
		var r dto.ReactionResponse
		err := rows.Scan(&r.ID, &r.EntityType, &r.EntityID, &r.UserID, &r.Emoji, &r.CreatedAt, &r.UserName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reaction: %w", err)
		}
		reactions = append(reactions, r)
	}

	return reactions, nil
}

// GetReactionSummary returns aggregated reaction counts per emoji
func GetReactionSummary(ctx context.Context, entityType, entityID string) ([]dto.ReactionSummary, error) {
	query := `
		SELECT r.emoji, COUNT(*) as count, ARRAY_AGG(u.full_name) as user_names
		FROM sys_reactions r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.entity_type = $1 AND r.entity_id = $2
		GROUP BY r.emoji
		ORDER BY count DESC
	`

	rows, err := database.DB.Query(ctx, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reaction summary: %w", err)
	}
	defer rows.Close()

	summaries := []dto.ReactionSummary{}
	for rows.Next() {
		var s dto.ReactionSummary
		err := rows.Scan(&s.Emoji, &s.Count, &s.UserNames)
		if err != nil {
			return nil, fmt.Errorf("failed to scan summary: %w", err)
		}
		summaries = append(summaries, s)
	}

	return summaries, nil
}

// GetReactionByID returns a single reaction
func GetReactionByID(ctx context.Context, reactionID string) (*dto.ReactionResponse, error) {
	query := `
		SELECT r.id, r.entity_type, r.entity_id, r.user_id, r.emoji, r.created_at, u.full_name
		FROM sys_reactions r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.id = $1
	`

	var r dto.ReactionResponse
	err := database.DB.QueryRow(ctx, query, reactionID).Scan(
		&r.ID, &r.EntityType, &r.EntityID, &r.UserID, &r.Emoji, &r.CreatedAt, &r.UserName,
	)

	if err != nil {
		return nil, fmt.Errorf("reaction not found: %w", err)
	}

	return &r, nil
}

// GetUserReaction gets a specific user's reaction
func GetUserReaction(ctx context.Context, entityType, entityID, userID, emoji string) (*dto.ReactionResponse, error) {
	query := `
		SELECT r.id, r.entity_type, r.entity_id, r.user_id, r.emoji, r.created_at, u.full_name
		FROM sys_reactions r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.entity_type = $1 AND r.entity_id = $2 AND r.user_id = $3 AND r.emoji = $4
	`

	var r dto.ReactionResponse
	err := database.DB.QueryRow(ctx, query, entityType, entityID, userID, emoji).Scan(
		&r.ID, &r.EntityType, &r.EntityID, &r.UserID, &r.Emoji, &r.CreatedAt, &r.UserName,
	)

	if err != nil {
		return nil, fmt.Errorf("reaction not found: %w", err)
	}

	return &r, nil
}
