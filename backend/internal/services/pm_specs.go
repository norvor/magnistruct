package services

import (
	"context"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateSpec creates a new PM spec
func CreateSpec(ctx context.Context, req dto.CreateSpecRequest, userID string) (*dto.SpecResponse, error) {
	specType := "info"
	if req.Type != "" {
		specType = req.Type
	}
	
	version := "v1.0"
	if req.Version != "" {
		version = req.Version
	}
	
	var specID string
	query := `
		INSERT INTO pm_specs (user_id, entity_type, entity_id, title, content, type, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	
	var entityID interface{} = nil
	if req.EntityID != "" && req.EntityID != "global" {
		entityID = req.EntityID
	}

	err := database.DB.QueryRow(ctx, query,
		userID, req.EntityType, entityID, req.Title, req.Content, specType, version,
	).Scan(&specID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create spec: %w", err)
	}
	
	return GetSpec(ctx, specID)
}

// ListSpecs returns all specs for a user, optionally filtered by entity
func ListSpecs(ctx context.Context, userID string, entityType, entityID *string) ([]dto.SpecResponse, error) {
	baseQuery := `
		SELECT id, entity_type, entity_id, title, content, type, version, created_at, updated_at
		FROM pm_specs
		WHERE user_id = $1
	`
	
	args := []interface{}{userID}
	argNum := 2
	
	if entityType != nil && *entityType != "" {
		baseQuery += fmt.Sprintf(" AND entity_type = $%d", argNum)
		args = append(args, *entityType)
		argNum++
	}
	if entityID != nil && *entityID != "" {
		if *entityID == "global" {
			baseQuery += " AND entity_id IS NULL"
		} else {
			baseQuery += fmt.Sprintf(" AND entity_id = $%d", argNum)
			args = append(args, *entityID)
			argNum++
		}
	}
	
	baseQuery += " ORDER BY created_at DESC"
	
	rows, err := database.DB.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query specs: %w", err)
	}
	defer rows.Close()
	
	specs := []dto.SpecResponse{}
	for rows.Next() {
		var s dto.SpecResponse
		err := rows.Scan(
			&s.ID, &s.EntityType, &s.EntityID, &s.Title, &s.Content,
			&s.Type, &s.Version, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan spec: %w", err)
		}
		specs = append(specs, s)
	}
	
	return specs, nil
}

// GetSpec returns a single spec
func GetSpec(ctx context.Context, specID string) (*dto.SpecResponse, error) {
	query := `
		SELECT id, entity_type, entity_id, title, content, type, version, created_at, updated_at
		FROM pm_specs
		WHERE id = $1
	`
	
	var s dto.SpecResponse
	err := database.DB.QueryRow(ctx, query, specID).Scan(
		&s.ID, &s.EntityType, &s.EntityID, &s.Title, &s.Content,
		&s.Type, &s.Version, &s.CreatedAt, &s.UpdatedAt,
	)
	
	if err != nil {
		return nil, fmt.Errorf("spec not found: %w", err)
	}
	
	return &s, nil
}

// UpdateSpec updates a spec
func UpdateSpec(ctx context.Context, specID string, req dto.UpdateSpecRequest) error {
	updates := []string{}
	args := []interface{}{}
	argNum := 1
	
	if req.Title != nil {
		updates = append(updates, fmt.Sprintf("title = $%d", argNum))
		args = append(args, *req.Title)
		argNum++
	}
	if req.Content != nil {
		updates = append(updates, fmt.Sprintf("content = $%d", argNum))
		args = append(args, *req.Content)
		argNum++
	}
	if req.Type != nil {
		updates = append(updates, fmt.Sprintf("type = $%d", argNum))
		args = append(args, *req.Type)
		argNum++
	}
	if req.Version != nil {
		updates = append(updates, fmt.Sprintf("version = $%d", argNum))
		args = append(args, *req.Version)
		argNum++
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	updates = append(updates, "updated_at = NOW()")
	args = append(args, specID)
	
	query := fmt.Sprintf("UPDATE pm_specs SET %s WHERE id = $%d", 
		joinStrings(updates, ", "), argNum)
	
	_, err := database.DB.Exec(ctx, query, args...)
	return err
}

// DeleteSpec deletes a spec
func DeleteSpec(ctx context.Context, specID string) error {
	_, err := database.DB.Exec(ctx, `DELETE FROM pm_specs WHERE id = $1`, specID)
	return err
}
