package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateGoal creates a new goal
func HandleCreateGoal(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateGoalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	svc := services.NewPMGoalsService()
	goal, err := svc.CreateGoal(r.Context(), userID, req)
	if err != nil {
		http.Error(w, `{"error": "Failed to create goal"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(goal)
}

// HandleListGoals lists all goals
func HandleListGoals(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	svc := services.NewPMGoalsService()
	goals, err := svc.ListGoals(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch goals"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goals)
}

// HandleGetGoal returns a single goal
func HandleGetGoal(w http.ResponseWriter, r *http.Request) {
	goalID := chi.URLParam(r, "id")

	svc := services.NewPMGoalsService()
	goal, err := svc.GetGoal(r.Context(), goalID)
	if err != nil {
		http.Error(w, `{"error": "Goal not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goal)
}

// HandleUpdateGoal updates a goal
func HandleUpdateGoal(w http.ResponseWriter, r *http.Request) {
	goalID := chi.URLParam(r, "id")

	var req dto.UpdateGoalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	svc := services.NewPMGoalsService()
	goal, err := svc.UpdateGoal(r.Context(), goalID, req)
	if err != nil {
		http.Error(w, `{"error": "Failed to update goal"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goal)
}

// HandleDeleteGoal deletes a goal
func HandleDeleteGoal(w http.ResponseWriter, r *http.Request) {
	goalID := chi.URLParam(r, "id")

	svc := services.NewPMGoalsService()
	if err := svc.DeleteGoal(r.Context(), goalID); err != nil {
		http.Error(w, `{"error": "Failed to delete goal"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Goal deleted successfully"})
}

// HandleUpdateGoalStep updates a goal step (e.g. toggles is_done)
func HandleUpdateGoalStep(w http.ResponseWriter, r *http.Request) {
	stepID := chi.URLParam(r, "stepId")

	var req dto.UpdateGoalStepRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	svc := services.NewPMGoalsService()
	if err := svc.UpdateGoalStep(r.Context(), stepID, req); err != nil {
		http.Error(w, `{"error": "Failed to update goal step"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Step updated successfully"})
}
