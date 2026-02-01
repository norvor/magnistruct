package pm

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// ==========================================
// CREATE HANDLER (The Polymorphic Factory)
// ==========================================

func HandleCreateTask(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		EngineType  string `json:"engine_type"`

		// Initial overrides
		Classic struct{ ColumnID string } `json:"classic"`
		Agile   struct {
			SprintID string
			Type     string
		} `json:"agile"`
		Competition struct{ Bounty int } `json:"competition"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	tx, err := database.DB.Begin(r.Context())
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer tx.Rollback(r.Context())

	// 1. Insert Base Task (With JSONB Log Initialized)
	var taskID string
	err = tx.QueryRow(r.Context(), `
        INSERT INTO tasks (project_id, title, description, engine_type, created_by, activity_log)
        VALUES ($1, $2, $3, $4, $5, '[]'::jsonb)
        RETURNING id
    `, projectID, req.Title, req.Description, req.EngineType, userID).Scan(&taskID)

	if err != nil {
		http.Error(w, "Failed to create base task: "+err.Error(), 500)
		return
	}

	// 2. Hydrate Specific Engine Table
	switch req.EngineType {
	case "classic":
		// Auto-select first column if missing
		colID := req.Classic.ColumnID
		if colID == "" {
			tx.QueryRow(r.Context(), "SELECT id FROM boards_columns WHERE project_id=$1 ORDER BY position ASC LIMIT 1", projectID).Scan(&colID)
		}
		_, err = tx.Exec(r.Context(), `
            INSERT INTO tasks_classic (super_task_id, column_id, position, priority, is_complete)
            VALUES ($1, $2, 65535, 'p4', false)
        `, taskID, colID)

	case "agile":
		sprintID := &req.Agile.SprintID
		if req.Agile.SprintID == "" {
			sprintID = nil
		}
		storyType := req.Agile.Type
		if storyType == "" {
			storyType = "story"
		}

		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_agile (super_task_id, sprint_id, type, status, story_points)
			VALUES ($1, $2, $3, 'todo', 0)
		`, taskID, sprintID, storyType)

	case "venture":
		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_venture (super_task_id, stage, confidence_score, risk_level)
			VALUES ($1, 'discovery', 0, 'high')
		`, taskID)

	case "stream":
		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_stream (super_task_id, lifecycle_stage, is_stalled, priority_score)
			VALUES ($1, 'intake', false, 0.0)
		`, taskID)

	case "loop":
		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_loop (super_task_id, frequency_type, is_paused)
			VALUES ($1, 'weekly', false)
		`, taskID)

	case "competition":
		bounty := req.Competition.Bounty
		if bounty == 0 {
			bounty = 100
		}
		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_competition (super_task_id, bounty_points, status, difficulty)
			VALUES ($1, $2, 'open', 'medium')
		`, taskID, bounty)
	}

	if err != nil {
		http.Error(w, "Engine provision failed: "+err.Error(), 500)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		http.Error(w, "Commit failed", 500)
		return
	}

	// 3. Log Creation (Using the new JSONB helper)
	LogActivity(r.Context(), taskID, userID, "create", fmt.Sprintf("Created %s task", req.EngineType))

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": taskID})
}

// ==========================================
// UPDATE HANDLER (The Universal Updater)
// ==========================================

func HandleUpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	userID, _ := r.Context().Value("user_id").(string)

	// Decode into a map for flexibility, or a huge struct
	// For "God Mode", a mapped struct is safer for null checks
	var req struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`

		// Classic / Agile
		IsComplete *bool      `json:"is_complete"`
		Priority   *string    `json:"priority"`
		DueDate    *time.Time `json:"due_date"`
		Points     *int       `json:"story_points"`
		Status     *string    `json:"status"` // Agile status or Venture stage

		// Venture
		Confidence *int    `json:"confidence_score"`
		Risk       *string `json:"risk_level"`
		MarketSize *string `json:"market_size_estimate"`
		Evidence   *string `json:"validation_evidence"`

		// Stream
		IsStalled   *bool      `json:"is_stalled"`
		StallReason *string    `json:"stall_reason"`
		SLA         *time.Time `json:"sla_due_at"`

		// Competition
		Bounty     *int    `json:"bounty_points"`
		Submission *string `json:"submission_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	tx, _ := database.DB.Begin(r.Context())
	defer tx.Rollback(r.Context())

	// 1. Base Updates
	if req.Title != nil {
		tx.Exec(r.Context(), "UPDATE tasks SET title=$1 WHERE id=$2", *req.Title, taskID)
		LogActivity(r.Context(), taskID, userID, "update", "Renamed task")
	}
	if req.Description != nil {
		tx.Exec(r.Context(), "UPDATE tasks SET description=$1 WHERE id=$2", *req.Description, taskID)
		LogActivity(r.Context(), taskID, userID, "update", "Updated description")
	}

	// 2. Engine Specific Updates
	// Note: We use "COALESCE" logic or separate queries.
	// To keep it clean, we fire specific updates based on what's present.

	// CLASSIC
	if req.IsComplete != nil {
		tx.Exec(r.Context(), "UPDATE tasks_classic SET is_complete=$1 WHERE super_task_id=$2", *req.IsComplete, taskID)
		if *req.IsComplete {
			LogActivity(r.Context(), taskID, userID, "complete", "Task completed")
		} else {
			LogActivity(r.Context(), taskID, userID, "reopen", "Task re-opened")
		}
	}
	if req.Priority != nil {
		tx.Exec(r.Context(), "UPDATE tasks_classic SET priority=$1 WHERE super_task_id=$2", *req.Priority, taskID)
		LogActivity(r.Context(), taskID, userID, "update", "Priority changed to "+*req.Priority)
	}

	// AGILE
	if req.Points != nil {
		tx.Exec(r.Context(), "UPDATE tasks_agile SET story_points=$1 WHERE super_task_id=$2", *req.Points, taskID)
		LogActivity(r.Context(), taskID, userID, "update", fmt.Sprintf("Points set to %d", *req.Points))
	}
	if req.Status != nil {
		// Applies to Agile (todo/done) OR Venture (stage)
		// We try both safely
		tx.Exec(r.Context(), "UPDATE tasks_agile SET status=$1 WHERE super_task_id=$2", *req.Status, taskID)
		tx.Exec(r.Context(), "UPDATE tasks_venture SET stage=$1 WHERE super_task_id=$2", *req.Status, taskID)
		LogActivity(r.Context(), taskID, userID, "move", "Status changed to "+*req.Status)
	}

	// VENTURE
	if req.Confidence != nil {
		tx.Exec(r.Context(), "UPDATE tasks_venture SET confidence_score=$1 WHERE super_task_id=$2", *req.Confidence, taskID)
	}
	if req.MarketSize != nil {
		tx.Exec(r.Context(), "UPDATE tasks_venture SET market_size_estimate=$1 WHERE super_task_id=$2", *req.MarketSize, taskID)
	}
	if req.Evidence != nil {
		tx.Exec(r.Context(), "UPDATE tasks_venture SET validation_evidence=$1 WHERE super_task_id=$2", *req.Evidence, taskID)
		LogActivity(r.Context(), taskID, userID, "update", "Added validation evidence")
	}

	// STREAM
	if req.IsStalled != nil {
		tx.Exec(r.Context(), "UPDATE tasks_stream SET is_stalled=$1 WHERE super_task_id=$2", *req.IsStalled, taskID)
		if *req.IsStalled {
			LogActivity(r.Context(), taskID, userID, "stall", "Task Stalled")
		} else {
			LogActivity(r.Context(), taskID, userID, "resume", "Task Resumed")
		}
	}
	if req.StallReason != nil {
		tx.Exec(r.Context(), "UPDATE tasks_stream SET stall_reason=$1 WHERE super_task_id=$2", *req.StallReason, taskID)
	}

	// COMPETITION
	if req.Bounty != nil {
		tx.Exec(r.Context(), "UPDATE tasks_competition SET bounty_points=$1 WHERE super_task_id=$2", *req.Bounty, taskID)
		LogActivity(r.Context(), taskID, userID, "update", fmt.Sprintf("Bounty updated to %d", *req.Bounty))
	}
	if req.Submission != nil {
		tx.Exec(r.Context(), "UPDATE tasks_competition SET submission_url=$1, status='claimed', claimed_by=$2, claimed_at=NOW() WHERE super_task_id=$3", *req.Submission, userID, taskID)
		LogActivity(r.Context(), taskID, userID, "submit", "Solution submitted")
	}

	tx.Commit(r.Context())
	w.WriteHeader(http.StatusOK)
}

// ==========================================
// MOVEMENT & DELETION
// ==========================================

func HandleMoveTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	userID, _ := r.Context().Value("user_id").(string)

	var req struct {
		ColumnID string  `json:"column_id"`
		Position float64 `json:"position"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	_, err := database.DB.Exec(r.Context(), `
		UPDATE tasks_classic 
		SET column_id = $1, position = $2 
		WHERE super_task_id = $3
	`, req.ColumnID, req.Position, taskID)

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	LogActivity(r.Context(), taskID, userID, "move", "Moved task")
	w.WriteHeader(http.StatusOK)
}

func HandleDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	database.DB.Exec(r.Context(), "DELETE FROM tasks WHERE id = $1", taskID)
	w.WriteHeader(http.StatusOK)
}

// HandleGetTaskActivity: Returns the JSONB log
func HandleGetTaskActivity(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	// We read the JSONB column directly
	var logJSON []byte
	err := database.DB.QueryRow(r.Context(), `SELECT activity_log FROM tasks WHERE id=$1`, taskID).Scan(&logJSON)

	if err != nil {
		http.Error(w, "Task not found", 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(logJSON)
}

// ... (inside tasks.go) ...

// ==========================================
// SUBTASK HANDLERS
// ==========================================

func HandleCreateSubtask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	var sub Subtask
	err := database.DB.QueryRow(r.Context(), `
		INSERT INTO subtasks (parent_task_id, title) 
		VALUES ($1, $2) 
		RETURNING id, title, is_complete
	`, taskID, req.Title).Scan(&sub.ID, &sub.Title, &sub.IsComplete)

	if err != nil {
		http.Error(w, "Failed to create subtask", 500)
		return
	}

	LogActivity(r.Context(), taskID, userID, "subtask", "Added subtask: "+req.Title)
	json.NewEncoder(w).Encode(sub)
}

func HandleListSubtasks(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	ctx := r.Context()

	// Query subtasks linked to this parent
	// Ordered by ID (creation order) so they appear in the order added
	rows, err := database.DB.Query(ctx, `
        SELECT id, parent_task_id, title, is_complete 
        FROM subtasks 
        WHERE parent_task_id = $1 
        ORDER BY id ASC
    `, taskID)

	if err != nil {
		log.Println("Error listing subtasks:", err)
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	var subtasks []Subtask
	for rows.Next() {
		var s Subtask
		// Ensure your Subtask struct has these fields
		// mapping 'is_complete' (DB) to the struct field
		if err := rows.Scan(&s.ID, &s.TaskID, &s.Title, &s.IsComplete); err != nil {
			continue
		}
		subtasks = append(subtasks, s)
	}

	// Return empty list instead of null if none found
	if subtasks == nil {
		subtasks = []Subtask{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subtasks)
}

func HandleToggleSubtask(w http.ResponseWriter, r *http.Request) {
	subtaskID := chi.URLParam(r, "subtaskID")
	// Note: We need the parent task ID for logging.

	var taskID string
	var newStatus bool

	// Toggle and get Parent ID in one go
	err := database.DB.QueryRow(r.Context(), `
		UPDATE subtasks 
		SET is_complete = NOT is_complete 
		WHERE id = $1 
		RETURNING parent_task_id, is_complete
	`, subtaskID).Scan(&taskID, &newStatus)

	if err != nil {
		http.Error(w, "Subtask not found", 404)
		return
	}

	userID := r.Context().Value("user_id").(string)
	if newStatus {
		LogActivity(r.Context(), taskID, userID, "subtask", "Completed a subtask")
	} else {
		LogActivity(r.Context(), taskID, userID, "subtask", "Unchecked a subtask")
	}

	w.WriteHeader(http.StatusOK)
}

func HandleDeleteSubtask(w http.ResponseWriter, r *http.Request) {
	subtaskID := chi.URLParam(r, "subtaskID")

	// Get Parent ID first for logging (optional, but good practice)
	var taskID string
	database.DB.QueryRow(r.Context(), "SELECT parent_task_id FROM subtasks WHERE id=$1", subtaskID).Scan(&taskID)

	_, err := database.DB.Exec(r.Context(), "DELETE FROM subtasks WHERE id = $1", subtaskID)
	if err != nil {
		http.Error(w, "Delete failed", 500)
		return
	}

	if taskID != "" {
		userID := r.Context().Value("user_id").(string)
		LogActivity(r.Context(), taskID, userID, "subtask", "Deleted a subtask")
	}

	w.WriteHeader(http.StatusOK)
}
