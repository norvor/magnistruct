package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateResource creates a new PM resource
func CreateResource(ctx context.Context, req dto.CreateResourceRequest, uploaderID string) (*dto.ResourceResponse, error) {
	// Convert skills array to JSONB
	skillsJSON, err := json.Marshal(req.Skills)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal skills: %w", err)
	}
	
	var resourceID string
	query := `
		INSERT INTO pm_resources (user_id, hourly_rate, role, skills, capacity_hours_per_week, owner_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	
	capacityHours := 40
	if req.CapacityHoursPerWeek != nil {
		capacityHours = *req.CapacityHoursPerWeek
	}
	
	err = database.DB.QueryRow(ctx, query,
		req.UserID,
		req.HourlyRate,
		req.Role,
		skillsJSON,
		capacityHours,
		uploaderID,
	).Scan(&resourceID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}
	
	return GetResource(ctx, resourceID)
}

// ListResources returns all resources for a user
func ListResources(ctx context.Context, ownerID string) ([]dto.ResourceResponse, error) {
	query := `
		SELECT 
			r.id, r.user_id, r.hourly_rate, r.role, r.skills,
			r.capacity_hours_per_week, r.created_at, r.updated_at,
			u.email as user_email,
			u.full_name as user_full_name
		FROM pm_resources r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.owner_id = $1
		ORDER BY r.created_at DESC
	`
	
	rows, err := database.DB.Query(ctx, query, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to query resources: %w", err)
	}
	defer rows.Close()
	
	resources := []dto.ResourceResponse{}
	for rows.Next() {
		var r dto.ResourceResponse
		var skillsJSON []byte
		
		err := rows.Scan(
			&r.ID, &r.UserID, &r.HourlyRate, &r.Role, &skillsJSON,
			&r.CapacityHoursPerWeek, &r.CreatedAt, &r.UpdatedAt,
			&r.UserEmail, &r.UserFullName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource: %w", err)
		}
		
		if skillsJSON != nil {
			json.Unmarshal(skillsJSON, &r.Skills)
		}
		
		resources = append(resources, r)
	}
	
	return resources, nil
}

// GetResource returns a single resource
func GetResource(ctx context.Context, resourceID string) (*dto.ResourceResponse, error) {
	query := `
		SELECT 
			r.id, r.user_id, r.hourly_rate, r.role, r.skills,
			r.capacity_hours_per_week, r.created_at, r.updated_at,
			u.email as user_email,
			u.full_name as user_full_name
		FROM pm_resources r
		LEFT JOIN sys_users u ON u.id = r.user_id
		WHERE r.id = $1
	`
	
	var r dto.ResourceResponse
	var skillsJSON []byte
	
	err := database.DB.QueryRow(ctx, query, resourceID).Scan(
		&r.ID, &r.UserID, &r.HourlyRate, &r.Role, &skillsJSON,
		&r.CapacityHoursPerWeek, &r.CreatedAt, &r.UpdatedAt,
		&r.UserEmail, &r.UserFullName,
	)
	
	if err != nil {
		return nil, fmt.Errorf("resource not found: %w", err)
	}
	
	// Parse skills JSON
	if skillsJSON != nil {
		json.Unmarshal(skillsJSON, &r.Skills)
	}
	
	return &r, nil
}

// UpdateResource updates a resource
func UpdateResource(ctx context.Context, resourceID string, req dto.UpdateResourceRequest) error {
	updates := []string{}
	args := []interface{}{}
	argNum := 1
	
	if req.UserID != nil {
		updates = append(updates, fmt.Sprintf("user_id = $%d", argNum))
		args = append(args, *req.UserID)
		argNum++
	}
	if req.HourlyRate != nil {
		updates = append(updates, fmt.Sprintf("hourly_rate = $%d", argNum))
		args = append(args, *req.HourlyRate)
		argNum++
	}
	if req.Role != nil {
		updates = append(updates, fmt.Sprintf("role = $%d", argNum))
		args = append(args, *req.Role)
		argNum++
	}
	if req.Skills != nil {
		skillsJSON, _ := json.Marshal(req.Skills)
		updates = append(updates, fmt.Sprintf("skills = $%d", argNum))
		args = append(args, skillsJSON)
		argNum++
	}
	if req.CapacityHoursPerWeek != nil {
		updates = append(updates, fmt.Sprintf("capacity_hours_per_week = $%d", argNum))
		args = append(args, *req.CapacityHoursPerWeek)
		argNum++
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	updates = append(updates, "updated_at = NOW()")
	args = append(args, resourceID)
	
	query := fmt.Sprintf("UPDATE pm_resources SET %s WHERE id = $%d", 
		joinStrings(updates, ", "), argNum)
	
	_, err := database.DB.Exec(ctx, query, args...)
	return err
}

// DeleteResource deletes a resource
func DeleteResource(ctx context.Context, resourceID string) error {
	_, err := database.DB.Exec(ctx, `DELETE FROM pm_resources WHERE id = $1`, resourceID)
	return err
}
