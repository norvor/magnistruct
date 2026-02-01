package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"golang.org/x/crypto/bcrypt"
)

// --- MODELS ---

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	FullName string `json:"full_name"`
	JobTitle string `json:"job_title"`
	Bio      string `json:"bio"`
	Theme    string `json:"theme"`
}

type UserResponse struct {
	ID           string  `json:"id"`
	Email        string  `json:"email"`
	FullName     string  `json:"full_name"`
	Avatar       string  `json:"avatar"`
	JobTitle     string  `json:"job_title"`
	Bio          string  `json:"bio"`
	Theme        string  `json:"theme"`
	CurrentOrgID *string `json:"current_org_id"`
}

// --- HELPERS ---
func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

func sanitizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// --- HANDLERS ---

// ... (Models remain the same) ...
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	OrgName  string `json:"org_name"`
}

// ... (LoginRequest, etc. unchanged) ...

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", 400)
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	if cleanEmail == "" || req.Password == "" || req.FullName == "" {
		http.Error(w, "Missing fields", 400)
		return
	}

	if req.OrgName == "" {
		req.OrgName = fmt.Sprintf("%s's Workspace", strings.Split(req.FullName, " ")[0])
	}
	orgSlug := strings.ToLower(strings.ReplaceAll(req.OrgName, " ", "-")) + "-" + fmt.Sprintf("%d", time.Now().Unix()%1000)

	// START TRANSACTION
	tx, err := database.DB.Begin(r.Context())
	if err != nil {
		http.Error(w, "Server error", 500)
		return
	}
	defer tx.Rollback(r.Context())

	// 1. Create Organization
	var orgID string
	err = tx.QueryRow(r.Context(), `INSERT INTO organizations (name, slug, plan) VALUES ($1, $2, 'free') RETURNING id`, req.OrgName, orgSlug).Scan(&orgID)
	if err != nil {
		http.Error(w, "Failed to create organization", 500)
		return
	}

	// NOTE: We do NOT create a team here anymore. That is a separate flow.

	// 2. Hash Password & Create User
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	var userID string
	err = tx.QueryRow(r.Context(), `
		INSERT INTO users (email, password_hash, full_name, current_org_id) VALUES ($1, $2, $3, $4) RETURNING id
	`, cleanEmail, string(hash), req.FullName, orgID).Scan(&userID)
	if err != nil {
		http.Error(w, "Email exists", 409)
		return
	}

	// 3. Link User to Org
	tx.Exec(r.Context(), `INSERT INTO organization_members (org_id, user_id, role) VALUES ($1, $2, 'owner')`, orgID, userID)

	tx.Commit(r.Context())

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Workspace ready"}`))
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	cleanEmail := sanitizeEmail(req.Email)
	var id, hash string
	err := database.DB.QueryRow(r.Context(), "SELECT id, password_hash FROM users WHERE email=$1", cleanEmail).Scan(&id, &hash)

	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token := generateToken()
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	database.DB.Exec(r.Context(), "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", token, id, expiresAt)

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
	w.Write([]byte(`{"message": "Logged in"}`))
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	// FIX: Use "user_id" (snake_case) to match Middleware
	ctxVal := r.Context().Value("user_id")
	if ctxVal == nil {
		fmt.Println("❌ HandleMe: Context 'user_id' is nil")
		http.Error(w, "Unauthorized", 401)
		return
	}
	userID := ctxVal.(string)

	var u UserResponse
	var currentOrgID *string

	// We use COALESCE to handle NULLs safely
	query := `
        SELECT id, email, full_name, COALESCE(avatar_url, ''), 
               COALESCE(job_title, ''), COALESCE(bio, ''), 
               COALESCE(theme, 'system'), current_org_id
        FROM users WHERE id = $1
    `
	err := database.DB.QueryRow(r.Context(), query, userID).
		Scan(&u.ID, &u.Email, &u.FullName, &u.Avatar, &u.JobTitle, &u.Bio, &u.Theme, &currentOrgID)

	if err != nil {
		fmt.Println("❌ HandleMe: DB Query Failed ->", err)
		http.Error(w, "User not found", 401)
		return
	}
	u.CurrentOrgID = currentOrgID

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	c, _ := r.Cookie("session_token")
	if c != nil {
		database.DB.Exec(r.Context(), "DELETE FROM sessions WHERE token=$1", c.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: "session_token", Value: "", Expires: time.Unix(0, 0), Path: "/"})
	w.Write([]byte(`{"message": "Logged out"}`))
}

func HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	// FIX: Use "user_id" here too
	userID := r.Context().Value("user_id").(string)

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", 400)
		return
	}

	_, err := database.DB.Exec(r.Context(),
		"UPDATE users SET full_name=$1, job_title=$2, bio=$3, theme=$4, updated_at=NOW() WHERE id=$5",
		req.FullName, req.JobTitle, req.Bio, req.Theme, userID)

	if err != nil {
		http.Error(w, "Update failed", 500)
		return
	}
	w.WriteHeader(http.StatusOK)
}
