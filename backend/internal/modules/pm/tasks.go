package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// HandleCreateTask: Adds a task to a specific Column (e.g., "To Do")
func HandleCreateTask(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")

	// We expect the frontend to tell us WHICH column to add to.
	// If they don't, we could default to the first one, but let's be strict for now.
	type CreateRequest struct {
		ColumnID string `json:"column_id"`
		Title    string `json:"title"`
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

	// Auto-Position: Find the highest position in this column so we append to the bottom
	var maxPos float64
	err := database.DB.QueryRow(r.Context(), "SELECT COALESCE(MAX(position), 0) FROM tasks WHERE column_id=$1", req.ColumnID).Scan(&maxPos)
	if err != nil {
		maxPos = 65535 // Default start if query fails or empty
	}

	// Insert
	var t Task
	query := `
		INSERT INTO tasks (project_id, column_id, title, position, is_complete)
		VALUES ($1, $2, $3, $4, FALSE)
		RETURNING id, column_id, title, description, priority, due_date, position, is_complete
	`

	// We use maxPos + 10000 to leave huge gaps for re-ordering later
	err = database.DB.QueryRow(r.Context(), query, projectID, req.ColumnID, req.Title, maxPos+10000).
		Scan(&t.ID, &t.ColumnID, &t.Title, &t.Description, &t.Priority, &t.DueDate, &t.Position, &t.IsComplete)

	if err != nil {
		http.Error(w, "Failed to create task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

// HandleUpdateTask: Edit Title, Description, Priority
func HandleUpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Dynamic Update (Only update fields that are sent? For simplicity, we update all textual fields)
	query := `
		UPDATE tasks 
		SET title=$1, description=$2, priority=$3, updated_at=NOW() 
		WHERE id=$4 
		RETURNING id, title, description, priority
	`

	err := database.DB.QueryRow(r.Context(), query, req.Title, req.Description, req.Priority, taskID).
		Scan(&req.Title, &req.Title, &req.Description, &req.Priority) // Just scanning to verify it exists

	if err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// HandleToggleTask: Check/Uncheck
func HandleToggleTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	var isComplete bool
	// Toggle the boolean
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
