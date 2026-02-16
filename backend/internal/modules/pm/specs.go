package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateSpec creates a new spec
func HandleCreateSpec(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateSpecRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	spec, err := services.CreateSpec(r.Context(), req, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create spec"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(spec)
}

// HandleListSpecs lists all specs for the current user with optional filtering
func HandleListSpecs(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var entityType, entityID *string
	if et := r.URL.Query().Get("entity_type"); et != "" {
		entityType = &et
	}
	if eid := r.URL.Query().Get("entity_id"); eid != "" {
		entityID = &eid
	}

	specs, err := services.ListSpecs(r.Context(), userID, entityType, entityID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch specs"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(specs)
}

// HandleGetSpec returns a single spec
func HandleGetSpec(w http.ResponseWriter, r *http.Request) {
	specID := chi.URLParam(r, "id")

	spec, err := services.GetSpec(r.Context(), specID)
	if err != nil {
		http.Error(w, `{"error": "Spec not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(spec)
}

// HandleUpdateSpec updates a spec
func HandleUpdateSpec(w http.ResponseWriter, r *http.Request) {
	specID := chi.URLParam(r, "id")

	var req dto.UpdateSpecRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.UpdateSpec(r.Context(), specID, req); err != nil {
		http.Error(w, `{"error": "Failed to update spec"}`, http.StatusInternalServerError)
		return
	}

	spec, _ := services.GetSpec(r.Context(), specID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(spec)
}

// HandleDeleteSpec deletes a spec
func HandleDeleteSpec(w http.ResponseWriter, r *http.Request) {
	specID := chi.URLParam(r, "id")

	if err := services.DeleteSpec(r.Context(), specID); err != nil {
		http.Error(w, `{"error": "Failed to delete spec"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Spec deleted successfully"})
}
