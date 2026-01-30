package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// HandleCreateTask: Adds a task with auto-generated ShortID and optional Assignee
func HandleCreateTask(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")

	type CreateRequest struct {
		ColumnID   string  `json:"column_id"`
		Title      string  `json:"title"`
		AssigneeID *string `json:"assignee_id"` // Optional: UUID or null
	}

	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.ColumnID == "" {
		http.Error(w, "Column ID is required", http.StatusBadRequest)
		return
	}

	// Auto-Position: Find the highest position so we append to the bottom
	var maxPos float64
	err := database.DB.QueryRow(r.Context(), "SELECT COALESCE(MAX(position), 0) FROM tasks WHERE column_id=$1", req.ColumnID).Scan(&maxPos)
	if err != nil {
		maxPos = 65535
	}

	// Insert & Return the new Linear-style ID (short_id)
	var t Task
	// We need to capture the raw assigneeID to check if we need to fetch the name
	var rawAssigneeID *string

	// FIX: Use COALESCE(description, '') to prevent NULL scan errors
	query := `
		INSERT INTO tasks (project_id, column_id, title, position, is_complete, assignee_id)
		VALUES ($1, $2, $3, $4, FALSE, $5)
		RETURNING id, short_id, column_id, title, COALESCE(description, ''), priority, due_date, position, is_complete, assignee_id
	`

	// Use maxPos + 10000 for spacing
	err = database.DB.QueryRow(r.Context(), query, projectID, req.ColumnID, req.Title, maxPos+10000, req.AssigneeID).
		Scan(&t.ID, &t.ShortID, &t.ColumnID, &t.Title, &t.Description, &t.Priority, &t.DueDate, &t.Position, &t.IsComplete, &rawAssigneeID)

	if err != nil {
		// Log the specific error for debugging if needed
		http.Error(w, "Failed to create task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// If an assignee was set, fetch their name quickly so the UI can update the avatar immediately
	if rawAssigneeID != nil {
		var uName string
		if err := database.DB.QueryRow(r.Context(), "SELECT full_name FROM users WHERE id=$1", *rawAssigneeID).Scan(&uName); err == nil {
			t.Assignee = &UserSummary{
				ID:       *rawAssigneeID,
				FullName: uName,
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

// HandleUpdateTask: Edit Title, Description, Priority, DueDate, and Assignee
func HandleUpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	// We accept a partial or full object.
	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		Priority    string     `json:"priority"`
		DueDate     *time.Time `json:"due_date"`
		AssigneeID  *string    `json:"assignee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	query := `
		UPDATE tasks 
		SET title=$1, description=$2, priority=$3, due_date=$4, assignee_id=$5, updated_at=NOW() 
		WHERE id=$6
		RETURNING id
	`

	var id string
	err := database.DB.QueryRow(r.Context(), query,
		req.Title, req.Description, req.Priority, req.DueDate, req.AssigneeID, taskID,
	).Scan(&id)

	if err != nil {
		http.Error(w, "Update failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// HandleToggleTask: Check/Uncheck
func HandleToggleTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	var isComplete bool
	query := `UPDATE tasks SET is_complete = NOT is_complete WHERE id = $1 RETURNING is_complete`

	err := database.DB.QueryRow(r.Context(), query, taskID).Scan(&isComplete)
	if err != nil {
		http.Error(w, "Toggle failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"is_complete": isComplete})
}

// HandleDeleteTask: Hard delete
func HandleDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	_, err := database.DB.Exec(r.Context(), "DELETE FROM tasks WHERE id = $1", taskID)
	if err != nil {
		http.Error(w, "Delete failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// HandleMoveTask: The Drag & Drop Logic
// HandleMoveTask: The Drag & Drop Logic
func HandleMoveTask(w http.ResponseWriter, r *http.Request) {
	// FIX 1: Get TaskID from the URL, not the body
	taskID := chi.URLParam(r, "taskID")

	type MoveTaskRequest struct {
		// TaskID removed from here since it's in the URL
		NewColumnID string  `json:"new_column_id"`
		NewPosition float64 `json:"new_position"`
	}

	var req MoveTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// FIX 2: Check for valid inputs before hitting DB
	if req.NewColumnID == "" {
		http.Error(w, "Column ID required", http.StatusBadRequest)
		return
	}

	// Atomic Update
	// We use the 'taskID' variable from the URL for the WHERE clause ($3)
	_, err := database.DB.Exec(r.Context(),
		"UPDATE tasks SET column_id=$1, position=$2, updated_at=NOW() WHERE id=$3",
		req.NewColumnID, req.NewPosition, taskID)

	if err != nil {
		// Log the actual error to your terminal for debugging
		println("Move Task Error:", err.Error())
		http.Error(w, "Move failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
