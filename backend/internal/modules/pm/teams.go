package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

func HandleListTeams(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgID")

	rows, err := database.DB.Query(r.Context(), `
		SELECT id, org_id, name, description, icon, created_at FROM teams WHERE org_id = $1 ORDER BY created_at ASC
	`, orgID)

	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	teams := []Team{}
	for rows.Next() {
		var t Team
		rows.Scan(&t.ID, &t.OrgID, &t.Name, &t.Description, &t.Icon, &t.CreatedAt)
		teams = append(teams, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

func HandleCreateTeam(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgID")

	var req Team
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	if req.Name == "" {
		http.Error(w, "Name required", 400)
		return
	}
	if req.Icon == "" {
		req.Icon = "🛡️"
	}

	var t Team
	err := database.DB.QueryRow(r.Context(), `
		INSERT INTO teams (org_id, name, description, icon) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, org_id, name, description, icon, created_at
	`, orgID, req.Name, req.Description, req.Icon).
		Scan(&t.ID, &t.OrgID, &t.Name, &t.Description, &t.Icon, &t.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to create team", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}
