package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateEnvironment creates a new environment
func HandleCreateEnvironment(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateEnvironmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	env, err := services.CreateEnvironment(r.Context(), req, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create environment"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(env)
}

// HandleListEnvironments lists all environments for the current user
func HandleListEnvironments(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	envs, err := services.ListEnvironments(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch environments"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(envs)
}

// HandleGetEnvironment returns a single environment
func HandleGetEnvironment(w http.ResponseWriter, r *http.Request) {
	envID := chi.URLParam(r, "id")

	env, err := services.GetEnvironment(r.Context(), envID)
	if err != nil {
		http.Error(w, `{"error": "Environment not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(env)
}

// HandleUpdateEnvironment updates an environment
func HandleUpdateEnvironment(w http.ResponseWriter, r *http.Request) {
	envID := chi.URLParam(r, "id")

	var req dto.UpdateEnvironmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.UpdateEnvironment(r.Context(), envID, req); err != nil {
		http.Error(w, `{"error": "Failed to update environment"}`, http.StatusInternalServerError)
		return
	}

	env, _ := services.GetEnvironment(r.Context(), envID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(env)
}

// HandleDeleteEnvironment deletes an environment
func HandleDeleteEnvironment(w http.ResponseWriter, r *http.Request) {
	envID := chi.URLParam(r, "id")

	if err := services.DeleteEnvironment(r.Context(), envID); err != nil {
		http.Error(w, `{"error": "Failed to delete environment"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Environment deleted successfully"})
}
