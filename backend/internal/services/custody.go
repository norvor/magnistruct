package services

import (
	"context"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// TransferOwnership creates a custody record for ownership transfer
// Note: This only creates the audit record. Updating the actual entity's owner
// field must be done separately in the entity's service layer.
func TransferOwnership(ctx context.Context, req dto.CustodyTransferRequest, currentUserID string) error {
	// TODO: Add validation that currentUserID owns the entity
	// This requires querying the entity table dynamically based on entity_type
	
	// For now, insert custody record
	// The previous_owner_id should be fetched from the entity, but we'll simplify for now
	query := `
		INSERT INTO sys_custody_chain (entity_type, entity_id, previous_owner_id, new_owner_id, reason)
		VALUES ($1, $2, $3, $4, $5)
	`
	
	_, err := database.DB.Exec(ctx, query,
		req.EntityType,
		req.EntityID,
		currentUserID, // Assuming current user is previous owner
		req.NewOwnerID,
		req.Reason)
	
	if err != nil {
		return fmt.Errorf("failed to create custody record: %w", err)
	}

	return nil
}

// GetCustodyHistory returns the ownership history for an entity
func GetCustodyHistory(ctx context.Context, entityType, entityID, userID string) ([]dto.CustodyHistoryResponse, error) {
	// TODO: Add access check - verify user has permission to view this entity
	
	query := `
		SELECT 
			c.id,
			c.entity_type,
			c.entity_id,
			c.transferred_at,
			c.reason,
			prev.id as prev_id,
			prev.email as prev_email,
			prev.full_name as prev_full_name,
			new.id as new_id,
			new.email as new_email,
			new.full_name as new_full_name
		FROM sys_custody_chain c
		LEFT JOIN sys_users prev ON prev.id = c.previous_owner_id
		JOIN sys_users new ON new.id = c.new_owner_id
		WHERE c.entity_type = $1 AND c.entity_id = $2
		ORDER BY c.transferred_at DESC
	`

	rows, err := database.DB.Query(ctx, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to query custody history: %w", err)
	}
	defer rows.Close()

	history := []dto.CustodyHistoryResponse{}
	for rows.Next() {
		var h dto.CustodyHistoryResponse
		var prevID, prevEmail, prevFullName *string
		var newID, newEmail, newFullName string

		err := rows.Scan(
			&h.ID,
			&h.EntityType,
			&h.EntityID,
			&h.TransferredAt,
			&h.Reason,
			&prevID, &prevEmail, &prevFullName,
			&newID, &newEmail, &newFullName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan custody record: %w", err)
		}

		// Set previous owner if exists
		if prevID != nil {
			h.PreviousOwner = &dto.UserInfo{
				ID:       *prevID,
				Email:    *prevEmail,
				FullName: *prevFullName,
			}
		}

		// Set new owner
		h.NewOwner = dto.UserInfo{
			ID:       newID,
			Email:    newEmail,
			FullName: newFullName,
		}

		history = append(history, h)
	}

	return history, nil
}
