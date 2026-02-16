package dto

import "time"

// ============================================================================
// PM WORK ITEMS (The How - Actions, Tasks, Bugs)
// ============================================================================

type CreateWorkItemRequest struct {
	Title       string  `json:"title" validate:"required"`
	Description string  `json:"description"`
	Status      string  `json:"status"`                                         // todo, in_progress, done
	Type        string  `json:"type"`                                           // action(task), bug, story, epic
	Priority    string  `json:"priority"`                                       // low, medium, high, critical
	ParentID    *string `json:"parent_id" validate:"omitempty,uuid"`
	AssigneeID  *string `json:"assignee_id" validate:"omitempty,uuid"`
	JourneyID   *string `json:"journey_id" validate:"omitempty,uuid"` // (was cycle_id)
	GoalID      *string `json:"goal_id" validate:"omitempty,uuid"`    // (was project_id)
	StoryPoints *int    `json:"story_points"`
	DueDate     *string `json:"due_date"` // ISO date string
}

type UpdateWorkItemRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	Type        *string `json:"type"`
	Priority    *string `json:"priority"`
	ParentID    *string `json:"parent_id" validate:"omitempty,uuid"`
	AssigneeID  *string `json:"assignee_id" validate:"omitempty,uuid"`
	JourneyID   *string `json:"journey_id" validate:"omitempty,uuid"`
	GoalID      *string `json:"goal_id" validate:"omitempty,uuid"`
	StoryPoints *int    `json:"story_points"`
	DueDate     *string `json:"due_date"`
}

type WorkItemResponse struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Description   *string    `json:"description,omitempty"`
	Status        string     `json:"status"`
	Type          string     `json:"type"`
	Priority      string     `json:"priority"`
	ParentID      *string    `json:"parent_id,omitempty"`
	AssigneeID    *string    `json:"assignee_id,omitempty"`
	JourneyID     *string    `json:"journey_id,omitempty"`
	GoalID        *string    `json:"goal_id,omitempty"`
	StoryPoints   *int       `json:"story_points,omitempty"`
	DueDate       *time.Time `json:"due_date,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	// Populated fields via joins
	AssigneeName *string `json:"assignee_name,omitempty"`
	JourneyName  *string `json:"journey_name,omitempty"`
	GoalName     *string `json:"goal_name,omitempty"`
	ParentTitle  *string `json:"parent_title,omitempty"`
	SubtaskCount int     `json:"subtask_count"`
}

// ============================================================================
// PM RESOURCES (Team Members, Contractors)
// ============================================================================

type CreateResourceRequest struct {
	UserID               *string  `json:"user_id" validate:"omitempty,uuid"`
	HourlyRate           *float64 `json:"hourly_rate"`
	Role                 string   `json:"role"`
	Skills               []string `json:"skills"`
	CapacityHoursPerWeek *int     `json:"capacity_hours_per_week"`
}

type UpdateResourceRequest struct {
	UserID               *string  `json:"user_id" validate:"omitempty,uuid"`
	HourlyRate           *float64 `json:"hourly_rate"`
	Role                 *string  `json:"role"`
	Skills               []string `json:"skills"`
	CapacityHoursPerWeek *int     `json:"capacity_hours_per_week"`
}

type ResourceResponse struct {
	ID                   string    `json:"id"`
	UserID               *string   `json:"user_id,omitempty"`
	HourlyRate           *float64  `json:"hourly_rate,omitempty"`
	Role                 string    `json:"role"`
	Skills               []string  `json:"skills"`
	CapacityHoursPerWeek int       `json:"capacity_hours_per_week"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	// Populated fields
	UserEmail    *string `json:"user_email,omitempty"`
	UserFullName *string `json:"user_full_name,omitempty"`
}

// ============================================================================
// PM JOURNEYS (The When - Timelines, Seasons, Sprints)
// ============================================================================

type CreateJourneyRequest struct {
	Name         string   `json:"name" validate:"required"`
	StartDate    string   `json:"start_date"` // ISO date
	EndDate      string   `json:"end_date"`
	Goal         string   `json:"goal"`
	Status       string   `json:"status"` // planned, active, completed, archived
	GoalID       *string  `json:"goal_id" validate:"omitempty,uuid"` // (was project_id) - Primary goal
	Compartments []string `json:"compartments" validate:"dive,uuid"` // Goal IDs for compartments
}

type UpdateJourneyRequest struct {
	Name         *string  `json:"name"`
	StartDate    *string  `json:"start_date"`
	EndDate      *string  `json:"end_date"`
	Goal         *string  `json:"goal"`
	Status       *string  `json:"status"`
	GoalID       *string  `json:"goal_id" validate:"omitempty,uuid"`
	Compartments []string `json:"compartments" validate:"dive,uuid"`
}

type JourneyStats struct {
	TodoCount       int `json:"todo_count"`
	InProgressCount int `json:"in_progress_count"`
	ReviewCount     int `json:"review_count"`
	DoneCount       int `json:"done_count"`
	TotalCount      int `json:"total_count"`
}

