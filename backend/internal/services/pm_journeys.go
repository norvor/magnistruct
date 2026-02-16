package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateJourney creates a new PM journey
func CreateJourney(ctx context.Context, req dto.CreateJourneyRequest, userID string) (*dto.JourneyResponse, error) {
	// Parse dates
	var startDate, endDate *time.Time
	if req.StartDate != "" {
		parsed, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			startDate = &parsed
		}
	}
	if req.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			endDate = &parsed
		}
	}

	status := "active"
	if req.Status != "" {
		status = req.Status
	}

	var journeyID string
	query := `
		INSERT INTO pm_journeys (user_id, name, start_date, end_date, goal, status, goal_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	err := database.DB.QueryRow(ctx, query,
		userID, req.Name, startDate, endDate, req.Goal, status, req.GoalID,
	).Scan(&journeyID)

	if err != nil {
		fmt.Printf("DEBUG: Journey creation failed: %v\n", err)
		return nil, fmt.Errorf("failed to create journey: %w", err)
	}

	// Add compartments
	if len(req.Compartments) > 0 {
		for i, goalID := range req.Compartments {
			_, _ = database.DB.Exec(ctx, `
				INSERT INTO pm_journey_goals (journey_id, goal_id, position)
				VALUES ($1, $2, $3)
				ON CONFLICT (journey_id, goal_id) DO NOTHING
			`, journeyID, goalID, i)
		}
	}

	// Initialize Engine (Dossier)
	specReq := dto.CreateSpecRequest{
		EntityType: "journey",
		EntityID:   journeyID,
		Title:      fmt.Sprintf("Personal Dossier: %s", req.Name),
		Content:    "# Personal Dossier\n\nWelcome to your journey dossier.",
		Type:       "info",
	}
	spec, err := CreateSpec(ctx, specReq, userID)
	if err == nil {
		_, _ = database.DB.Exec(ctx, `UPDATE pm_journeys SET engine_spec_id = $1 WHERE id = $2`, spec.ID, journeyID)
	}

	return GetJourney(ctx, journeyID)
}

// ListJourneys returns all journeys for a user, optionally filtered by goal
func ListJourneys(ctx context.Context, userID string, goalID *string) ([]dto.JourneyResponse, error) {
	baseQuery := `
		SELECT 
			j.id, j.name, j.start_date, j.end_date, j.goal, j.status, j.goal_id, j.engine_spec_id,
			j.created_at, j.updated_at,
			(SELECT COUNT(*) FROM pm_work_items WHERE journey_id = j.id) as work_item_count,
			g.name as goal_name
		FROM pm_journeys j
		LEFT JOIN pm_goals g ON g.id = j.goal_id
		WHERE j.user_id = $1
	`

	args := []interface{}{userID}
	argNum := 2

	if goalID != nil {
		baseQuery += fmt.Sprintf(" AND j.goal_id = $%d", argNum)
		args = append(args, *goalID)
		argNum++
	}

	baseQuery += " ORDER BY j.created_at DESC"

	rows, err := database.DB.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query journeys: %w", err)
	}
	defer rows.Close()

	journeys := []dto.JourneyResponse{}
	for rows.Next() {
		var j dto.JourneyResponse
		err := rows.Scan(
			&j.ID, &j.Name, &j.StartDate, &j.EndDate, &j.Goal, &j.Status, &j.GoalID, &j.EngineSpecID,
			&j.CreatedAt, &j.UpdatedAt, &j.WorkItemCount,
			&j.GoalName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan journey: %w", err)
		}

		// Calculate stats
		statsQuery := `
			SELECT 
				COUNT(*) FILTER (WHERE status = 'todo') as todo,
				COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
				COUNT(*) FILTER (WHERE status = 'review') as review,
				COUNT(*) FILTER (WHERE status = 'done') as done
			FROM pm_work_items WHERE journey_id = $1
		`
		var stats dto.JourneyStats
		err = database.DB.QueryRow(ctx, statsQuery, j.ID).Scan(
			&stats.TodoCount, &stats.InProgressCount, &stats.ReviewCount, &stats.DoneCount,
		)
		if err == nil {
			stats.TotalCount = stats.TodoCount + stats.InProgressCount + stats.ReviewCount + stats.DoneCount
			j.Stats = &stats
		}

		// Fetch compartments for each journey
		compartmentsRows, err := database.DB.Query(ctx, `
			SELECT g.id, g.name, g.status FROM pm_goals g
			JOIN pm_journey_goals jg ON g.id = jg.goal_id
			WHERE jg.journey_id = $1
			ORDER BY jg.position ASC
		`, j.ID)
		if err == nil {
			for compartmentsRows.Next() {
				var comp dto.GoalResponse
				if err := compartmentsRows.Scan(&comp.ID, &comp.Name, &comp.Status); err == nil {
					j.Compartments = append(j.Compartments, comp)
				}
			}
			compartmentsRows.Close()
		}

		journeys = append(journeys, j)
	}

	return journeys, nil
}

// GetJourney returns a single journey
func GetJourney(ctx context.Context, journeyID string) (*dto.JourneyResponse, error) {
	query := `
		SELECT 
			j.id, j.name, j.start_date, j.end_date, j.goal, j.status, j.goal_id, j.engine_spec_id,
			j.created_at, j.updated_at,
			(SELECT COUNT(*) FROM pm_work_items WHERE journey_id = j.id) as work_item_count,
			g.name as goal_name
		FROM pm_journeys j
		LEFT JOIN pm_goals g ON g.id = j.goal_id
		WHERE j.id = $1
	`

	var j dto.JourneyResponse
	err := database.DB.QueryRow(ctx, query, journeyID).Scan(
		&j.ID, &j.Name, &j.StartDate, &j.EndDate, &j.Goal, &j.Status, &j.GoalID, &j.EngineSpecID,
		&j.CreatedAt, &j.UpdatedAt, &j.WorkItemCount,
		&j.GoalName,
	)

	if err != nil {
		return nil, fmt.Errorf("journey not found: %w", err)
	}

	// Fetch compartments
	compartmentsRows, err := database.DB.Query(ctx, `
		SELECT g.id, g.name, g.status FROM pm_goals g
		JOIN pm_journey_goals jg ON g.id = jg.goal_id
		WHERE jg.journey_id = $1
		ORDER BY jg.position ASC
	`, journeyID)
	if err == nil {
		defer compartmentsRows.Close()
		for compartmentsRows.Next() {
			var comp dto.GoalResponse
			if err := compartmentsRows.Scan(&comp.ID, &comp.Name, &comp.Status); err == nil {
				j.Compartments = append(j.Compartments, comp)
			}
		}
	}

	// Fetch engine spec
	if j.EngineSpecID != nil {
		spec, err := GetSpec(ctx, *j.EngineSpecID)
		if err == nil {
			j.Engine = spec
		}
	}

	// Calculate stats
	statsQuery := `
		SELECT 
			COUNT(*) FILTER (WHERE status = 'todo') as todo,
			COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
			COUNT(*) FILTER (WHERE status = 'review') as review,
			COUNT(*) FILTER (WHERE status = 'done') as done
		FROM pm_work_items WHERE journey_id = $1
	`
	var stats dto.JourneyStats
	err = database.DB.QueryRow(ctx, statsQuery, journeyID).Scan(
		&stats.TodoCount, &stats.InProgressCount, &stats.ReviewCount, &stats.DoneCount,
	)
	if err == nil {
		stats.TotalCount = stats.TodoCount + stats.InProgressCount + stats.ReviewCount + stats.DoneCount
		j.Stats = &stats
	}

	return &j, nil
}

// UpdateJourney updates a journey
func UpdateJourney(ctx context.Context, journeyID string, req dto.UpdateJourneyRequest) error {
	updates := []string{}
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *req.Name)
		argNum++
	}
	if req.StartDate != nil {
		var startDate *time.Time
		if *req.StartDate != "" {
			parsed, err := time.Parse("2006-01-02", *req.StartDate)
			if err == nil {
				startDate = &parsed
			}
		}
		updates = append(updates, fmt.Sprintf("start_date = $%d", argNum))
		args = append(args, startDate)
		argNum++
	}
	if req.EndDate != nil {
		var endDate *time.Time
		if *req.EndDate != "" {
			parsed, err := time.Parse("2006-01-02", *req.EndDate)
			if err == nil {
				endDate = &parsed
			}
		}
		updates = append(updates, fmt.Sprintf("end_date = $%d", argNum))
		args = append(args, endDate)
		argNum++
	}
	if req.Goal != nil {
		updates = append(updates, fmt.Sprintf("goal = $%d", argNum))
		args = append(args, *req.Goal)
		argNum++
	}
	if req.Status != nil {
		updates = append(updates, fmt.Sprintf("status = $%d", argNum))
		args = append(args, *req.Status)
		argNum++
	}
	if req.GoalID != nil {
		updates = append(updates, fmt.Sprintf("goal_id = $%d", argNum))
		args = append(args, *req.GoalID)
		argNum++
	}

	if len(updates) > 0 {
		updates = append(updates, "updated_at = NOW()")
		args = append(args, journeyID)

		query := fmt.Sprintf("UPDATE pm_journeys SET %s WHERE id = $%d",
			strings.Join(updates, ", "), argNum)

		_, err := database.DB.Exec(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	// Update compartments
	if req.Compartments != nil {
		// Simple approach: delete all and re-add
		_, _ = database.DB.Exec(ctx, `DELETE FROM pm_journey_goals WHERE journey_id = $1`, journeyID)
		for i, goalID := range req.Compartments {
			_, _ = database.DB.Exec(ctx, `
				INSERT INTO pm_journey_goals (journey_id, goal_id, position)
				VALUES ($1, $2, $3)
			`, journeyID, goalID, i)
		}
	}

	return nil
}

// DeleteJourney deletes a journey
func DeleteJourney(ctx context.Context, journeyID string) error {
	fmt.Printf("DEBUG: Attempting to delete journey %s\n", journeyID)
	
	// 0. Get journey to find engine_spec_id
	var engineSpecID *string
	err := database.DB.QueryRow(ctx, `SELECT engine_spec_id FROM pm_journeys WHERE id = $1`, journeyID).Scan(&engineSpecID)
	if err != nil && err.Error() != "no rows in result set" {
		fmt.Printf("DEBUG: Error finding journey spec: %v\n", err)
	}
	
	if engineSpecID != nil {
		// Delete the engine spec
		_, err = database.DB.Exec(ctx, `DELETE FROM pm_specs WHERE id = $1`, *engineSpecID)
		if err != nil {
			fmt.Printf("DEBUG: Warning: failed to delete engine spec %s: %v\n", *engineSpecID, err)
		}
	}

	// 1. Delete associated work items
	_, err = database.DB.Exec(ctx, `DELETE FROM pm_work_items WHERE journey_id = $1`, journeyID)
	if err != nil {
		fmt.Printf("DEBUG: Error deleting associated work items: %v\n", err)
		return fmt.Errorf("failed to delete associated work items: %w", err)
	}

	// 2. Delete the journey
	result, err := database.DB.Exec(ctx, `DELETE FROM pm_journeys WHERE id = $1`, journeyID)
	if err != nil {
		fmt.Printf("DEBUG: Error deleting journey record: %v\n", err)
		return fmt.Errorf("failed to delete journey record: %w", err)
	}

	rows := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("journey not found")
	}

	fmt.Printf("DEBUG: Journey %s deleted successfully\n", journeyID)
	return nil
}

