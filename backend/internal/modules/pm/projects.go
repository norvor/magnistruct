package pm

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// --- PROJECT HANDLERS ---

// HandleListProjects: GET /api/projects
func HandleListProjects(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := ctx.Value("userID").(string)

	// Fetch projects where the user is the creator (or add logic for team membership later)
	rows, err := database.DB.Query(ctx, `
		SELECT id, name, description, active_engines 
		FROM projects 
		WHERE created_by = $1 
		ORDER BY created_at DESC
	`, userID)

	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var p Project
		rows.Scan(&p.ID, &p.Name, &p.Description, &p.ActiveEngines)
		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// HandleCreateProject: POST /api/projects
func HandleCreateProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := ctx.Value("userID").(string)

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	var p Project
	// Default to 'classic' engine enabled
	err := database.DB.QueryRow(ctx, `
		INSERT INTO projects (name, description, created_by, active_engines) 
		VALUES ($1, $2, $3, '{classic}') 
		RETURNING id, name, description, active_engines
	`, req.Name, req.Description, userID).Scan(&p.ID, &p.Name, &p.Description, &p.ActiveEngines)

	if err != nil {
		http.Error(w, "Failed to create project", 500)
		return
	}

	// Initialize Default Columns for Classic View
	database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position) VALUES ($1, 'Backlog', 10000)", p.ID)
	database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position) VALUES ($1, 'In Progress', 20000)", p.ID)
	database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position) VALUES ($1, 'Done', 30000)", p.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// HandleToggleEngine: PUT /api/projects/{projectID}/engines
func HandleToggleEngine(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	var req struct {
		EngineType string `json:"engine_type"`
		IsActive   bool   `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	// Update the array using Postgres array functions
	var query string
	if req.IsActive {
		// Add engine if not exists
		query = "UPDATE projects SET active_engines = array_append(active_engines, $1) WHERE id=$2 AND NOT ($1 = ANY(active_engines))"
	} else {
		// Remove engine
		query = "UPDATE projects SET active_engines = array_remove(active_engines, $1) WHERE id=$2"
	}

	_, err := database.DB.Exec(r.Context(), query, req.EngineType, projectID)
	if err != nil {
		http.Error(w, "Failed to toggle engine", 500)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// --- BOARD HANDLERS ---

// HandleGetBoard: GET /api/projects/{projectID}/board
func HandleGetBoard(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	ctx := r.Context()

	// 1. FETCH PROJECT
	var p Project
	err := database.DB.QueryRow(ctx, `
		SELECT id, name, description, active_engines 
		FROM projects WHERE id = $1
	`, projectID).Scan(&p.ID, &p.Name, &p.Description, &p.ActiveEngines)

	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "Project not found", 404)
		} else {
			fmt.Println("❌ Project Fetch Error:", err)
			http.Error(w, "DB Error", 500)
		}
		return
	}

	// 2. FETCH COLUMNS
	rows, err := database.DB.Query(ctx, `
		SELECT id, name, position 
		FROM boards_columns 
		WHERE project_id = $1 
		ORDER BY position ASC
	`, projectID)
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	columnMap := make(map[string]*BoardColumn)
	var orderedCols []*BoardColumn

	for rows.Next() {
		var c BoardColumn
		rows.Scan(&c.ID, &c.Name, &c.Position)
		c.Tasks = []Task{}
		columnMap[c.ID] = &c
		orderedCols = append(orderedCols, &c)
	}

	// 3. FETCH TASKS
	taskRows, err := database.DB.Query(ctx, `
		SELECT 
			t.id, t.title, t.description, t.engine_type,
			tc.column_id, tc.position, tc.priority, tc.due_date, tc.is_complete,
			tc.estimated_hours, tc.logged_hours, tc.story_points
		FROM tasks t
		LEFT JOIN tasks_classic tc ON t.id = tc.super_task_id
		WHERE t.project_id = $1 AND t.engine_type = 'classic'
		ORDER BY tc.position ASC
	`, projectID)
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer taskRows.Close()

	var orphans []Task

	for taskRows.Next() {
		var t Task
		var c ClassicData

		// Nullable Pointers for Scan
		var colID, priority *string
		var pos, est, log *float64
		var due *time.Time
		var complete *bool
		var pts *int

		taskRows.Scan(
			&t.ID, &t.Title, &t.Description, &t.EngineType,
			&colID, &pos, &priority, &due, &complete,
			&est, &log, &pts,
		)

		// Map to Struct
		if colID != nil {
			c.ColumnID = *colID
		}
		if pos != nil {
			c.Position = *pos
		}
		if priority != nil {
			c.Priority = *priority
		} else {
			c.Priority = "p4"
		}
		c.DueDate = due
		if complete != nil {
			c.IsComplete = *complete
		}
		if est != nil {
			c.EstHours = *est
		}
		if log != nil {
			c.LogHours = *log
		}
		if pts != nil {
			c.StoryPoints = *pts
		}

		// Fetch Subtasks
		subRows, _ := database.DB.Query(ctx, "SELECT id, title, is_complete FROM subtasks WHERE parent_classic_id = $1", t.ID)
		c.Subtasks = []Subtask{}
		for subRows.Next() {
			var s Subtask
			subRows.Scan(&s.ID, &s.Title, &s.IsComplete)
			c.Subtasks = append(c.Subtasks, s)
		}
		subRows.Close()

		t.Classic = &c

		if col, ok := columnMap[c.ColumnID]; ok {
			col.Tasks = append(col.Tasks, t)
		} else {
			orphans = append(orphans, t)
		}
	}

	// 4. RESPONSE
	finalCols := make([]BoardColumn, 0)
	for _, c := range orderedCols {
		finalCols = append(finalCols, *c)
	}
	if orphans == nil {
		orphans = []Task{}
	}

	resp := BoardResponse{Project: p, Columns: finalCols, OrphanedTasks: orphans}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleCreateColumn: POST /api/projects/{projectID}/columns
func HandleCreateColumn(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	var req struct {
		Name string `json:"name"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	var maxPos int
	database.DB.QueryRow(r.Context(), "SELECT COALESCE(MAX(position), 0) FROM boards_columns WHERE project_id=$1", projectID).Scan(&maxPos)

	var c BoardColumn
	err := database.DB.QueryRow(r.Context(), "INSERT INTO boards_columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING id, name", projectID, req.Name, maxPos+10000).Scan(&c.ID, &c.Name)

	if err != nil {
		http.Error(w, "Failed", 500)
		return
	}
	json.NewEncoder(w).Encode(c)
}
