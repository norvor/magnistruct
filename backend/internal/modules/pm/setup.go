package pm

import (
	"context"
	"log"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func SetupRoutes() {
	ctx := context.Background()

	// 1. USERS
	_, err := database.DB.Exec(ctx, `
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
	`)
	if err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	// 2. PROJECTS
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS projects (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			description TEXT,
			created_by UUID REFERENCES users(id),
			active_engines TEXT[] DEFAULT '{classic}',
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed to create projects table:", err)
	}

	// 3. BOARDS COLUMNS (Renamed from 'columns' to match your code)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS boards_columns (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			position NUMERIC NOT NULL DEFAULT 65535,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed to create boards_columns table:", err)
	}

	// 4. TASKS (Renamed from 'super_tasks' to match your code)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			description TEXT DEFAULT '',
			engine_type VARCHAR(50) NOT NULL,
			created_by UUID REFERENCES users(id),
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed to create tasks table:", err)
	}

	// --- ENGINES ---

	// CLASSIC (Kanban)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_classic (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			column_id UUID REFERENCES boards_columns(id) ON DELETE SET NULL,
			position NUMERIC NOT NULL DEFAULT 65535,
			priority VARCHAR(10) DEFAULT 'p4',
			due_date TIMESTAMP,
			is_complete BOOLEAN DEFAULT FALSE,
			assignee_id UUID REFERENCES users(id),
			start_date TIMESTAMP,
			estimated_hours FLOAT8 DEFAULT 0,
			logged_hours FLOAT8 DEFAULT 0,
			story_points INT DEFAULT 0,
			tags TEXT DEFAULT ''
		);
	`)
	if err != nil {
		log.Fatal("Failed tasks_classic:", err)
	}

	// SUBTASKS
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS subtasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			parent_classic_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			is_complete BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed subtasks:", err)
	}

	// VENTURE
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_venture (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			stage VARCHAR(50) DEFAULT 'discovery',
			confidence_score INT DEFAULT 0,
			resource_allocation INT DEFAULT 0,
			risk_level VARCHAR(20) DEFAULT 'high',
			next_milestone_date TIMESTAMP,
			validation_evidence TEXT
		);
	`)
	if err != nil {
		log.Fatal("Failed tasks_venture:", err)
	}

	// STREAM
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_stream (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			lifecycle_stage VARCHAR(50) DEFAULT 'intake',
			is_stalled BOOLEAN DEFAULT FALSE,
			stall_reason VARCHAR(100),
			entry_time TIMESTAMP DEFAULT NOW(),
			sla_due_at TIMESTAMP,
			priority_score FLOAT8 DEFAULT 0.0
		);
	`)
	if err != nil {
		log.Fatal("Failed tasks_stream:", err)
	}

	// COMMENTS
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS comments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, 
			user_id UUID REFERENCES users(id),
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed to create comments table:", err)
	}
}
