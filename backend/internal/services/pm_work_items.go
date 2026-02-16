package services

import (
	"context"
	"fmt"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateWorkItem creates a new work item
func CreateWorkItem(ctx context.Context, req dto.CreateWorkItemRequest, userID string) (*dto.WorkItemResponse, error) {
	var workItemID string
	query := `
		INSERT INTO pm_work_items (
			user_id, title, description, status, type, priority, 
			parent_id, assignee_id, journey_id, goal_id, story_points, due_date
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`
	
	// Parse due date if provided
	var dueDate *time.Time
	if req.DueDate != nil && *req.DueDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.DueDate)
		if err == nil {
			dueDate = &parsed
		}
	}
	
	// Set defaults
	status := "todo"
	if req.Status != "" {
		status = req.Status
	}
	itemType := "action"
	if req.Type != "" {
		itemType = req.Type
	}
	priority := "medium"
	if req.Priority != "" {
		priority = req.Priority
	}
	
	err := database.DB.QueryRow(ctx, query,
		userID,
		req.Title,
		req.Description,
		status,
		itemType,
		priority,
		req.ParentID,
		req.AssigneeID,
		req.JourneyID,
		req.GoalID,
		req.StoryPoints,
		dueDate,
	).Scan(&workItemID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create work item: %w", err)
	}
	
	return GetWorkItem(ctx, workItemID)
}

// ListWorkItems returns work items with optional filtering
func ListWorkItems(ctx context.Context, userID string, status, itemType, priority, assigneeID, journeyID, goalID, parentID *string) ([]dto.WorkItemResponse, error) {
	baseQuery := `
		SELECT 
			w.id, w.title, w.description, w.status, w.type, w.priority,
			w.parent_id, w.assignee_id, w.journey_id, w.goal_id, w.story_points, w.due_date,
			w.created_at, w.updated_at,
			u.full_name as assignee_name,
			j.name as journey_name,
			g.name as goal_name,
			p.title as parent_title,
			(SELECT COUNT(*) FROM pm_work_items sub WHERE sub.parent_id = w.id) as subtask_count
		FROM pm_work_items w
		LEFT JOIN sys_users u ON u.id = w.assignee_id
		LEFT JOIN pm_journeys j ON j.id = w.journey_id
		LEFT JOIN pm_goals g ON g.id = w.goal_id
		LEFT JOIN pm_work_items p ON p.id = w.parent_id
		WHERE w.user_id = $1
	`
	
	args := []interface{}{userID}
	argNum := 2
	
	if status != nil {
		baseQuery += fmt.Sprintf(" AND w.status = $%d", argNum)
		args = append(args, *status)
		argNum++
	}
	if itemType != nil {
		baseQuery += fmt.Sprintf(" AND w.type = $%d", argNum)
		args = append(args, *itemType)
		argNum++
	}
	if priority != nil {
		baseQuery += fmt.Sprintf(" AND w.priority = $%d", argNum)
		args = append(args, *priority)
		argNum++
	}
	if assigneeID != nil {
		baseQuery += fmt.Sprintf(" AND w.assignee_id = $%d", argNum)
		args = append(args, *assigneeID)
		argNum++
	}
	if journeyID != nil {
		baseQuery += fmt.Sprintf(" AND w.journey_id = $%d", argNum)
		args = append(args, *journeyID)
		argNum++
	}
	if goalID != nil {
		baseQuery += fmt.Sprintf(" AND w.goal_id = $%d", argNum)
		args = append(args, *goalID)
		argNum++
	}
	if parentID != nil {
		if *parentID == "null" {
			baseQuery += " AND w.parent_id IS NULL"
		} else {
			baseQuery += fmt.Sprintf(" AND w.parent_id = $%d", argNum)
			args = append(args, *parentID)
			argNum++
		}
	}
	
	baseQuery += " ORDER BY w.created_at DESC"
	
	rows, err := database.DB.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query work items: %w", err)
	}
	defer rows.Close()
	
	items := []dto.WorkItemResponse{}
	for rows.Next() {
		var item dto.WorkItemResponse
		err := rows.Scan(
			&item.ID, &item.Title, &item.Description,
			&item.Status, &item.Type, &item.Priority,
			&item.ParentID, &item.AssigneeID, &item.JourneyID,
			&item.GoalID, &item.StoryPoints, &item.DueDate,
			&item.CreatedAt, &item.UpdatedAt,
			&item.AssigneeName, &item.JourneyName, &item.GoalName, &item.ParentTitle,
			&item.SubtaskCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan work item: %w", err)
		}
		items = append(items, item)
	}
	
	return items, nil
}

