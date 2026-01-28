package auth

import (
	"encoding/json"
	"net/http"

	"github.com/norvor/magnistruct/backend/internal/database"
)

// --- MODELS ---

type UpdateProfileRequest struct {
	FullName string `json:"full_name"`
	JobTitle string `json:"job_title"`
	Bio      string `json:"bio"`
	Theme    string `json:"theme"` // 'dark', 'light'
}

// --- HANDLERS ---

// HandleUpdateProfile: Updates user info
func HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	// 1. Get User ID from Context (Set by Middleware)
	userID := r.Context().Value("userID").(string)

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", http.StatusBadRequest)
		return
	}

	// 2. Update DB
	query := `
		UPDATE users 
		SET full_name=$1, job_title=$2, bio=$3, theme=$4, updated_at=NOW()
		WHERE id=$5
	`
	_, err := database.DB.Exec(r.Context(), query, req.FullName, req.JobTitle, req.Bio, req.Theme, userID)
	if err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Profile updated"}`))
}

// HandleGetProfile: Returns extended user info
// We update the existing 'HandleMe' in handlers.go to use this logic or keep separate.
// Let's keep it clean and just update the UserResponse struct in handlers.go instead.
