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
	"github.com/norvor/magnistruct/backend/internal/dto"
	"golang.org/x/crypto/bcrypt"
)

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

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"message": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	cleanEmail := sanitizeEmail(req.Email)
	if cleanEmail == "" || req.Password == "" || req.FullName == "" {
		http.Error(w, `{"message": "Missing required fields"}`, http.StatusBadRequest)
		return
	}

	// Hash Password & Create User
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	var userID string
	err := database.DB.QueryRow(r.Context(), `
		INSERT INTO sys_users (email, password_hash, full_name) 
		VALUES ($1, $2, $3) RETURNING id
	`, cleanEmail, string(hash), req.FullName).Scan(&userID)
	
	if err != nil {
		fmt.Println("❌ Error creating user:", err)
		http.Error(w, fmt.Sprintf(`{"message": "Registration failed: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Auto-Login
	token := generateToken()
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err = database.DB.Exec(r.Context(), 
		"INSERT INTO sys_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", 
		token, userID, expiresAt)
	if err != nil {
		fmt.Println("Error creating session after register:", err)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})

	resp := dto.AuthResponse{
		User: dto.UserResponse{
			ID:             userID,
			Email:          cleanEmail,
			FullName:       req.FullName,
			EnabledModules: []string{"pm", "habits", "journal", "achievements"}, // Personal modules
		},
		Token: token,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"message": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	cleanEmail := sanitizeEmail(req.Email)
	var userID, hash, fullName string
	
	err := database.DB.QueryRow(r.Context(), 
		"SELECT id, password_hash, full_name FROM sys_users WHERE email=$1", 
		cleanEmail).Scan(&userID, &hash, &fullName)

	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		http.Error(w, `{"message": "Invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	token := generateToken()
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	database.DB.Exec(r.Context(), 
		"INSERT INTO sys_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", 
		token, userID, expiresAt)

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})

	resp := dto.AuthResponse{
		User: dto.UserResponse{
			ID:             userID,
			Email:          cleanEmail,
			FullName:       fullName,
			EnabledModules: []string{"pm", "habits", "journal", "achievements"},
		},
		Token: token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	ctxVal := r.Context().Value("user_id")
	if ctxVal == nil {
		http.Error(w, `{"message": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}
	userID := ctxVal.(string)

	var fullName, email string

	query := `SELECT email, full_name FROM sys_users WHERE id = $1`
	err := database.DB.QueryRow(r.Context(), query, userID).
		Scan(&email, &fullName)

	if err != nil {
		http.Error(w, `{"message": "User not found"}`, http.StatusNotFound)
		return
	}

	resp := dto.UserResponse{
		ID:             userID,
		Email:          email,
		FullName:       fullName,
		EnabledModules: []string{"pm", "habits", "journal", "achievements"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"user": resp})
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	c, _ := r.Cookie("session_token")
	if c != nil {
		database.DB.Exec(r.Context(), "DELETE FROM sys_sessions WHERE token=$1", c.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:    "session_token",
		Value:   "",
		Expires: time.Unix(0, 0),
		Path:    "/",
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message": "Logged out"}`))
}
