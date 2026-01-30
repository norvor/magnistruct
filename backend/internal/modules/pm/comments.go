package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// Comment Model with nested User
type Comment struct {
	ID        string      `json:"id"`
	TaskID    string      `json:"task_id"`
	Content   string      `json:"content"`
	CreatedAt time.Time   `json:"created_at"`
	User      UserSummary `json:"user"` // Reuses UserSummary from board.go
}

// HandleListComments: Fetch conversation history for a specific task
func HandleListComments(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	// Join with users table to show WHO said it
	query := `
		SELECT 
			c.id, c.task_id, c.content, c.created_at,
			u.id, u.full_name
		FROM task_comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.task_id = $1
		ORDER BY c.created_at ASC
	`

	rows, err := database.DB.Query(r.Context(), query, taskID)
	if err != nil {
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	comments := []Comment{}
	for rows.Next() {
		var c Comment
		var uID, uName string

		// Scan row into variables
		if err := rows.Scan(&c.ID, &c.TaskID, &c.Content, &c.CreatedAt, &uID, &uName); err != nil {
			continue
		}

		// Construct the nested User object
		c.User = UserSummary{
			ID:       uID,
			FullName: uName,
		}

		comments = append(comments, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// HandleCreateComment: Post a new message
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	// 1. Parse Request
	var req struct {
		UserID  string `json:"user_id"` // In a real app, get this from Context/Session
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Content == "" {
		http.Error(w, "Comment cannot be empty", http.StatusBadRequest)
		return
	}

	// 2. Insert into DB
	var c Comment
	query := `
		INSERT INTO task_comments (task_id, user_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`

	err := database.DB.QueryRow(r.Context(), query, taskID, req.UserID, req.Content).
		Scan(&c.ID, &c.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to post comment", http.StatusInternalServerError)
		return
	}

	// 3. Fetch User Details immediately to return full object (Optimistic UI support)
	var uName string
	database.DB.QueryRow(r.Context(), "SELECT full_name FROM users WHERE id=$1", req.UserID).Scan(&uName)

	// 4. Return Full Comment Object
	c.TaskID = taskID
	c.Content = req.Content
	c.User = UserSummary{
		ID:       req.UserID,
		FullName: uName,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}
