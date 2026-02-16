package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateEnvironment creates a new PM environment
func CreateEnvironment(ctx context.Context, req dto.CreateEnvironmentRequest, userID string) (*dto.EnvironmentResponse, error) {
	metadataJSON, err := json.Marshal(req.Metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal metadata: %w", err)
	}
	
	var envID string
	query := `
		INSERT INTO pm_environments (user_id, name, url, type, provider, metadata)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	
	err = database.DB.QueryRow(ctx, query,
		userID, req.Name, req.URL, req.Type, req.Provider, metadataJSON,
	).Scan(&envID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create environment: %w", err)
	}
	
	return GetEnvironment(ctx, envID)
}

// ListEnvironments returns all environments for a user
func ListEnvironments(ctx context.Context, userID string) ([]dto.EnvironmentResponse, error) {
	query := `
		SELECT id, name, url, type, provider, metadata, created_at, updated_at
		FROM pm_environments
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	
	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query environments: %w", err)
	}
	defer rows.Close()
	
	envs := []dto.EnvironmentResponse{}
	for rows.Next() {
		var e dto.EnvironmentResponse
		var metadataJSON []byte
		
		err := rows.Scan(
			&e.ID, &e.Name, &e.URL, &e.Type, &e.Provider, &metadataJSON,
			&e.CreatedAt, &e.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan environment: %w", err)
		}
		
		if metadataJSON != nil {
			json.Unmarshal(metadataJSON, &e.Metadata)
		}
		
		envs = append(envs, e)
	}
	
	return envs, nil
}

// GetEnvironment returns a single environment
func GetEnvironment(ctx context.Context, envID string) (*dto.EnvironmentResponse, error) {
	query := `
		SELECT id, name, url, type, provider, metadata, created_at, updated_at
		FROM pm_environments
		WHERE id = $1
	`
	
	var e dto.EnvironmentResponse
	var metadataJSON []byte
	
	err := database.DB.QueryRow(ctx, query, envID).Scan(
		&e.ID, &e.Name, &e.URL, &e.Type, &e.Provider, &metadataJSON,
		&e.CreatedAt, &e.UpdatedAt,
	)
	
	if err != nil {
		return nil, fmt.Errorf("environment not found: %w", err)
	}
	
	if metadataJSON != nil {
		json.Unmarshal(metadataJSON, &e.Metadata)
	}
	
	return &e, nil
}

// UpdateEnvironment updates an environment
func UpdateEnvironment(ctx context.Context, envID string, req dto.UpdateEnvironmentRequest) error {
	updates := []string{}
	args := []interface{}{}
	argNum := 1
	
	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *req.Name)
		argNum++
	}
	if req.URL != nil {
		updates = append(updates, fmt.Sprintf("url = $%d", argNum))
		args = append(args, *req.URL)
		argNum++
	}
	if req.Type != nil {
		updates = append(updates, fmt.Sprintf("type = $%d", argNum))
		args = append(args, *req.Type)
		argNum++
	}
	if req.Provider != nil {
		updates = append(updates, fmt.Sprintf("provider = $%d", argNum))
		args = append(args, *req.Provider)
		argNum++
	}
	if req.Metadata != nil {
		metadataJSON, _ := json.Marshal(req.Metadata)
		updates = append(updates, fmt.Sprintf("metadata = $%d", argNum))
		args = append(args, metadataJSON)
		argNum++
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	updates = append(updates, "updated_at = NOW()")
	args = append(args, envID)
	
	query := fmt.Sprintf("UPDATE pm_environments SET %s WHERE id = $%d", 
		joinStrings(updates, ", "), argNum)
	
	_, err := database.DB.Exec(ctx, query, args...)
	return err
}

// DeleteEnvironment deletes an environment
func DeleteEnvironment(ctx context.Context, envID string) error {
	_, err := database.DB.Exec(ctx, `DELETE FROM pm_environments WHERE id = $1`, envID)
	return err
}
