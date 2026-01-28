package pm

import (
	"context"
	"fmt"
	"log"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func Init() {
	query := `
	-- 1. PROJECTS (The Container)
	CREATE TABLE IF NOT EXISTS projects (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT NOT NULL,
		description TEXT,
		icon TEXT DEFAULT '📁', 
		color TEXT DEFAULT '#3b82f6',
		view_preference TEXT DEFAULT 'board', -- 'board', 'list', 'calendar'
		is_archived BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	-- 2. COLUMNS (Kanban Sections: "To Do", "In Progress", "Done")
	CREATE TABLE IF NOT EXISTS columns (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		position DOUBLE PRECISION NOT NULL DEFAULT 65535, -- Lexorank-style spacing
		created_at TIMESTAMPTZ DEFAULT NOW()
	);

	-- 3. TASKS (The Unit of Work)
	CREATE TABLE IF NOT EXISTS tasks (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
		
		title TEXT NOT NULL,
		description TEXT,
		priority TEXT DEFAULT 'p4', -- p1 (High) to p4 (None)
		due_date TIMESTAMPTZ,
		
		position DOUBLE PRECISION NOT NULL DEFAULT 65535,
		is_complete BOOLEAN DEFAULT FALSE,
		
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	-- 4. PERFORMANCE INDEXES (Crucial for Speed)
	CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
	CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
	CREATE INDEX IF NOT EXISTS idx_columns_project ON columns(project_id);
	`

	if _, err := database.DB.Exec(context.Background(), query); err != nil {
		log.Fatalf("❌ PM Schema Error: %v", err)
	}
	fmt.Println("✅ PM System: Production Schema Loaded")
}
