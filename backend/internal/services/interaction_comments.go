package services

import (
	"context"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// ============================================================================
// COMMENTS SERVICE
// ============================================================================

// CreateComment creates a new comment on an entity
func CreateComment(ctx context.Context, req dto.CreateCommentRequest, userID string) (*dto.CommentResponse, error) {
	var commentID string
	query := `
		INSERT INTO sys_comments (entity_type, entity_id, user_id, content)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := database.DB.QueryRow(ctx, query, req.EntityType, req.EntityID, userID, req.Content).Scan(&commentID)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return GetComment(ctx, commentID)
}

// ListComments returns all comments for a specific entity
func ListComments(ctx context.Context, entityType, entityID string) ([]dto.CommentResponse, error) {
	query := `
		SELECT c.id, c.entity_type, c.entity_id, c.user_id, c.content, c.created_at, c.updated_at,
		       u.full_name, u.email
		FROM sys_comments c
		LEFT JOIN sys_users u ON u.id = c.user_id
		WHERE c.entity_type = $1 AND c.entity_id = $2
		ORDER BY c.created_at ASC
	`

	rows, err := database.DB.Query(ctx, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}
	defer rows.Close()

	comments := []dto.CommentResponse{}
	for rows.Next() {
		var c dto.CommentResponse
		err := rows.Scan(&c.ID, &c.EntityType, &c.EntityID, &c.UserID, &c.Content, &c.CreatedAt, &c.UpdatedAt, &c.UserName, &c.UserEmail)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}
		comments = append(comments, c)
	}

	return comments, nil
}

// GetComment returns a single comment by ID
func GetComment(ctx context.Context, commentID string) (*dto.CommentResponse, error) {
	query := `
		SELECT c.id, c.entity_type, c.entity_id, c.user_id, c.content, c.created_at, c.updated_at,
		       u.full_name, u.email
		FROM sys_comments c
		LEFT JOIN sys_users u ON u.id = c.user_id
		WHERE c.id = $1
	`

	var c dto.CommentResponse
	err := database.DB.QueryRow(ctx, query, commentID).Scan(
		&c.ID, &c.EntityType, &c.EntityID, &c.UserID, &c.Content, &c.CreatedAt, &c.UpdatedAt, &c.UserName, &c.UserEmail,
	)

	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}

	return &c, nil
}

// UpdateComment updates a comment's content
func UpdateComment(ctx context.Context, commentID string, req dto.UpdateCommentRequest, userID string) error {
	if req.Content == nil {
		return nil
	}

	query := `UPDATE sys_comments SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`
	result, err := database.DB.Exec(ctx, query, *req.Content, commentID, userID)
	
	if err != nil {
		return fmt.Errorf("failed to update comment: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("comment not found or access denied")
	}

	return nil
}

// DeleteComment deletes a comment
func DeleteComment(ctx context.Context, commentID, userID string) error {
	query := `DELETE FROM sys_comments WHERE id = $1 AND user_id = $2`
	result, err := database.DB.Exec(ctx, query, commentID, userID)
	
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("comment not found or access denied")
	}

	return nil
}

// GetRecentComments returns recent comments across all users
func GetRecentComments(ctx context.Context, limit int) ([]dto.CommentResponse, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	query := `
		SELECT c.id, c.entity_type, c.entity_id, c.user_id, c.content, c.created_at, c.updated_at,
		       u.full_name, u.email
		FROM sys_comments c
		LEFT JOIN sys_users u ON u.id = c.user_id
		ORDER BY c.created_at DESC
		LIMIT $1
	`

	rows, err := database.DB.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent comments: %w", err)
	}
	defer rows.Close()

	comments := []dto.CommentResponse{}
	for rows.Next() {
		var c dto.CommentResponse
		err := rows.Scan(&c.ID, &c.EntityType, &c.EntityID, &c.UserID, &c.Content, &c.CreatedAt, &c.UpdatedAt, &c.UserName, &c.UserEmail)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}
		comments = append(comments, c)
	}

	return comments, nil
}
