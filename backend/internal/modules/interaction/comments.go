package interaction

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// ============================================================================
// COMMENTS HANDLERS
// ============================================================================

// HandleCreateComment creates a new comment on an entity
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		EntityType string `json:"entity_type"`
		EntityID   string `json:"entity_id"`
		Content    string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request"}`, 400)
		return
	}

	comment, err := services.CreateComment(r.Context(), dto.CreateCommentRequest{
		EntityType: req.EntityType,
		EntityID:   req.EntityID,
		Content:    req.Content,
	}, userID)

	if err != nil {
		http.Error(w, `{"error":"Failed to create comment"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

// HandleListComments returns all comments for an entity
func HandleListComments(w http.ResponseWriter, r *http.Request) {
	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")

	if entityType == "" || entityID == "" {
		http.Error(w, `{"error":"entity_type and entity_id required"}`, 400)
		return
	}

	comments, err := services.ListComments(r.Context(), entityType, entityID)
	if err != nil {
		http.Error(w, `{"error":"Failed to list comments"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// HandleGetComment returns a single comment by ID
func HandleGetComment(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "id")

	comment, err := services.GetComment(r.Context(), commentID)
	if err != nil {
		http.Error(w, `{"error":"Comment not found"}`, 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

// HandleUpdateComment updates a comment
func HandleUpdateComment(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	commentID := chi.URLParam(r, "id")

	var req struct {
		Content *string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request"}`, 400)
		return
	}

	err := services.UpdateComment(r.Context(), commentID, dto.UpdateCommentRequest{
		Content: req.Content,
	}, userID)

	if err != nil {
		http.Error(w, `{"error":"Failed to update comment"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// HandleDeleteComment deletes a comment
func HandleDeleteComment(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	commentID := chi.URLParam(r, "id")

	err := services.DeleteComment(r.Context(), commentID, userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to delete comment"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// HandleGetRecentComments returns recent comments (activity feed)
func HandleGetRecentComments(w http.ResponseWriter, r *http.Request) {
	comments, err := services.GetRecentComments(r.Context(), 20)
	if err != nil {
		http.Error(w, `{"error":"Failed to get recent comments"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}
