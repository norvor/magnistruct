package pm

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// ==========================================
// ORGANIZATION HANDLERS
// ==========================================

// HandleCreateOrg: Creates a new billing/workspace unit
func HandleCreateOrg(w http.ResponseWriter, r *http.Request) {
	// 1. Parse Request
	var req struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	// Auto-generate slug if empty (simple version)
	if req.Slug == "" {
		req.Slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}

	userID := r.Context().Value("user_id").(string)

	// 2. Start Transaction (Org + Membership + Context Switch)
	tx, err := database.DB.Begin(r.Context())
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer tx.Rollback(r.Context())

	var orgID string

	// A. Insert Org
	err = tx.QueryRow(r.Context(), `
		INSERT INTO organizations (name, slug, plan) 
		VALUES ($1, $2, 'free') 
		RETURNING id
	`, req.Name, req.Slug).Scan(&orgID)

	if err != nil {
		http.Error(w, "Failed to create organization (Slug might be taken)", 409)
		return
	}

	// B. Make User the Owner
	_, err = tx.Exec(r.Context(), `
		INSERT INTO organization_members (org_id, user_id, role) 
		VALUES ($1, $2, 'owner')
	`, orgID, userID)
	if err != nil {
		http.Error(w, "Failed to add member", 500)
		return
	}

	// C. Switch User Context to new Org
	_, err = tx.Exec(r.Context(), `
		UPDATE users SET current_org_id = $1 WHERE id = $2
	`, orgID, userID)
	if err != nil {
		http.Error(w, "Failed to switch context", 500)
		return
	}

	tx.Commit(r.Context())

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": orgID, "slug": req.Slug})
}

// HandleGetMyOrgs: List all orgs the user belongs to
func HandleGetMyOrgs(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	rows, err := database.DB.Query(r.Context(), `
		SELECT o.id, o.name, o.slug, o.plan, m.role 
		FROM organizations o
		JOIN organization_members m ON o.id = m.org_id
		WHERE m.user_id = $1
		ORDER BY o.created_at DESC
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var orgs []map[string]interface{}
	for rows.Next() {
		var id, name, slug, plan, role string
		rows.Scan(&id, &name, &slug, &plan, &role)
		orgs = append(orgs, map[string]interface{}{
			"id": id, "name": name, "slug": slug, "plan": plan, "role": role,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orgs)
}

// HandleSwitchOrg: Updates the user's "Active Context"
func HandleSwitchOrg(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	orgID := chi.URLParam(r, "orgID")

	// 1. Verify Membership first
	var role string
	err := database.DB.QueryRow(r.Context(), `
		SELECT role FROM organization_members WHERE org_id = $1 AND user_id = $2
	`, orgID, userID).Scan(&role)

	if err != nil {
		http.Error(w, "You are not a member of this organization", 403)
		return
	}

	// 2. Update User Context
	_, err = database.DB.Exec(r.Context(), `UPDATE users SET current_org_id = $1 WHERE id = $2`, orgID, userID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// ==========================================
// TEAM HANDLERS
// ==========================================
