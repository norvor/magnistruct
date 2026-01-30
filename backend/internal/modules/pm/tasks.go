package pm

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// HandleCreateTask: Enterprise Polymorphic Creation
// ... imports ...

func HandleCreateTask(w http.ResponseWriter, r *http.Request) {
	fmt.Println("--- 🔍 STARTING TASK CREATION DEBUG ---")

	// 1. CHECK PROJECT ID
	projectID := chi.URLParam(r, "projectID")
	fmt.Printf("1. Project ID: %s\n", projectID)
	if projectID == "" {
		http.Error(w, "Missing Project ID in URL", 400)
		return
	}

	// 2. CHECK USER ID (The Panic Spot)
	rawUserID := r.Context().Value("userID")
	fmt.Printf("2. Raw User ID from Context: %v\n", rawUserID)

	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		fmt.Println("❌ CRITICAL FAILURE: User ID is missing or invalid type")
		// For debugging, we will fallback to the Demo User ID if auth fails
		// REMOVE THIS IN PRODUCTION
		fmt.Println("⚠️ FALLBACK: Using Demo User ID for debugging")
		userID = "00000000-0000-0000-0000-000000000001"
	}
	fmt.Printf("   -> Final User ID: %s\n", userID)

	// 3. DECODE BODY
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		EngineType  string `json:"engine_type"`
		ColumnID    string `json:"column_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("❌ JSON Decode Error:", err)
		http.Error(w, "Invalid JSON", 400)
		return
	}
	fmt.Printf("3. Payload: %+v\n", req)

	// 4. TRANSACTION START
	fmt.Println("4. Starting DB Transaction...")
	tx, err := database.DB.Begin(r.Context())
	if err != nil {
		fmt.Println("❌ DB Begin Error:", err)
		http.Error(w, "DB Error", 500)
		return
	}
	defer tx.Rollback(r.Context())

	// 5. INSERT BASE TASK
	var taskID string
	fmt.Println("5. Inserting into 'tasks' table...")
	err = tx.QueryRow(r.Context(), `
		INSERT INTO tasks (project_id, title, description, engine_type, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id
	`, projectID, req.Title, req.Description, req.EngineType, userID).Scan(&taskID)

	if err != nil {
		fmt.Println("❌ INSERT TASKS FAILED:", err)
		http.Error(w, "Failed to create base task: "+err.Error(), 500)
		return
	}
	fmt.Printf("   -> Task Created! ID: %s\n", taskID)

	// 6. HANDLE CLASSIC
	if req.EngineType == "classic" {
		fmt.Println("6. Initializing Classic Engine...")

		// Column Check
		if req.ColumnID == "" {
			fmt.Println("   -> No Column ID provided, fetching default...")
			err := tx.QueryRow(r.Context(), "SELECT id FROM boards_columns WHERE project_id=$1 ORDER BY position ASC LIMIT 1", projectID).Scan(&req.ColumnID)
			if err != nil {
				fmt.Println("❌ FAILED to find default column:", err)
				http.Error(w, "No columns exist for this project", 400)
				return
			}
			fmt.Printf("   -> Found Default Column: %s\n", req.ColumnID)
		}

		_, err = tx.Exec(r.Context(), `
			INSERT INTO tasks_classic (super_task_id, column_id, position, priority, is_complete)
			VALUES ($1, $2, 65535, 'p4', false)
		`, taskID, req.ColumnID)

		if err != nil {
			fmt.Println("❌ INSERT TASKS_CLASSIC FAILED:", err)
			http.Error(w, "Failed to initialize classic task: "+err.Error(), 500)
			return
		}
	}

	// 7. COMMIT
	fmt.Println("7. Committing Transaction...")
	if err := tx.Commit(r.Context()); err != nil {
		fmt.Println("❌ COMMIT FAILED:", err)
		http.Error(w, "Commit failed", 500)
		return
	}

	fmt.Println("✅ SUCCESS! Sending response.")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":          taskID,
		"title":       req.Title,
		"engine_type": req.EngineType,
		"classic": map[string]interface{}{
			"column_id": req.ColumnID,
		},
	})
}

// HandleUpdateTask: Universal Update
func HandleUpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	var req struct {
		Title       *string    `json:"title"`
		Description *string    `json:"description"`
		IsComplete  *bool      `json:"is_complete"`
		Priority    *string    `json:"priority"`
		DueDate     *time.Time `json:"due_date"`
		EstHours    *float64   `json:"estimated_hours"`
		LogHours    *float64   `json:"logged_hours"`
		StoryPts    *int       `json:"story_points"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	tx, _ := database.DB.Begin(r.Context())
	defer tx.Rollback(r.Context())

	if req.Title != nil {
		tx.Exec(r.Context(), "UPDATE tasks SET title=$1 WHERE id=$2", *req.Title, taskID)
	}
	if req.Description != nil {
		tx.Exec(r.Context(), "UPDATE tasks SET description=$1 WHERE id=$2", *req.Description, taskID)
	}
	if req.Priority != nil {
		tx.Exec(r.Context(), "UPDATE tasks_classic SET priority=$1 WHERE super_task_id=$2", *req.Priority, taskID)
	}
	if req.IsComplete != nil {
		tx.Exec(r.Context(), "UPDATE tasks_classic SET is_complete=$1 WHERE super_task_id=$2", *req.IsComplete, taskID)
	}
	// Add other updates as needed...

	tx.Commit(r.Context())
	w.WriteHeader(http.StatusOK)
}

func HandleDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	database.DB.Exec(r.Context(), "DELETE FROM tasks WHERE id = $1", taskID)
	w.WriteHeader(http.StatusOK)
}

func HandleMoveTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	var req struct {
		NewColumnID string  `json:"new_column_id"`
		NewPosition float64 `json:"new_position"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	database.DB.Exec(r.Context(), "UPDATE tasks_classic SET column_id=$1, position=$2 WHERE super_task_id=$3", req.NewColumnID, req.NewPosition, taskID)
	w.WriteHeader(http.StatusOK)
}

func HandleCreateSubtask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	var req struct {
		Title string `json:"title"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	var sub Subtask
	database.DB.QueryRow(r.Context(), "INSERT INTO subtasks (parent_classic_id, title) VALUES ($1, $2) RETURNING id, title, is_complete", taskID, req.Title).Scan(&sub.ID, &sub.Title, &sub.IsComplete)
	json.NewEncoder(w).Encode(sub)
}

func HandleToggleSubtask(w http.ResponseWriter, r *http.Request) {
	subtaskID := chi.URLParam(r, "subtaskID")
	database.DB.Exec(r.Context(), "UPDATE subtasks SET is_complete = NOT is_complete WHERE id = $1", subtaskID)
	w.WriteHeader(http.StatusOK)
}

func HandleDeleteSubtask(w http.ResponseWriter, r *http.Request) {
	subtaskID := chi.URLParam(r, "subtaskID")
	database.DB.Exec(r.Context(), "DELETE FROM subtasks WHERE id = $1", subtaskID)
	w.WriteHeader(http.StatusOK)
}

func HandleToggleTask(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	database.DB.Exec(r.Context(), "UPDATE tasks_classic SET is_complete = NOT is_complete WHERE super_task_id = $1", taskID)
	w.WriteHeader(http.StatusOK)
}
