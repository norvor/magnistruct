package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// Board Data Structures

type BoardColumn struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
	Tasks    []Task `json:"tasks"`
}

type BoardData struct {
	Project Project       `json:"project"`
	Columns []BoardColumn `json:"columns"`
}

// HandleGetBoard: The Heavy Lifter
// Fetches the Project, All Columns, and All Tasks (nested) in one go.
func HandleGetBoard(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")

	// 1. Fetch Project Details
	var p Project
	err := database.DB.QueryRow(r.Context(),
		"SELECT id, name, description, created_at FROM projects WHERE id = $1",
		projectID).Scan(&p.ID, &p.Name, &p.Description, &p.CreatedAt)

	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	// 2. Fetch Columns (Ordered by Position)
	rows, err := database.DB.Query(r.Context(),
		"SELECT id, name, position FROM columns WHERE project_id = $1 ORDER BY position ASC",
		projectID)
	if err != nil {
		http.Error(w, "Failed to load columns", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Initialize as empty slice (not nil) so JSON is "[]" not "null"
	columns := []BoardColumn{}
	columnMap := make(map[string]*BoardColumn)

	for rows.Next() {
		var c BoardColumn
		c.Tasks = []Task{} // Important: Init empty tasks array
		if err := rows.Scan(&c.ID, &c.Name, &c.Position); err == nil {
			columns = append(columns, c)
		}
	}

	// Create a map pointers to columns for O(1) task insertion
	// We need to loop over the slice indices to get pointers to the actual data
	for i := range columns {
		columnMap[columns[i].ID] = &columns[i]
	}

	// 3. Fetch Tasks (With Assignees!)
	// We use COALESCE on description to safely handle nulls
	taskQuery := `
		SELECT 
			t.id, t.short_id, t.column_id, t.title, COALESCE(t.description, ''), 
			t.priority, t.due_date, t.position, t.is_complete,
			u.id, u.full_name
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.project_id = $1
		ORDER BY t.position ASC
	`

	tRows, err := database.DB.Query(r.Context(), taskQuery, projectID)
	if err != nil {
		http.Error(w, "Failed to load tasks", http.StatusInternalServerError)
		return
	}
	defer tRows.Close()

	for tRows.Next() {
		var t Task
		var uID, uName *string // Nullable scan targets

		err := tRows.Scan(
			&t.ID, &t.ShortID, &t.ColumnID, &t.Title, &t.Description,
			&t.Priority, &t.DueDate, &t.Position, &t.IsComplete,
			&uID, &uName,
		)

		if err != nil {
			continue // Skip bad rows
		}

		// If Assignee exists, build the object
		if uID != nil && uName != nil {
			t.Assignee = &UserSummary{
				ID:       *uID,
				FullName: *uName,
			}
		}

		// Find the column and append the task
		if col, exists := columnMap[t.ColumnID]; exists {
			col.Tasks = append(col.Tasks, t)
		}
	}

	// 4. Return the Aggregated Data
	response := BoardData{
		Project: p,
		Columns: columns,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// --- Helper Handlers for Columns ---

func HandleCreateColumn(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	var req struct {
		Name string `json:"name"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	// Get max position
	var maxPos int
	database.DB.QueryRow(r.Context(), "SELECT COALESCE(MAX(position), 0) FROM columns WHERE project_id=$1", projectID).Scan(&maxPos)

	var c BoardColumn
	err := database.DB.QueryRow(r.Context(),
		"INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING id, name",
		projectID, req.Name, maxPos+10000).Scan(&c.ID, &c.Name)

	if err != nil {
		http.Error(w, "Failed to create column", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(c)
}
