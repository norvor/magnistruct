package pm

import (
	"encoding/json"
	"time"
)

// ==========================================
// 1. CORE HIERARCHY
// ==========================================

type Organization struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Slug      string          `json:"slug"`
	Domain    string          `json:"domain"`
	Plan      string          `json:"plan"`
	Settings  json.RawMessage `json:"settings"`
	CreatedAt time.Time       `json:"created_at"`
}

type Team struct {
	ID          string    `json:"id"`
	OrgID       string    `json:"org_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserSummary struct {
	ID           string `json:"id"`
	FullName     string `json:"full_name"`
	AvatarURL    string `json:"avatar_url,omitempty"`
	JobTitle     string `json:"job_title,omitempty"`
	CurrentOrgID string `json:"current_org_id,omitempty"`
}

// ==========================================
// 2. PROJECT & CONFIGS
// ==========================================

type Project struct {
	ID          string  `json:"id"`
	OrgID       string  `json:"org_id"`
	TeamID      *string `json:"team_id,omitempty"`
	Name        string  `json:"name"`
	Description string  `json:"description"`

	// Identity & Health
	ProjectKey string `json:"project_key"`
	Icon       string `json:"icon"`
	Status     string `json:"status"` // active, on_hold, completed
	Health     string `json:"health"` // on_track, at_risk

	StartDate *time.Time `json:"start_date"`
	DueDate   *time.Time `json:"due_date"`

	// The Engine Room
	ActiveEngines  []string        `json:"active_engines"`
	EngineSettings json.RawMessage `json:"engine_settings"` // { "agile": { "sprint_len": 2 } }

	CreatedAt time.Time `json:"created_at"`
}

type BoardColumn struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Position float64 `json:"position"`
	IsSystem bool    `json:"is_system"`
}

type Sprint struct {
	ID        string     `json:"id"`
	ProjectID string     `json:"project_id"`
	Name      string     `json:"name"`
	Goal      string     `json:"goal"`
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
	Status    string     `json:"status"` // planned, active, completed
	Velocity  int        `json:"velocity_forecast"`
}

// ==========================================
// 3. THE ACTIVITY LOG (JSONB)
// ==========================================

type LogEntry struct {
	ID        string       `json:"id"` // Client-generated UUID or timestamp-based
	UserID    string       `json:"user_id"`
	User      *UserSummary `json:"user,omitempty"` // Hydrated on read
	Action    string       `json:"action"`         // create, update, move, comment
	Details   string       `json:"details"`        // "Moved to Done"
	Timestamp time.Time    `json:"timestamp"`
}

// ==========================================
// 4. ENGINE DATA STRUCTURES
// ==========================================

// 1. CLASSIC
type ClassicData struct {
	ColumnID   string       `json:"column_id"`
	Position   float64      `json:"position"`
	Priority   string       `json:"priority"`
	DueDate    *time.Time   `json:"due_date"`
	StartDate  *time.Time   `json:"start_date"`
	IsComplete bool         `json:"is_complete"`
	AssigneeID *string      `json:"assignee_id"`
	Assignee   *UserSummary `json:"assignee,omitempty"`
	EstHours   float64      `json:"estimated_hours"`
	LogHours   float64      `json:"logged_hours"`
}

// 2. AGILE
type AgileData struct {
	SprintID  *string `json:"sprint_id"`
	EpicID    *string `json:"epic_id"`
	Type      string  `json:"type"`   // story, bug, epic
	Status    string  `json:"status"` // todo, in_progress, done
	Points    int     `json:"story_points"`
	Criteria  string  `json:"acceptance_criteria"`
	GitBranch string  `json:"git_branch"`
	PRLink    string  `json:"pr_link"`
}

// 3. VENTURE
type VentureData struct {
	Stage           string `json:"stage"` // discovery, validation
	ConfidenceScore int    `json:"confidence_score"`
	RiskLevel       string `json:"risk_level"`
	MarketSize      string `json:"market_size_estimate"`
	CustomerPain    int    `json:"customer_pain_level"`
	Evidence        string `json:"validation_evidence"`
}

// 4. STREAM
type StreamData struct {
	LifecycleStage string     `json:"lifecycle_stage"`
	PriorityScore  float64    `json:"priority_score"`
	IsStalled      bool       `json:"is_stalled"`
	StallReason    string     `json:"stall_reason"`
	TicketRef      string     `json:"ticket_ref"`
	RequesterEmail string     `json:"requester_email"`
	SLADueAt       *time.Time `json:"sla_due_at"`
}

// 5. LOOP
type LoopData struct {
	FrequencyType  string     `json:"frequency_type"`
	CronExpression string     `json:"cron_expression"`
	LastRunAt      *time.Time `json:"last_run_at"`
	NextRunAt      *time.Time `json:"next_run_at"`
	RunCount       int        `json:"run_count"`
	IsPaused       bool       `json:"is_paused"`
}

// 6. COMPETITION
type CompetitionData struct {
	BountyPoints  int        `json:"bounty_points"`
	Difficulty    string     `json:"difficulty"`
	Status        string     `json:"status"` // open, claimed, awarded
	ClaimedBy     *string    `json:"claimed_by"`
	ClaimedAt     *time.Time `json:"claimed_at"`
	SubmissionURL string     `json:"submission_url"`
	VerifierID    *string    `json:"verifier_id"`
	AwardedAt     *time.Time `json:"awarded_at"`
}

// ==========================================
// 5. THE POLYMORPHIC TASK
// ==========================================

type Subtask struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	IsComplete bool   `json:"is_complete"`
}

type Comment struct {
	ID        string       `json:"id"`
	Content   string       `json:"content"`
	UserID    string       `json:"user_id"`
	User      *UserSummary `json:"user,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
}

type Task struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"project_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	EngineType  string    `json:"engine_type"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// JSONB Log
	ActivityLog []LogEntry `json:"activity_log"`

	// Engines
	Classic     *ClassicData     `json:"classic,omitempty"`
	Agile       *AgileData       `json:"agile,omitempty"`
	Venture     *VentureData     `json:"venture,omitempty"`
	Stream      *StreamData      `json:"stream,omitempty"`
	Loop        *LoopData        `json:"loop,omitempty"`
	Competition *CompetitionData `json:"competition,omitempty"`

	// Extras
	Subtasks []Subtask `json:"subtasks,omitempty"`
}
