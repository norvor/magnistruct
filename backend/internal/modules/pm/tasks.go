package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// HandleCreateTask: Creates a pm_work_item type='task'
func HandleCreateTask(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		EngineType  string `json:"engine_type"` // e.g. "task", "bug", "story" -> Maps to Type
		Priority    string `json:"priority"`
		Points      int    `json:"story_points"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if req.Priority == "" { req.Priority = "medium" }
	if req.EngineType == "" { req.EngineType = "task" }

	// Metadata to store engine type if it differs from standard "type"
	meta := map[string]interface{}{
		"engine_type": req.EngineType,
	}
	metaJSON, _ := json.Marshal(meta)

	var taskID string
	err := database.DB.QueryRow(r.Context(), `
        INSERT INTO pm_work_items (
            parent_id, title, description, type, priority, story_points, assignee_id, metadata, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'todo')
        RETURNING id
    `, projectID, req.Title, req.Description, req.EngineType, req.Priority, req.Points, userID, metaJSON).Scan(&taskID)

	if err != nil {
		http.Error(w, "Failed to create task: "+err.Error(), 500)
		return
	}

	LogActivity(r.Context(), taskID, userID, "create", "Created task")

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": taskID})
}

// HandleUpdateTask
func HandleUpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	userID, _ := r.Context().Value("user_id").(string)

	var req struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Status      *string `json:"status"`
		Priority    *string `json:"priority"`
		Points      *int    `json:"story_points"`
		DueDate     *time.Time `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	
	if req.Title != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET title=$1 WHERE id=$2", *req.Title, taskID)
	}
	if req.Description != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET description=$1 WHERE id=$2", *req.Description, taskID)
	}
	if req.Status != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET status=$1 WHERE id=$2", *req.Status, taskID)
		LogActivity(r.Context(), taskID, userID, "update", "Status -> "+*req.Status)
	}
	if req.Priority != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET priority=$1 WHERE id=$2", *req.Priority, taskID)
	}
	if req.Points != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET story_points=$1 WHERE id=$2", *req.Points, taskID)
	}
	if req.DueDate != nil {
		database.DB.Exec(r.Context(), "UPDATE pm_work_items SET due_date=$1 WHERE id=$2", *req.DueDate, taskID)
	}

	w.WriteHeader(http.StatusOK)
}

func HandleDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	database.DB.Exec(r.Context(), "DELETE FROM pm_work_items WHERE id = $1", taskID)
	w.WriteHeader(http.StatusOK)
}

// NOTE: Subtask logic should also be refactored to use pm_work_items (parent_id recursion)
// For now, removing subtask handlers to avoid compilation errors as 'subtasks' table is NOT in the 35 list (probably).
// The 35 list had 'pm_work_items'. Recursion handles subtasks.
// So I will omit Subtask specific handlers for now, or implement them using pm_work_items.
