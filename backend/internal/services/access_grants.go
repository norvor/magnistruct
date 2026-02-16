package services

import (
	"context"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateAccessGrant grants permission to a user for an entity
func CreateAccessGrant(ctx context.Context, req dto.CreateAccessGrantRequest, grantedByUserID string) (*dto.AccessGrantResponse, error) {
	// TODO: Verify requesting user is owner or admin of entity
	
	var grantID string
	query := `
		INSERT INTO sys_access_grants (entity_type, entity_id, user_id, permission_level, granted_by)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	
	err := database.DB.QueryRow(ctx, query,
		req.EntityType,
		req.EntityID,
		req.UserID,
		req.PermissionLevel,
		grantedByUserID).Scan(&grantID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create access grant: %w", err)
	}

	// Return the created grant
	grants, err := ListAccessGrants(ctx, req.EntityType, req.EntityID, grantedByUserID)
	if err != nil {
		return nil, err
	}

	// Find and return the newly created grant
	for _, grant := range grants {
		if grant.ID == grantID {
			return &grant, nil
		}
	}

	return nil, fmt.Errorf("grant created but not found")
}

// ListAccessGrants returns all grants for an entity
func ListAccessGrants(ctx context.Context, entityType, entityID, userID string) ([]dto.AccessGrantResponse, error) {
	// TODO: Verify user has access to view grants for this entity
	
	query := `
		SELECT 
			g.id,
			g.entity_type,
			g.entity_id,
			g.permission_level,
			g.granted_at,
			u.id as user_id,
			u.email as user_email,
			u.full_name as user_full_name,
			granter.id as granter_id,
			granter.email as granter_email,
			granter.full_name as granter_full_name
		FROM sys_access_grants g
		JOIN sys_users u ON u.id = g.user_id
		LEFT JOIN sys_users granter ON granter.id = g.granted_by
		WHERE g.entity_type = $1 AND g.entity_id = $2
		ORDER BY g.granted_at DESC
	`

	rows, err := database.DB.Query(ctx, query, entityType, entityID)
	if err != nil {
		return nil, fmt.Errorf("failed to query access grants: %w", err)
	}
	defer rows.Close()

	grants := []dto.AccessGrantResponse{}
	for rows.Next() {
		var g dto.AccessGrantResponse
		var userID, userEmail, userFullName string
		var granterID, granterEmail, granterFullName *string

		err := rows.Scan(
			&g.ID,
			&g.EntityType,
			&g.EntityID,
			&g.PermissionLevel,
			&g.GrantedAt,
			&userID, &userEmail, &userFullName,
			&granterID, &granterEmail, &granterFullName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan grant: %w", err)
		}

		g.User = dto.UserInfo{
			ID:       userID,
			Email:    userEmail,
			FullName: userFullName,
		}

		if granterID != nil {
			g.GrantedBy = &dto.UserInfo{
				ID:       *granterID,
				Email:    *granterEmail,
				FullName: *granterFullName,
			}
		}

		grants = append(grants, g)
	}

	return grants, nil
}

// RevokeAccessGrant removes an access grant
func RevokeAccessGrant(ctx context.Context, grantID, userID string) error {
	// TODO: Verify user is owner or granter
	
	query := `DELETE FROM sys_access_grants WHERE id = $1`
	result, err := database.DB.Exec(ctx, query, grantID)
	if err != nil {
		return fmt.Errorf("failed to revoke grant: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("grant not found")
	}

	return nil
}

// CheckAccess checks if a user has permission to an entity
func CheckAccess(ctx context.Context, entityType, entityID, userID, requiredPermission string) bool {
	// Check if user has an access grant
	query := `
		SELECT permission_level 
		FROM sys_access_grants 
		WHERE entity_type = $1 AND entity_id = $2 AND user_id = $3
	`
	
	var permissionLevel string
	err := database.DB.QueryRow(ctx, query, entityType, entityID, userID).Scan(&permissionLevel)
	if err != nil {
		// No grant found
		return false
	}

	// Check if permission level is sufficient
	permissionHierarchy := map[string]int{
		"read":  1,
		"write": 2,
		"admin": 3,
	}

	granted := permissionHierarchy[permissionLevel]
	required := permissionHierarchy[requiredPermission]

	return granted >= required
}
