package auth

import (
	"context"
	"fmt"
	"log"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func Init() {
	query := `
	-- 1. USERS (Existing)
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		full_name TEXT NOT NULL,
		avatar_url TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	-- 2. SESSIONS (Existing)
	CREATE TABLE IF NOT EXISTS sessions (
		token TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		expires_at TIMESTAMPTZ NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);

	-- 3. MIGRATION: Add Profile & Settings Columns (Safe to run multiple times)
	ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
	ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT 'Member';
	ALTER TABLE users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system'; -- 'dark', 'light', 'system'
	
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	`

	if _, err := database.DB.Exec(context.Background(), query); err != nil {
		log.Fatalf("❌ Auth Schema Error: %v", err)
	}
	fmt.Println("✅ Auth System: Profile & Settings Ready")
}
