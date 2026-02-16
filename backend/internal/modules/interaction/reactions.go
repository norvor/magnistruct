package interaction

import (
	"encoding/json"
	"net/http"

	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// ============================================================================
// REACTIONS HANDLERS
// ============================================================================

// HandleAddReaction adds an emoji reaction to an entity
func HandleAddReaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		EntityType string `json:"entity_type"`
		EntityID   string `json:"entity_id"`
		Emoji      string `json:"emoji"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request"}`, 400)
		return
	}

	reaction, err := services.AddReaction(r.Context(), dto.AddReactionRequest{
		EntityType: req.EntityType,
		EntityID:   req.EntityID,
		Emoji:      req.Emoji,
	}, userID)

	if err != nil {
		http.Error(w, `{"error":"Failed to add reaction"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reaction)
}

// HandleRemoveReaction removes a user's reaction
func HandleRemoveReaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	
	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")
	emoji := r.URL.Query().Get("emoji")

	if entityType == "" || entityID == "" || emoji == "" {
		http.Error(w, `{"error":"entity_type, entity_id, and emoji required"}`, 400)
		return
	}

	err := services.RemoveReaction(r.Context(), entityType, entityID, emoji, userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to remove reaction"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// HandleListReactions returns all reactions for an entity
func HandleListReactions(w http.ResponseWriter, r *http.Request) {
	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")

	if entityType == "" || entityID == "" {
		http.Error(w, `{"error":"entity_type and entity_id required"}`, 400)
		return
	}

	reactions, err := services.ListReactions(r.Context(), entityType, entityID)
	if err != nil {
		http.Error(w, `{"error":"Failed to list reactions"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reactions)
}

// HandleGetReactionSummary returns aggregated reaction counts
func HandleGetReactionSummary(w http.ResponseWriter, r *http.Request) {
	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")

	if entityType == "" || entityID == "" {
		http.Error(w, `{"error":"entity_type and entity_id required"}`, 400)
		return
	}

	summary, err := services.GetReactionSummary(r.Context(), entityType, entityID)
	if err != nil {
		http.Error(w, `{"error":"Failed to get summary"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}