// GetWorkItem returns a single work item with full details
func GetWorkItem(ctx context.Context, workItemID string) (*dto.WorkItemResponse, error) {
	query := `
		SELECT 
			w.id, w.title, w.description, w.status, w.type, w.priority,
			w.parent_id, w.assignee_id, w.journey_id, w.goal_id, w.story_points, w.due_date,
			w.created_at, w.updated_at,
			u.full_name as assignee_name,
			j.name as journey_name,
			g.name as goal_name,
			p.title as parent_title,
			(SELECT COUNT(*) FROM pm_work_items sub WHERE sub.parent_id = w.id) as subtask_count
		FROM pm_work_items w
		LEFT JOIN sys_users u ON u.id = w.assignee_id
		LEFT JOIN pm_journeys j ON j.id = w.journey_id
		LEFT JOIN pm_goals g ON g.id = w.goal_id
		LEFT JOIN pm_work_items p ON p.id = w.parent_id
		WHERE w.id = $1
	`
	
	var item dto.WorkItemResponse
	err := database.DB.QueryRow(ctx, query, workItemID).Scan(
		&item.ID, &item.Title, &item.Description,
		&item.Status, &item.Type, &item.Priority,
		&item.ParentID, &item.AssigneeID, &item.JourneyID,
		&item.GoalID, &item.StoryPoints, &item.DueDate,
		&item.CreatedAt, &item.UpdatedAt,
		&item.AssigneeName, &item.JourneyName, &item.GoalName, &item.ParentTitle,
		&item.SubtaskCount,
	)
	
	if err != nil {
		return nil, fmt.Errorf("work item not found: %w", err)
	}
	
	return &item, nil
}

// UpdateWorkItem updates work item fields
func UpdateWorkItem(ctx context.Context, workItemID string, req dto.UpdateWorkItemRequest, userID string) error {


	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argNum := 1
	
	if req.Title != nil {
		updates = append(updates, fmt.Sprintf("title = $%d", argNum))
		args = append(args, *req.Title)
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
	if req.Type != nil {
		updates = append(updates, fmt.Sprintf("type = $%d", argNum))
		args = append(args, *req.Type)
		argNum++
	}
	if req.Priority != nil {
		updates = append(updates, fmt.Sprintf("priority = $%d", argNum))
		args = append(args, *req.Priority)
		argNum++
	}
	if req.ParentID != nil {
		updates = append(updates, fmt.Sprintf("parent_id = $%d", argNum))
		args = append(args, *req.ParentID)
		argNum++
	}
	if req.AssigneeID != nil {
		updates = append(updates, fmt.Sprintf("assignee_id = $%d", argNum))
		args = append(args, *req.AssigneeID)
		argNum++
	}
	if req.JourneyID != nil {
		updates = append(updates, fmt.Sprintf("journey_id = $%d", argNum))
		args = append(args, *req.JourneyID)
		argNum++
	}
	if req.GoalID != nil {
		updates = append(updates, fmt.Sprintf("goal_id = $%d", argNum))
		args = append(args, *req.GoalID)
		argNum++
	}
	if req.StoryPoints != nil {
		updates = append(updates, fmt.Sprintf("story_points = $%d", argNum))
		args = append(args, *req.StoryPoints)
		argNum++
	}
	if req.DueDate != nil {
		var dueDate *time.Time
		if *req.DueDate != "" {
			parsed, err := time.Parse("2006-01-02", *req.DueDate)
			if err == nil {
				dueDate = &parsed
			}
		}
		updates = append(updates, fmt.Sprintf("due_date = $%d", argNum))
		args = append(args, dueDate)
		argNum++
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	updates = append(updates, "updated_at = NOW()")
	args = append(args, workItemID)
	
	query := fmt.Sprintf("UPDATE pm_work_items SET %s WHERE id = $%d", 
		joinStrings(updates, ", "), argNum)
	
	var err error
	_, err = database.DB.Exec(ctx, query, args...)
	if err != nil {
		return err
	}



	return nil
}

// DeleteWorkItem deletes a work item
func DeleteWorkItem(ctx context.Context, workItemID string) error {
	var subtaskCount int
	err := database.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM pm_work_items WHERE parent_id = $1`,
		workItemID).Scan(&subtaskCount)
	
	if err != nil {
		return fmt.Errorf("failed to check subtasks: %w", err)
	}
	
	if subtaskCount > 0 {
		return fmt.Errorf("cannot delete work item with %d subtasks", subtaskCount)
	}
	
	_, err = database.DB.Exec(ctx, `DELETE FROM pm_work_items WHERE id = $1`, workItemID)
	return err
}

func GetSubtasks(ctx context.Context, parentID string, userID string) ([]dto.WorkItemResponse, error) {
	return ListWorkItems(ctx, userID, nil, nil, nil, nil, nil, nil, &parentID)
}

func joinStrings(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	result := strs[0]
	for i := 1; i < len(strs); i++ {
		result += sep + strs[i]
	}
	return result
}
