package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"golang.org/x/crypto/bcrypt"
)

// --- MODELS ---
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// NEW: Struct to handle profile/theme updates
type UpdateSettingsRequest struct {
	Theme    string `json:"theme"`
	JobTitle string `json:"job_title"`
	Bio      string `json:"bio"`
}

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Avatar   string `json:"avatar"`
	JobTitle string `json:"job_title"`
	Bio      string `json:"bio"`
	Theme    string `json:"theme"`
}

// --- HELPERS ---

// generateToken creates a random 32-byte secure string
func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// --- HANDLERS ---

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", http.StatusBadRequest)
		return
	}

	// 1. Hash Password (Cost 12 is standard for 2026)
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)

	// 2. Insert User
	var userID string
	err := database.DB.QueryRow(r.Context(),
		"INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id",
		req.Email, string(hash), req.FullName).Scan(&userID)

	if err != nil {
		http.Error(w, "Email likely already taken", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Account created"}`))
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	json.NewDecoder(r.Body).Decode(&req)

	// 1. Find User
	var id, hash string
	err := database.DB.QueryRow(r.Context(), "SELECT id, password_hash FROM users WHERE email=$1", req.Email).Scan(&id, &hash)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// 2. Check Password
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// 3. Create Session
	token := generateToken()
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 Days

	_, err = database.DB.Exec(r.Context(),
		"INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
		token, id, expiresAt)
	if err != nil {
		http.Error(w, "Session error", http.StatusInternalServerError)
		return
	}

	// 4. Set HTTP-Only Cookie (The Security Gold Standard)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,  // JavaScript cannot read this (XSS protection)
		Secure:   false, // Set to true in Production (requires HTTPS)
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})

	w.Write([]byte(`{"message": "Logged in"}`))
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var u UserResponse
	query := `
		SELECT u.id, u.email, u.full_name, COALESCE(u.avatar_url, ''), 
		       COALESCE(u.job_title, ''), COALESCE(u.bio, ''), COALESCE(u.theme, 'aurora')
		FROM sessions s
		JOIN users u ON u.id = s.user_id
		WHERE s.token = $1 AND s.expires_at > NOW()
	`
	err = database.DB.QueryRow(r.Context(), query, c.Value).
		Scan(&u.ID, &u.Email, &u.FullName, &u.Avatar, &u.JobTitle, &u.Bio, &u.Theme)

	if err != nil {
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	c, _ := r.Cookie("session_token")
	if c != nil {
		// Delete from DB
		database.DB.Exec(r.Context(), "DELETE FROM sessions WHERE token=$1", c.Value)
	}

	// Clear Cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HttpOnly: true,
		Path:     "/",
	})
	w.Write([]byte(`{"message": "Logged out"}`))
}

// NEW FUNCTION: Updates user theme and profile info
func HandleUpdateSettings(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var req UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", http.StatusBadRequest)
		return
	}

	// 1. Get User ID from Session
	var userID string
	err = database.DB.QueryRow(r.Context(), "SELECT user_id FROM sessions WHERE token=$1 AND expires_at > NOW()", c.Value).Scan(&userID)
	if err != nil {
		http.Error(w, "Session invalid", http.StatusUnauthorized)
		return
	}

	// 2. Update User in DB
	// Note: We update job_title/bio here too as they are part of the settings vertical
	_, err = database.DB.Exec(r.Context(),
		"UPDATE users SET theme = $1, job_title = $2, bio = $3 WHERE id = $4",
		req.Theme, req.JobTitle, req.Bio, userID)

	if err != nil {
		http.Error(w, "Failed to update settings", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"message": "Settings updated"}`))
}
