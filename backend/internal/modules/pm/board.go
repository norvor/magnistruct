package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// --- SOPHISTICATED MODELS ---

type BoardView struct {
	Project Project      `json:"project"`
	Columns []ColumnView `json:"columns"`
}

type ColumnView struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Position float64 `json:"position"`
	Tasks    []Task  `json:"tasks"`
}

type Task struct {
	ID          string     `json:"id"`
	ColumnID    string     `json:"column_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
	Position    float64    `json:"position"`
	IsComplete  bool       `json:"is_complete"`
}

type MoveTaskRequest struct {
	TaskID      string  `json:"task_id"`
	NewColumnID string  `json:"new_column_id"`
	NewPosition float64 `json:"new_position"` // Frontend calculates the mid-point float
}

// --- HANDLERS ---

// HandleGetBoard: The "Asana Load" - Fetches everything for a project in 1 fast query structure
func HandleGetBoard(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")

	// 1. Get Project Details
	var p Project
	err := database.DB.QueryRow(r.Context(), "SELECT id, name, description FROM projects WHERE id=$1", projectID).
		Scan(&p.ID, &p.Name, &p.Description)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	// 2. Get Columns
	rows, _ := database.DB.Query(r.Context(), "SELECT id, name, position FROM columns WHERE project_id=$1 ORDER BY position ASC", projectID)
	defer rows.Close()

	colMap := make(map[string]*ColumnView)
	var columns []ColumnView

	for rows.Next() {
		var c ColumnView
		rows.Scan(&c.ID, &c.Name, &c.Position)
		c.Tasks = []Task{} // Initialize empty slice
		columns = append(columns, c)
		// Store pointer to update tasks later
		colMap[c.ID] = &columns[len(columns)-1]
	}

	// 3. Get Tasks (All tasks for this project in one go)
	tRows, _ := database.DB.Query(r.Context(),
		"SELECT id, column_id, title, description, priority, due_date, position, is_complete FROM tasks WHERE project_id=$1 ORDER BY position ASC",
		projectID)
	defer tRows.Close()

	for tRows.Next() {
		var t Task
		tRows.Scan(&t.ID, &t.ColumnID, &t.Title, &t.Description, &t.Priority, &t.DueDate, &t.Position, &t.IsComplete)

		// Assign task to correct column in memory
		if col, ok := colMap[t.ColumnID]; ok {
			col.Tasks = append(col.Tasks, t)
		}
	}

	// 4. Return the Tree
	response := BoardView{Project: p, Columns: columns}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleCreateColumn: Add a new "Section" to the board
func HandleCreateColumn(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	var req struct {
		Name string `json:"name"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	// Auto-position at the end (find max pos + 1000)
	var maxPos float64
	database.DB.QueryRow(r.Context(), "SELECT COALESCE(MAX(position), 0) FROM columns WHERE project_id=$1", projectID).Scan(&maxPos)

	var id string
	database.DB.QueryRow(r.Context(),
		"INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING id",
		projectID, req.Name, maxPos+10000).Scan(&id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "name": req.Name})
}

// HandleMoveTask: The Drag & Drop Logic
func HandleMoveTask(w http.ResponseWriter, r *http.Request) {
	var req MoveTaskRequest
	json.NewDecoder(r.Body).Decode(&req)

	// Atomic Update
	_, err := database.DB.Exec(r.Context(),
		"UPDATE tasks SET column_id=$1, position=$2, updated_at=NOW() WHERE id=$3",
		req.NewColumnID, req.NewPosition, req.TaskID)

	if err != nil {
		http.Error(w, "Move failed", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
