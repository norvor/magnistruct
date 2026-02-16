package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// HandleListComments: Fetch conversation history from sys_comments
func HandleListComments(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")

	query := `
        SELECT 
            c.id, c.entity_id, c.content, c.created_at,
            u.id, u.full_name, u.avatar_url
        FROM sys_comments c
        JOIN sys_users u ON c.user_id = u.id
        WHERE c.entity_id = $1 AND c.entity_type = 'pm_work_item'
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
		var uAvatar *string

		if err := rows.Scan(&c.ID, &c.EntityID, &c.Content, &c.CreatedAt, &uID, &uName, &uAvatar); err != nil {
			continue
		}

		c.UserID = uID
		c.User = &UserSummary{
			ID:       uID,
			FullName: uName,
		}
		if uAvatar != nil {
			c.User.AvatarURL = *uAvatar
		}

		comments = append(comments, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// HandleCreateComment: Post a new message to sys_comments
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskID")
	userID := r.Context().Value("user_id").(string)

	var req struct {
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

	var c Comment
	query := `
        INSERT INTO sys_comments (entity_type, entity_id, user_id, content)
        VALUES ('pm_work_item', $1, $2, $3)
        RETURNING id, created_at
    `

	err := database.DB.QueryRow(r.Context(), query, taskID, userID, req.Content).
		Scan(&c.ID, &c.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to post comment", http.StatusInternalServerError)
		return
	}

	// Fetch User Details for response
	var uName string
	var uAvatar *string
	database.DB.QueryRow(r.Context(), "SELECT full_name, avatar_url FROM sys_users WHERE id=$1", userID).Scan(&uName, &uAvatar)

	c.UserID = userID
	c.Content = req.Content
	c.EntityID = taskID
	c.User = &UserSummary{
		ID:       userID,
		FullName: uName,
	}
	if uAvatar != nil {
		c.User.AvatarURL = *uAvatar
	}

	LogActivity(r.Context(), taskID, userID, "comment", "Posted a comment")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}
