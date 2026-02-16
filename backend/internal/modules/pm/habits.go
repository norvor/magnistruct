package pm

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateHabit creates a new habit
func HandleCreateHabit(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateHabitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, 400)
		return
	}

	habit, err := services.CreateHabit(r.Context(), userID, req)
	if err != nil {
		http.Error(w, `{"error":"Failed to create habit"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habit)
}

// HandleListHabits returns user's habits
func HandleListHabits(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	habits, err := services.ListHabits(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to list habits"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habits)
}

// HandleToggleHabit marks a habit as complete/incomplete
func HandleToggleHabit(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	habitID := chi.URLParam(r, "id")

	var req dto.ToggleHabitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		req.Date = time.Now().Format("2006-01-02")
	}
	
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	habit, err := services.ToggleHabit(r.Context(), habitID, userID, req.Date)
	if err != nil {
		http.Error(w, `{"error":"Failed to toggle habit"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habit)
}

// HandleDeleteHabit deletes a habit
func HandleDeleteHabit(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	habitID := chi.URLParam(r, "id")

	if err := services.DeleteHabit(r.Context(), habitID, userID); err != nil {
		http.Error(w, `{"error":"Failed to delete habit"}`, 500)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success":true}`))
}
