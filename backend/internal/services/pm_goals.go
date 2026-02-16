package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

type PMGoalsService struct{}

func NewPMGoalsService() *PMGoalsService {
	return &PMGoalsService{}
}

func (s *PMGoalsService) CreateGoal(ctx context.Context, userID string, req dto.CreateGoalRequest) (*dto.GoalResponse, error) {
	var startDate, targetEndDate *time.Time
	if req.StartDate != "" {
		parsed, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			startDate = &parsed
		}
	}
	if req.TargetEndDate != "" {
		parsed, err := time.Parse("2006-01-02", req.TargetEndDate)
		if err == nil {
			targetEndDate = &parsed
		}
	}

	status := "active"
	if req.Status != "" {
		status = req.Status
	}

	query := `
		INSERT INTO pm_goals (user_id, name, description, status, start_date, target_end_date, lead_id, purpose_id, cover_image, category)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	var g dto.GoalResponse
	g.Name = req.Name
	g.Description = &req.Description
	g.Status = status
	g.LeadID = req.LeadID
	g.PurposeID = req.PurposeID

	err := database.DB.QueryRow(ctx, query,
		userID, req.Name, req.Description, status, startDate, targetEndDate, req.LeadID, req.PurposeID, req.CoverImage, req.Category,
	).Scan(&g.ID, &g.CreatedAt, &g.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create goal: %w", err)
	}

	// Create Work Items (Steps) if provided
	if len(req.Steps) > 0 {
		for _, stepTitle := range req.Steps {
			_, err = database.DB.Exec(ctx, `
				INSERT INTO pm_work_items (user_id, goal_id, title, status, type)
				VALUES ($1, $2, $3, 'todo', 'action')
			`, userID, g.ID, stepTitle)
			if err != nil {
				fmt.Printf("Error creating goal work item: %v\n", err)
			}
		}
	}

	return s.GetGoal(ctx, g.ID)
}

func (s *PMGoalsService) GetGoal(ctx context.Context, id string) (*dto.GoalResponse, error) {
	query := `
		SELECT 
			g.id, g.name, g.description, g.status, g.start_date, g.target_end_date, g.lead_id, g.created_at, g.updated_at,
			u.full_name as lead_name,
			COALESCE(g.cover_image, ''), COALESCE(g.category, ''), g.purpose_id
		FROM pm_goals g
		LEFT JOIN sys_users u ON g.lead_id = u.id
		WHERE g.id = $1
	`

	var g dto.GoalResponse

	err := database.DB.QueryRow(ctx, query, id).Scan(
		&g.ID, &g.Name, &g.Description, &g.Status, &g.StartDate, &g.TargetEndDate, &g.LeadID, &g.CreatedAt, &g.UpdatedAt,
		&g.LeadName,
		&g.CoverImage, &g.Category, &g.PurposeID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get goal: %w", err)
	}

	// Calculate Stats
	statsQuery := `
		SELECT 
			COUNT(*) FILTER (WHERE status = 'todo') as todo,
			COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
			COUNT(*) FILTER (WHERE status = 'review') as review,
			COUNT(*) FILTER (WHERE status = 'done') as done
		FROM pm_work_items WHERE goal_id = $1
	`
	var stats dto.GoalStats
	err = database.DB.QueryRow(ctx, statsQuery, id).Scan(
		&stats.TodoCount, &stats.InProgressCount, &stats.ReviewCount, &stats.DoneCount,
	)
	if err == nil {
		stats.TotalCount = stats.TodoCount + stats.InProgressCount + stats.ReviewCount + stats.DoneCount
		g.Stats = &stats
	}

	// Fetch Work Items
	workItemsQuery := `
		SELECT 
			w.id, w.title, w.description, w.status, w.type, w.priority, w.parent_id, 
			w.assignee_id, w.journey_id, w.goal_id, w.story_points, w.due_date, 
			w.created_at, w.updated_at,
			u.full_name as assignee_name
		FROM pm_work_items w
		LEFT JOIN sys_users u ON w.assignee_id = u.id
		WHERE w.goal_id = $1
		ORDER BY w.created_at ASC
	`
	rows, err := database.DB.Query(ctx, workItemsQuery, id)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var w dto.WorkItemResponse
			if err := rows.Scan(
				&w.ID, &w.Title, &w.Description, &w.Status, &w.Type, &w.Priority, &w.ParentID,
				&w.AssigneeID, &w.JourneyID, &w.GoalID, &w.StoryPoints, &w.DueDate,
				&w.CreatedAt, &w.UpdatedAt,
				&w.AssigneeName,
			); err == nil {
				g.WorkItems = append(g.WorkItems, w)
				
				// Map to legacy Steps for frontend compatibility
				g.Steps = append(g.Steps, dto.GoalStepResponse{
					ID:        w.ID,
					Title:     w.Title,
					IsDone:    w.Status == "done",
					Position:  len(g.Steps) + 1,
					CreatedAt: w.CreatedAt,
				})
			}
		}
	}

	return &g, nil
}

func (s *PMGoalsService) ListGoals(ctx context.Context, userID string) ([]dto.GoalResponse, error) {
	query := `
		SELECT 
			g.id, g.name, g.description, g.status, g.start_date, g.target_end_date, g.lead_id,
			COALESCE(g.cover_image, ''), COALESCE(g.category, ''),
			g.created_at, g.updated_at,
			u.full_name as lead_name,
			g.purpose_id,
			(SELECT COUNT(*) FROM pm_work_items w WHERE w.goal_id = g.id AND w.status = 'todo') as todo_count,
			(SELECT COUNT(*) FROM pm_work_items w WHERE w.goal_id = g.id AND w.status = 'in_progress') as in_progress_count,
			(SELECT COUNT(*) FROM pm_work_items w WHERE w.goal_id = g.id AND w.status = 'review') as review_count,
			(SELECT COUNT(*) FROM pm_work_items w WHERE w.goal_id = g.id AND w.status = 'done') as done_count
		FROM pm_goals g
		LEFT JOIN sys_users u ON u.id = g.lead_id
		WHERE g.user_id = $1
		ORDER BY g.updated_at DESC
	`

	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	goals := []dto.GoalResponse{}
	for rows.Next() {
		var g dto.GoalResponse
		var stats dto.GoalStats
		
		err := rows.Scan(
			&g.ID, &g.Name, &g.Description, &g.Status, &g.StartDate, &g.TargetEndDate, &g.LeadID,
			&g.CoverImage, &g.Category,
			&g.CreatedAt, &g.UpdatedAt,
			&g.LeadName,
			&g.PurposeID,
			&stats.TodoCount, &stats.InProgressCount, &stats.ReviewCount, &stats.DoneCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan goal: %w", err)
		}
		
		stats.TotalCount = stats.TodoCount + stats.InProgressCount + stats.ReviewCount + stats.DoneCount
		g.Stats = &stats

		goals = append(goals, g)
	}

	return goals, nil
}

func (s *PMGoalsService) UpdateGoal(ctx context.Context, id string, req dto.UpdateGoalRequest) (*dto.GoalResponse, error) {
	updates := []string{}
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *req.Name)
		argNum++
	}
	if req.Description != nil {
		updates = append(updates, fmt.Sprintf("description = $%d", argNum))
		args = append(args, *req.Description)
		argNum++
	}
	if req.Status != nil {
		updates = append(updates, fmt.Sprintf("status = $%d", argNum))
		args = append(args, *req.Status)
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
	if req.TargetEndDate != nil {
		var targetEndDate *time.Time
		if *req.TargetEndDate != "" {
			parsed, err := time.Parse("2006-01-02", *req.TargetEndDate)
			if err == nil {
				targetEndDate = &parsed
			}
		}
		updates = append(updates, fmt.Sprintf("target_end_date = $%d", argNum))
		args = append(args, targetEndDate)
		argNum++
	}
	if req.LeadID != nil {
		updates = append(updates, fmt.Sprintf("lead_id = $%d", argNum))
		args = append(args, *req.LeadID)
		argNum++
	}
	if req.PurposeID != nil {
		updates = append(updates, fmt.Sprintf("purpose_id = $%d", argNum))
		args = append(args, *req.PurposeID)
		argNum++
	}

	if len(updates) == 0 {
		return s.GetGoal(ctx, id)
	}

	updates = append(updates, "updated_at = NOW()")
	
	query := fmt.Sprintf("UPDATE pm_goals SET %s WHERE id = $%d", 
		strings.Join(updates, ", "), argNum)
	
	args = append(args, id)

	_, err := database.DB.Exec(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update goal: %w", err)
	}

	return s.GetGoal(ctx, id)
}

func (s *PMGoalsService) DeleteGoal(ctx context.Context, id string) error {
	query := "DELETE FROM pm_goals WHERE id = $1"
	result, err := database.DB.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete goal: %w", err)
	}

	rows := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("goal not found")
	}

	return nil
}

func (s *PMGoalsService) UpdateGoalStep(ctx context.Context, stepID string, req dto.UpdateGoalStepRequest) error {
	if req.IsDone == nil {
		return nil
	}

	status := "todo"
	if *req.IsDone {
		status = "done"
	}

	_, err := database.DB.Exec(ctx, `
		UPDATE pm_work_items SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, stepID)
	
	return err
}
