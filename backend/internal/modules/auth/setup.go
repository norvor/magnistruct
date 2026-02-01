package auth

import (
	"context"
	"fmt"
	"log"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

func Init() {
	fmt.Println("🛠️  Auth System: Checking Schema Integrity...")

	// 1. Create Tables if they don't exist
	schema := `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `

	if _, err := database.DB.Exec(context.Background(), schema); err != nil {
		log.Fatalf("❌ Schema Init Error: %v", err)
	}

	// 2. FORCE ADD NEW COLUMNS (Self-Healing)
	// This ensures old tables get the new "God Mode" fields
	migrations := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT 'Member';",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS current_org_id UUID;", // Nullable initially
	}

	for _, query := range migrations {
		if _, err := database.DB.Exec(context.Background(), query); err != nil {
			log.Printf("⚠️ Migration Warning: %v", err)
		}
	}

	fmt.Println("✅ Auth System: Schema & Columns Verified")
}

func SetupRoutes(r chi.Router) {
	// Public
	r.Post("/register", HandleRegister)
	r.Post("/login", HandleLogin)
	r.Post("/logout", HandleLogout)

	// Protected
	r.Group(func(r chi.Router) {
		r.Use(Middleware)
		r.Get("/me", HandleMe)
		r.Put("/profile", HandleUpdateProfile)
	})
}
