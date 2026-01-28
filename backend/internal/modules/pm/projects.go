package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
)

// Project Model (Matches DB)
type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// HandleCreateProject: Creates Project + Default Columns (To Do, In Progress, Done)
func HandleCreateProject(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 1. Start Transaction (All or Nothing)
	tx, err := database.DB.Begin(r.Context())
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context()) // Auto-rollback if we don't commit

	// 2. Create Project
	var p Project
	query := `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id, created_at`
	err = tx.QueryRow(r.Context(), query, req.Name, req.Description).Scan(&p.ID, &p.CreatedAt)
	if err != nil {
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}
	p.Name = req.Name
	p.Description = req.Description

	// 3. Create Default Columns
	defaultCols := []struct {
		Name string
		Pos  float64
	}{
		{"To Do", 10000.0},
		{"In Progress", 20000.0},
		{"Done", 30000.0},
	}

	colQuery := `INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3)`
	for _, col := range defaultCols {
		_, err := tx.Exec(r.Context(), colQuery, p.ID, col.Name, col.Pos)
		if err != nil {
			http.Error(w, "Failed to create columns", http.StatusInternalServerError)
			return
		}
	}

	// 4. Commit Transaction
	if err := tx.Commit(r.Context()); err != nil {
		http.Error(w, "Commit failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// Keep HandleListProjects as it was...
func HandleListProjects(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(r.Context(), "SELECT id, name, description, created_at FROM projects ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.CreatedAt); err != nil {
			continue
		}
		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}
