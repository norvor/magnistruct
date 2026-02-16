package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateResource creates a new resource
func HandleCreateResource(w http.ResponseWriter, r *http.Request) {
	uploaderID := r.Context().Value("user_id").(string)

	var req dto.CreateResourceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	resource, err := services.CreateResource(r.Context(), req, uploaderID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create resource"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resource)
}

// HandleListResources lists all resources for the current user
func HandleListResources(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	resources, err := services.ListResources(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch resources"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}

// HandleGetResource returns a single resource
func HandleGetResource(w http.ResponseWriter, r *http.Request) {
	resourceID := chi.URLParam(r, "id")

	resource, err := services.GetResource(r.Context(), resourceID)
	if err != nil {
		http.Error(w, `{"error": "Resource not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}

// HandleUpdateResource updates a resource
func HandleUpdateResource(w http.ResponseWriter, r *http.Request) {
	resourceID := chi.URLParam(r, "id")

	var req dto.UpdateResourceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.UpdateResource(r.Context(), resourceID, req); err != nil {
		http.Error(w, `{"error": "Failed to update resource"}`, http.StatusInternalServerError)
		return
	}

	resource, _ := services.GetResource(r.Context(), resourceID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}

// HandleDeleteResource deletes a resource
func HandleDeleteResource(w http.ResponseWriter, r *http.Request) {
	resourceID := chi.URLParam(r, "id")

	if err := services.DeleteResource(r.Context(), resourceID); err != nil {
		http.Error(w, `{"error": "Failed to delete resource"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Resource deleted successfully"})
}
