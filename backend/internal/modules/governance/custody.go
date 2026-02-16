package governance

import (
	"encoding/json"
	"net/http"

	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleTransferOwnership transfers ownership of an entity
func HandleTransferOwnership(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CustodyTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.TransferOwnership(r.Context(), req, userID); err != nil {
		http.Error(w, `{"error": "Failed to transfer ownership"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Ownership transferred successfully"})
}

// HandleGetCustodyHistory returns ownership history for an entity
func HandleGetCustodyHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	
	entityType := r.URL.Query().Get("entity_type")
	entityID := r.URL.Query().Get("entity_id")

	if entityType == "" || entityID == "" {
		http.Error(w, `{"error": "entity_type and entity_id query parameters required"}`, http.StatusBadRequest)
		return
	}

	history, err := services.GetCustodyHistory(r.Context(), entityType, entityID, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch custody history"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}
