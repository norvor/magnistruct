package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// UPDATE THIS TO MATCH YOUR DB CREDENTIALS
// Format: postgres://user:password@host:port/dbname
const DefaultConnStr = "postgres://admin:password@localhost:5432/magnistruct?sslmode=disable"

func main() {
	// 1. Get Connection String
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = DefaultConnStr
	}

	fmt.Println("🔥 MAGNISTRUCT DB RESET TOOL (Ultimate Fix) 🔥")
	fmt.Printf("Target Database: %s\n", connStr)
	fmt.Println("WARNING: This will destroy ALL data. Press Enter to continue...")
	fmt.Scanln()

	// 2. Connect
	ctx := context.Background()
	db, err := pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("❌ Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// 3. GENERATE REAL HASH
	// This ensures the password "secret" actually works with the backend login
	fmt.Println("🔐 Generating Bcrypt Hash for password 'secret'...")
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("secret"), 12)

	// 4. THE SCHEMA SCRIPT
	schemaSQL := `
    -- 1. DROP EVERYTHING (Including Sessions!)
    DROP TABLE IF EXISTS sessions CASCADE;
    DROP TABLE IF EXISTS subtasks CASCADE;
    DROP TABLE IF EXISTS tasks_classic CASCADE;
    DROP TABLE IF EXISTS tasks_venture CASCADE;
    DROP TABLE IF EXISTS tasks_stream CASCADE;
    DROP TABLE IF EXISTS tasks_structure CASCADE;
    DROP TABLE IF EXISTS tasks_hive CASCADE;
    DROP TABLE IF EXISTS tasks_seed CASCADE;
    DROP TABLE IF EXISTS tasks_shell CASCADE;
    DROP TABLE IF EXISTS tasks_wave CASCADE;
    DROP TABLE IF EXISTS tasks_nest CASCADE;
    DROP TABLE IF EXISTS tasks_cocoon CASCADE;
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS boards_columns CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- 2. EXTENSIONS
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 3. CORE SCHEMA (Updated with Profile Fields)
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        avatar_url TEXT DEFAULT '',
        job_title TEXT DEFAULT 'Member',
        bio TEXT DEFAULT '',
        theme TEXT DEFAULT 'system',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE sessions (
        token TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        active_engines TEXT[] DEFAULT '{classic}'
    );

    CREATE TABLE boards_columns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        position NUMERIC NOT NULL DEFAULT 65535
    );

    -- 4. SUPER TASK (Polymorphic Base)
    CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        engine_type VARCHAR(50) NOT NULL, 
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 5. ENGINE TABLES
    CREATE TABLE tasks_classic (
        super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
        column_id UUID REFERENCES boards_columns(id) ON DELETE SET NULL,
        position NUMERIC NOT NULL DEFAULT 65535,
        priority VARCHAR(10) DEFAULT 'p4',
        due_date TIMESTAMP,
        estimated_hours NUMERIC DEFAULT 0,
        logged_hours NUMERIC DEFAULT 0,
        story_points INTEGER DEFAULT 0,
        is_complete BOOLEAN DEFAULT FALSE,
        assignee_id UUID REFERENCES users(id)
    );

    -- (Other engine tables placeholders if needed)
    CREATE TABLE tasks_venture (
        super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
        stage VARCHAR(50) DEFAULT 'discovery',
        confidence_score INTEGER DEFAULT 50,
        risk_level VARCHAR(20) DEFAULT 'low',
        resource_allocation INTEGER DEFAULT 0
    );

    CREATE TABLE tasks_stream (
        super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
        lifecycle_stage VARCHAR(50) DEFAULT 'backlog',
        is_stalled BOOLEAN DEFAULT FALSE,
        stall_reason TEXT
    );

    CREATE TABLE subtasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_classic_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_complete BOOLEAN DEFAULT FALSE
    );
    `

	// 5. EXECUTE SCHEMA
	fmt.Println("🚀 Resetting Schema...")
	if _, err := db.Exec(ctx, schemaSQL); err != nil {
		log.Fatalf("❌ Schema Error: %v", err)
	}

	// 6. SEED DATA (Using the generated hash)
	fmt.Println("🌱 Seeding Data...")

	// Insert User
	_, err = db.Exec(ctx, `
        INSERT INTO users (id, email, password_hash, full_name, job_title, bio)
        VALUES (
            '00000000-0000-0000-0000-000000000001', 
            'demo@magnistruct.com', 
            $1, 
            'Demo User',
            'Chief Tester',
            'I am a seed user generated by the reset tool.'
        )
    `, string(hashedPassword))
	if err != nil {
		log.Fatalf("❌ Seeding User Failed: %v", err)
	}

	// Insert Project
	_, err = db.Exec(ctx, `
        INSERT INTO projects (id, name, description, created_by, active_engines)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Aurora Protocol', 'Next-gen interface', '00000000-0000-0000-0000-000000000001', '{classic,venture}')
    `)
	if err != nil {
		log.Fatalf("❌ Seeding Project Failed: %v", err)
	}

	// Insert Columns
	_, err = db.Exec(ctx, `
        INSERT INTO boards_columns (id, project_id, name, position) VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Backlog', 1000),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'In Progress', 2000),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Done', 3000)
    `)
	if err != nil {
		log.Fatalf("❌ Seeding Columns Failed: %v", err)
	}

	fmt.Println("✅ SUCCESS! DB Reset Complete.")
	fmt.Println("   -> Login: demo@magnistruct.com")
	fmt.Println("   -> Pass:  secret")
}
