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
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

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
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Avatar   string `json:"avatar"`
	JobTitle string `json:"job_title"`
	Bio      string `json:"bio"`
	Theme    string `json:"theme"`
}

// --- HELPERS ---
func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// sanitizeEmail cleans input to prevent mismatches
func sanitizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// --- HANDLERS ---

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	fmt.Println("--- 📝 STARTING REGISTRATION ---")

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("❌ JSON Decode Error:", err)
		http.Error(w, "Invalid Input", http.StatusBadRequest)
		return
	}

	// DEBUG: Print exactly what the frontend sent
	fmt.Printf("   Email: '%s'\n", req.Email)
	fmt.Printf("   Name:  '%s'\n", req.FullName)
	fmt.Printf("   Pass:  [HIDDEN] (Len: %d)\n", len(req.Password))

	// 1. Sanitize
	cleanEmail := sanitizeEmail(req.Email)
	if cleanEmail == "" {
		fmt.Println("❌ Error: Email is empty after sanitization")
		http.Error(w, "Email required", 400)
		return
	}

	if req.FullName == "" {
		fmt.Println("❌ Error: Full Name is empty (JSON mismatch?)")
		http.Error(w, "Full Name required", 400)
		return
	}

	// 2. Hash
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)

	// 3. Insert
	fmt.Println("   -> Attempting DB Insert...")
	var userID string
	err := database.DB.QueryRow(r.Context(),
		"INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id",
		cleanEmail, string(hash), req.FullName).Scan(&userID)

	if err != nil {
		fmt.Println("❌ DB INSERT FAILED:", err)
		// Check for specific Postgres errors
		if strings.Contains(err.Error(), "duplicate key") {
			http.Error(w, "Email already exists", 409)
		} else {
			http.Error(w, "Database Error", 500)
		}
		return
	}

	fmt.Printf("✅ SUCCESS! User created with ID: %s\n", userID)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Account created"}`))
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("\n--- 🔍 STARTING LOGIN DEBUG ---")

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	// 1. PRINT INPUTS
	cleanEmail := sanitizeEmail(req.Email)
	fmt.Printf("   Incoming Email: '%s'\n", req.Email)
	fmt.Printf("   Cleaned Email:  '%s'\n", cleanEmail)
	fmt.Printf("   Password Len:   %d\n", len(req.Password))

	// 2. CHECK DATABASE
	var id, hash string
	// We select email too just to be sure
	var dbEmail string
	err := database.DB.QueryRow(r.Context(),
		"SELECT id, email, password_hash FROM users WHERE email=$1",
		cleanEmail).Scan(&id, &dbEmail, &hash)

	if err != nil {
		fmt.Println("❌ DB QUERY FAILED:", err)
		fmt.Println("   -> This means the email does not exist in the 'users' table.")
		http.Error(w, "Invalid credentials (User not found)", http.StatusUnauthorized)
		return
	}

	fmt.Printf("   -> Found User ID: %s\n", id)
	fmt.Printf("   -> Stored Hash:   %s... (Len: %d)\n", hash[:10], len(hash))

	// 3. COMPARE PASSWORD
	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password))
	if err != nil {
		fmt.Println("❌ PASSWORD MISMATCH:", err)
		fmt.Println("   -> The password you typed does not match the hash in the DB.")
		http.Error(w, "Invalid credentials (Bad Password)", http.StatusUnauthorized)
		return
	}

	// 4. GENERATE SESSION
	token := generateToken()
	expiresAt := time.Now().Add(7 * 24 * time.Hour)

	_, err = database.DB.Exec(r.Context(),
		"INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
		token, id, expiresAt)
	if err != nil {
		fmt.Println("❌ SESSION INSERT FAILED:", err)
		http.Error(w, "Server Error", 500)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name: "session_token", Value: token, Expires: expiresAt,
		HttpOnly: true, Path: "/", SameSite: http.SameSiteLaxMode,
	})

	fmt.Println("✅ LOGIN SUCCESS!")
	w.Write([]byte(`{"message": "Logged in"}`))
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	fmt.Println("\n--- 🕵️ INVESTIGATIVE HandleMe STARTING ---")

	// 1. INSPECT CONTEXT (Did Middleware do its job?)
	ctxVal := r.Context().Value("userID")
	fmt.Printf("   1. Context Value for 'userID': %v\n", ctxVal)

	if ctxVal == nil {
		fmt.Println("❌ CRITICAL FAIL: Context is empty. The Auth Middleware did NOT run or failed to inject the ID.")
		http.Error(w, "Server Error: Auth Middleware missing", 500)
		return
	}

	// 2. CHECK TYPE ASSERTION
	userID, ok := ctxVal.(string)
	if !ok {
		fmt.Printf("❌ CRITICAL FAIL: Context value is type %T, expected string\n", ctxVal)
		http.Error(w, "Server Error: Invalid UserID type", 500)
		return
	}
	fmt.Printf("   2. User ID extracted: %s\n", userID)

	// 3. INSPECT DATABASE LOOKUP
	fmt.Println("   3. Querying Database for User Profile...")
	var u UserResponse
	query := `
        SELECT id, email, full_name, COALESCE(avatar_url, ''), 
               COALESCE(job_title, ''), COALESCE(bio, ''), COALESCE(theme, 'aurora')
        FROM users
        WHERE id = $1
    `
	err := database.DB.QueryRow(r.Context(), query, userID).
		Scan(&u.ID, &u.Email, &u.FullName, &u.Avatar, &u.JobTitle, &u.Bio, &u.Theme)

	if err != nil {
		fmt.Printf("❌ DB FAIL: %v\n", err)
		if err.Error() == "no rows in result set" {
			fmt.Println("   -> This user ID exists in the session/cookie, but was DELETED from the 'users' table.")
		}
		http.Error(w, "User not found in DB", 401)
		return
	}

	fmt.Printf("✅ SUCCESS: Found user '%s' (%s)\n", u.Email, u.FullName)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	c, _ := r.Cookie("session_token")
	if c != nil {
		database.DB.Exec(r.Context(), "DELETE FROM sessions WHERE token=$1", c.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HttpOnly: true,
		Path:     "/",
	})
	w.Write([]byte(`{"message": "Logged out"}`))
}

func HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Input", http.StatusBadRequest)
		return
	}

	_, err := database.DB.Exec(r.Context(),
		"UPDATE users SET full_name=$1, job_title=$2, bio=$3, theme=$4, updated_at=NOW() WHERE id=$5",
		req.FullName, req.JobTitle, req.Bio, req.Theme, userID)

	if err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func HandleUpdateSettings(w http.ResponseWriter, r *http.Request) {
	HandleUpdateProfile(w, r)
}
