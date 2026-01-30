package auth

import (
	"context"
	"fmt"
	"log"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

func Init() {
	query := `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        avatar_url TEXT,
        job_title TEXT DEFAULT 'Member',
        bio TEXT DEFAULT '',
        theme TEXT DEFAULT 'system',
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

	if _, err := database.DB.Exec(context.Background(), query); err != nil {
		log.Fatalf("❌ Auth Schema Error: %v", err)
	}
	fmt.Println("✅ Auth System: Ready")
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
		r.Put("/settings", HandleUpdateSettings)
	})
}
