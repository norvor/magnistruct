package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateJourney creates a new journey
func HandleCreateJourney(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateJourneyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	journey, err := services.CreateJourney(r.Context(), req, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create journey"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(journey)
}

// HandleListJourneys lists all journeys
func HandleListJourneys(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var goalID *string
	if p := r.URL.Query().Get("goal_id"); p != "" {
		goalID = &p
	}

	journeys, err := services.ListJourneys(r.Context(), userID, goalID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch journeys"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(journeys)
}

// HandleGetJourney returns a single journey
func HandleGetJourney(w http.ResponseWriter, r *http.Request) {
	journeyID := chi.URLParam(r, "id")

	journey, err := services.GetJourney(r.Context(), journeyID)
	if err != nil {
		http.Error(w, `{"error": "Journey not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(journey)
}

// HandleUpdateJourney updates a journey
func HandleUpdateJourney(w http.ResponseWriter, r *http.Request) {
	journeyID := chi.URLParam(r, "id")

	var req dto.UpdateJourneyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.UpdateJourney(r.Context(), journeyID, req); err != nil {
		http.Error(w, `{"error": "Failed to update journey"}`, http.StatusInternalServerError)
		return
	}

	journey, _ := services.GetJourney(r.Context(), journeyID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(journey)
}

// HandleDeleteJourney deletes a journey
func HandleDeleteJourney(w http.ResponseWriter, r *http.Request) {
	journeyID := chi.URLParam(r, "id")

	if err := services.DeleteJourney(r.Context(), journeyID); err != nil {
		http.Error(w, `{"error": "Failed to delete journey"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Journey deleted successfully"})
}