type JourneyResponse struct {
	ID            string          `json:"id"`
	Name          string          `json:"name"`
	StartDate     *time.Time      `json:"start_date,omitempty"`
	EndDate       *time.Time      `json:"end_date,omitempty"`
	Goal          *string         `json:"goal,omitempty"`
	Status        string          `json:"status"`
	GoalID        *string         `json:"goal_id,omitempty"`
	EngineSpecID  *string         `json:"engine_spec_id,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	WorkItemCount int             `json:"work_item_count"`
	Stats         *JourneyStats   `json:"stats,omitempty"`
	Compartments  []GoalResponse  `json:"compartments,omitempty"`
	Engine        *SpecResponse   `json:"engine,omitempty"`
	// Populated fields
	GoalName *string `json:"goal_name,omitempty"`
}

// ============================================================================
// PM ENVIRONMENTS (Git Repos, Deployments, Tools)
// ============================================================================

type CreateEnvironmentRequest struct {
	Name     string                 `json:"name" validate:"required"`
	URL      string                 `json:"url"`
	Type     string                 `json:"type"` // git_repo, kubernetes_cluster, figma_file, custom
	Provider string                 `json:"provider"`
	Metadata map[string]interface{} `json:"metadata"`
}

type UpdateEnvironmentRequest struct {
	Name     *string                `json:"name"`
	URL      *string                `json:"url"`
	Type     *string                `json:"type"`
	Provider *string                `json:"provider"`
	Metadata map[string]interface{} `json:"metadata"`
}

type EnvironmentResponse struct {
	ID        string                 `json:"id"`
	Name      string                 `json:"name"`
	URL       *string                `json:"url,omitempty"`
	Type      string                 `json:"type"`
	Provider  *string                `json:"provider,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

// ============================================================================
// PM GOALS (The What - Objectives, Outcomes, Results)
// ============================================================================

type CreateGoalRequest struct {
	Name          string `json:"name" validate:"required"`
	Description   string `json:"description"`
	Status        string `json:"status"` // planning, active, paused, completed, cancelled
	StartDate     string `json:"start_date"`
	TargetEndDate string `json:"target_end_date"`
	LeadID        *string `json:"lead_id" validate:"omitempty,uuid"`
	CoverImage    string  `json:"cover_image"`
	Category      string  `json:"category"`
	PurposeID     *string `json:"purpose_id" validate:"omitempty,uuid"`
	Steps         []string `json:"steps" validate:"omitempty,min=1,max=5"`
}

type GoalStepResponse struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	IsDone    bool      `json:"is_done"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateGoalRequest struct {
	Name          *string `json:"name"`
	Description   *string `json:"description"`
	Status        *string `json:"status"`
	StartDate     *string `json:"start_date"`
	TargetEndDate *string `json:"target_end_date"`
	LeadID        *string `json:"lead_id" validate:"omitempty,uuid"`
	CoverImage    *string `json:"cover_image"`
	Category      *string `json:"category"`
	PurposeID     *string `json:"purpose_id" validate:"omitempty,uuid"`
}

type UpdateGoalStepRequest struct {
	IsDone *bool `json:"is_done"`
}

type GoalStats struct {
	TodoCount       int `json:"todo_count"`
	InProgressCount int `json:"in_progress_count"`
	ReviewCount     int `json:"review_count"`
	DoneCount       int `json:"done_count"`
	TotalCount      int `json:"total_count"`
}

type GoalResponse struct {
	ID            string     `json:"id"`
	Name          string     `json:"name"`
	Description   *string    `json:"description,omitempty"`
	Status        string     `json:"status"`
	StartDate     *time.Time `json:"start_date,omitempty"`
	TargetEndDate *time.Time `json:"target_end_date,omitempty"`
	LeadID        *string    `json:"lead_id,omitempty"`
	CoverImage    string     `json:"cover_image,omitempty"`
	Category      string     `json:"category,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	Stats         *GoalStats `json:"stats,omitempty"`
	// Populated fields
	LeadName *string `json:"lead_name,omitempty"`
	PurposeID *string `json:"purpose_id,omitempty"`
	Steps     []GoalStepResponse `json:"steps,omitempty"` // Legacy / Simple steps
	WorkItems []WorkItemResponse `json:"work_items,omitempty"` // Rich steps
}

// ============================================================================
// [DELETED] OLD PM GOALS (OKRs) - Removed
// ============================================================================

// ============================================================================
// PM SPECS (Documentation, PRDs, Technical Specs)
// ============================================================================

type CreateSpecRequest struct {
	EntityType string `json:"entity_type"` // project, feature, work_item
	EntityID   string `json:"entity_id" validate:"uuid"`
	Title      string `json:"title" validate:"required"`
	Content    string `json:"content" validate:"required"` // Markdown
	Type       string `json:"type"`                        // prd, technical_spec, design_doc, api_doc
	Version    string `json:"version"`
}

type UpdateSpecRequest struct {
	Title   *string `json:"title"`
	Content *string `json:"content"`
	Type    *string `json:"type"`
	Version *string `json:"version"`
}

type SpecResponse struct {
	ID         string    `json:"id"`
	EntityType *string   `json:"entity_type,omitempty"`
	EntityID   *string   `json:"entity_id,omitempty"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	Type       string    `json:"type"`
	Version    string    `json:"version"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
