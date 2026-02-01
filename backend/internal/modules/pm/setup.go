package pm

import (
	"context"
	"log"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func SetupRoutes() {
	ctx := context.Background()

	// ==========================================
	// 1. THE FORTRESS (Hierarchy & Auth)
	// ==========================================

	// ORGANIZATIONS: The billing and security boundary
	_, err := database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS organizations (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			slug TEXT UNIQUE NOT NULL, -- URL friendly (e.g., /acme-corp)
			domain TEXT,               -- Auto-join domain (e.g., @acme.com)
			plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
			settings JSONB DEFAULT '{}',     -- Org-wide settings (colors, security)
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed orgs:", err)
	}

	// USERS: The people power
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			full_name TEXT NOT NULL,
			avatar_url TEXT,
			job_title TEXT DEFAULT 'Member',
			
			-- The "Context" Pointer
			current_org_id UUID REFERENCES organizations(id),
			
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed users:", err)
	}

	// MEMBERS: The Link (Many-to-Many)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS organization_members (
			org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			role VARCHAR(20) DEFAULT 'member', -- owner, admin, member, guest
			joined_at TIMESTAMP DEFAULT NOW(),
			PRIMARY KEY (org_id, user_id)
		);
	`)
	if err != nil {
		log.Fatal("Failed members:", err)
	}

	// TEAMS: Functional Groups (Engineering, Sales)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS teams (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT,
			icon VARCHAR(10) DEFAULT '👥',
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed teams:", err)
	}

	// ==========================================
	// 2. THE WAR ROOM (Projects & Infrastructure)
	// ==========================================

	// PROJECTS: The Omni-Engine Containers
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS projects (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
			team_id UUID REFERENCES teams(id),
			created_by UUID REFERENCES users(id),
			
			-- Identity
			name TEXT NOT NULL,
			description TEXT,
			project_key VARCHAR(10), -- e.g., "MAG" for task IDs like MAG-12
			icon VARCHAR(10) DEFAULT '🚀',
			
			-- Health & Status
			status VARCHAR(20) DEFAULT 'active', -- active, on_hold, completed, archived
			health VARCHAR(20) DEFAULT 'on_track', -- on_track, at_risk, off_track
			
			-- Dates
			start_date TIMESTAMP,
			due_date TIMESTAMP,

			-- The Engine Room
			active_engines TEXT[] DEFAULT '{classic}', 
			engine_settings JSONB DEFAULT '{}', -- Store configs for Agile sprints, Venture thresholds

			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed projects:", err)
	}

	// BOARD COLUMNS: For Classic Kanban
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS boards_columns (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			position NUMERIC NOT NULL DEFAULT 65535,
			is_system BOOLEAN DEFAULT FALSE -- If true, cannot be deleted (e.g. Backlog)
		);
	`)
	if err != nil {
		log.Fatal("Failed columns:", err)
	}

	// SPRINTS: For Agile Engine
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS sprints (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			name TEXT NOT NULL, -- "Sprint 23"
			goal TEXT,
			start_date TIMESTAMP,
			end_date TIMESTAMP,
			status VARCHAR(20) DEFAULT 'planned', -- planned, active, completed
			velocity_forecast INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed sprints:", err)
	}

	// ==========================================
	// 3. THE POLYMORPHIC ATOM (Tasks)
	// ==========================================

	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			
			-- Core Data
			title TEXT NOT NULL,
			description TEXT DEFAULT '',
			engine_type VARCHAR(50) NOT NULL, -- classic, agile, venture, stream, loop, competition
			
			-- Universal Metadata
			created_by UUID REFERENCES users(id),
			tags TEXT[] DEFAULT '{}',
			
			-- THE BLACK BOX: High Performance JSONB Logging
			-- Stores every movement, edit, and comment in a highly queryable JSON array
			activity_log JSONB DEFAULT '[]'::jsonb,

			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed tasks:", err)
	}

	// ==========================================
	// 4. THE SIX ENGINES (Best Versions)
	// ==========================================

	// 1. CLASSIC (Kanban/Waterfall)
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_classic (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			column_id UUID REFERENCES boards_columns(id) ON DELETE SET NULL,
			position NUMERIC NOT NULL DEFAULT 65535,
			priority VARCHAR(10) DEFAULT 'p4', -- p1 (critical) -> p4 (low)
			due_date TIMESTAMP,
			start_date TIMESTAMP,
			is_complete BOOLEAN DEFAULT FALSE,
			assignee_id UUID REFERENCES users(id),
			estimated_hours FLOAT8 DEFAULT 0,
			logged_hours FLOAT8 DEFAULT 0
		);
	`)
	if err != nil {
		log.Fatal("Engine Classic:", err)
	}

	// 2. AGILE (Scrum/Software) - "The Developer's Choice"
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_agile (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
			epic_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- Link Story to Epic
			
			type VARCHAR(20) DEFAULT 'story', -- story, bug, epic, task
			status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, review, done
			story_points INT DEFAULT 0,
			acceptance_criteria TEXT, -- Markdown checklist
			
			-- Automation
			git_branch VARCHAR(255),
			pr_link VARCHAR(255)
		);
	`)
	if err != nil {
		log.Fatal("Engine Agile:", err)
	}

	// 3. VENTURE (Innovation/Product) - "The Founder's Choice"
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_venture (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			
			stage VARCHAR(50) DEFAULT 'discovery', -- discovery, validation, efficiency, scale
			confidence_score INT DEFAULT 0,        -- 0-100%
			risk_level VARCHAR(20) DEFAULT 'high', -- high, medium, low
			
			-- VC Metrics
			market_size_estimate VARCHAR(50),      -- e.g. "$10B SAM"
			customer_pain_level INT DEFAULT 5,     -- 1-10
			validation_evidence TEXT               -- Links to interviews/data
		);
	`)
	if err != nil {
		log.Fatal("Engine Venture:", err)
	}

	// 4. STREAM (DevOps/Support) - "The Operator's Choice"
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_stream (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			
			lifecycle_stage VARCHAR(50) DEFAULT 'intake',
			priority_score FLOAT8 DEFAULT 0.0,
			
			-- Flow Metrics
			is_stalled BOOLEAN DEFAULT FALSE,
			stall_reason VARCHAR(100),
			time_in_stage INTERVAL DEFAULT '0 minutes',
			
			-- External World
			requester_email VARCHAR(255),
			ticket_ref VARCHAR(50),    -- e.g. "ZENDESK-101"
			sla_due_at TIMESTAMP       -- When MUST this be done?
		);
	`)
	if err != nil {
		log.Fatal("Engine Stream:", err)
	}

	// 5. LOOP (Recurring/Cron) - "The Manager's Choice"
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_loop (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			
			-- Scheduling
			frequency_type VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly, custom
			cron_expression VARCHAR(50),                 -- "* * * * *" for power users
			
			-- Execution Tracking
			last_run_at TIMESTAMP,
			next_run_at TIMESTAMP,
			run_count INT DEFAULT 0,
			is_paused BOOLEAN DEFAULT FALSE
		);
	`)
	if err != nil {
		log.Fatal("Engine Loop:", err)
	}

	// 6. COMPETITION (Gamification) - "The Sales/Hacker Choice"
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tasks_competition (
			super_task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
			
			-- The Prize
			bounty_points INT DEFAULT 100,
			difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard, insane
			
			-- The Arena
			status VARCHAR(20) DEFAULT 'open', -- open, claimed, under_review, awarded
			claimed_by UUID REFERENCES users(id),
			claimed_at TIMESTAMP,
			
			-- The Victory
			submission_url TEXT,
			verifier_id UUID REFERENCES users(id), -- Who approves the bounty?
			awarded_at TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Engine Competition:", err)
	}

	// ==========================================
	// 5. EXTRAS
	// ==========================================

	// SUBTASKS: Simple checklist items for any engine
	_, err = database.DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS subtasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			is_complete BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed subtasks:", err)
	}

	// COMMENTS: Communication layer
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
		log.Fatal("Failed comments:", err)
	}
}
