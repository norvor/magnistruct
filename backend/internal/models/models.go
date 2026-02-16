package models

import (
	"encoding/json"
	"time"
)

// =========================================================================================
// I. THE SYSTEM CORE (IDENTITY & TENANTS)
// =========================================================================================

// SysOrganization represents the tenant/company.
type SysOrganization struct {
	ID         string     `json:"id" db:"id"`
	Name       string     `json:"name" db:"name"`
	LicenseKey *string    `json:"license_key,omitempty" db:"license_key"`
	PlanTier   string     `json:"plan_tier" db:"plan_tier"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// SysUser represents the global identity.
type SysUser struct {
	ID           string     `json:"id" db:"id"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	FullName     *string    `json:"full_name,omitempty" db:"full_name"`
	AvatarURL    *string    `json:"avatar_url,omitempty" db:"avatar_url"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

// SysMember links User -> Org.
type SysMember struct {
	ID       string    `json:"id" db:"id"`
	OrgID    string    `json:"org_id" db:"org_id"`
	UserID   string    `json:"user_id" db:"user_id"`
	Role     string    `json:"role" db:"role"`
	JoinedAt time.Time `json:"joined_at" db:"joined_at"`
}

// SysTeam represents functional groups.
type SysTeam struct {
	ID          string     `json:"id" db:"id"`
	OrgID       string     `json:"org_id" db:"org_id"`
	Name        string     `json:"name" db:"name"`
	Description *string    `json:"description,omitempty" db:"description"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// SysTeamMember links User -> Team.
type SysTeamMember struct {
	ID       string    `json:"id" db:"id"`
	TeamID   string    `json:"team_id" db:"team_id"`
	UserID   string    `json:"user_id" db:"user_id"`
	Role     *string    `json:"role,omitempty" db:"role"`
	JoinedAt time.Time `json:"joined_at" db:"joined_at"`
}

// =========================================================================================
// II. THE GOVERNANCE LAYER (MODULARITY)
// =========================================================================================

// SysCustodyChain tracks ownership transfers.
type SysCustodyChain struct {
	ID              string    `json:"id" db:"id"`
	EntityType      string    `json:"entity_type" db:"entity_type"`
	EntityID        string    `json:"entity_id" db:"entity_id"`
	PreviousOwnerID *string   `json:"previous_owner_id,omitempty" db:"previous_owner_id"`
	NewOwnerID      *string   `json:"new_owner_id,omitempty" db:"new_owner_id"`
	TransferredAt   time.Time `json:"transferred_at" db:"transferred_at"`
	Reason          *string   `json:"reason,omitempty" db:"reason"`
}

// SysAccessGrant represents granular permissions.
type SysAccessGrant struct {
	ID              string    `json:"id" db:"id"`
	EntityType      string    `json:"entity_type" db:"entity_type"`
	EntityID        string    `json:"entity_id" db:"entity_id"`
	UserID          string    `json:"user_id" db:"user_id"`
	PermissionLevel string    `json:"permission_level" db:"permission_level"`
	GrantedAt       time.Time `json:"granted_at" db:"granted_at"`
	GrantedBy       *string   `json:"granted_by,omitempty" db:"granted_by"`
}

// SysTenantBridge represents cross-org sharing.
type SysTenantBridge struct {
	ID            string     `json:"id" db:"id"`
	SourceOrgID   string     `json:"source_org_id" db:"source_org_id"`
	TargetOrgID   string     `json:"target_org_id" db:"target_org_id"`
	Status        *string    `json:"status,omitempty" db:"status"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	EstablishedAt *time.Time `json:"established_at,omitempty" db:"established_at"`
}

// =========================================================================================
// III. THE PRODUCT MODULES
// =========================================================================================

// --- MODULE A: PROJECT MANAGEMENT (PM) ---

// PmWorkItem represents Tasks, Bugs, Stories.
type PmWorkItem struct {
	ID          string     `json:"id" db:"id"`
	OrgID       string     `json:"org_id" db:"org_id"`
	Title       string     `json:"title" db:"title"`
	Description *string    `json:"description,omitempty" db:"description"`
	Status      *string    `json:"status,omitempty" db:"status"`
	Type        *string    `json:"type,omitempty" db:"type"`
	Priority    *string    `json:"priority,omitempty" db:"priority"`
	ParentID    *string    `json:"parent_id,omitempty" db:"parent_id"`
	AssigneeID  *string    `json:"assignee_id,omitempty" db:"assignee_id"`
	CycleID     *string    `json:"cycle_id,omitempty" db:"cycle_id"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// PmResource represents billable agents.
type PmResource struct {
	ID                   string          `json:"id" db:"id"`
	UserID               *string         `json:"user_id,omitempty" db:"user_id"`
	OrgID                string          `json:"org_id" db:"org_id"`
	HourlyRate           *float64        `json:"hourly_rate,omitempty" db:"hourly_rate"`
	Role                 *string         `json:"role,omitempty" db:"role"`
	Skills               json.RawMessage `json:"skills,omitempty" db:"skills"` // JSONB
	CapacityHoursPerWeek *int            `json:"capacity_hours_per_week,omitempty" db:"capacity_hours_per_week"`
	CreatedAt            time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at" db:"updated_at"`
}

// PmCycle represents Sprints, Milestones.
type PmCycle struct {
	ID        string     `json:"id" db:"id"`
	OrgID     string     `json:"org_id" db:"org_id"`
	Name      string     `json:"name" db:"name"`
	StartDate *time.Time `json:"start_date,omitempty" db:"start_date"`
	EndDate   *time.Time `json:"end_date,omitempty" db:"end_date"`
	Goal      *string    `json:"goal,omitempty" db:"goal"`
	Status    *string    `json:"status,omitempty" db:"status"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// PmEnvironment represents Repos, Deployments.
type PmEnvironment struct {
	ID        string          `json:"id" db:"id"`
	OrgID     string          `json:"org_id" db:"org_id"`
	Name      string          `json:"name" db:"name"`
	URL       *string         `json:"url,omitempty" db:"url"`
	Type      *string         `json:"type,omitempty" db:"type"`
	Provider  *string         `json:"provider,omitempty" db:"provider"`
	Metadata  json.RawMessage `json:"metadata,omitempty" db:"metadata"` // JSONB
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt time.Time       `json:"updated_at" db:"updated_at"`
}

// PmGoal represents OKRs, Strategic Drivers.
type PmGoal struct {
	ID                 string     `json:"id" db:"id"`
	OrgID              string     `json:"org_id" db:"org_id"`
	Title              string     `json:"title" db:"title"`
	Description        *string    `json:"description,omitempty" db:"description"`
	Status             *string    `json:"status,omitempty" db:"status"`
	ProgressPercentage *int       `json:"progress_percentage,omitempty" db:"progress_percentage"`
	DueDate            *time.Time `json:"due_date,omitempty" db:"due_date"`
	OwnerID            *string    `json:"owner_id,omitempty" db:"owner_id"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`
}

// PmSpec represents Documentation.
type PmSpec struct {
	ID         string     `json:"id" db:"id"`
	OrgID      string     `json:"org_id" db:"org_id"`
	EntityType *string    `json:"entity_type,omitempty" db:"entity_type"`
	EntityID   *string    `json:"entity_id,omitempty" db:"entity_id"`
	Title      string     `json:"title" db:"title"`
	Content    *string    `json:"content,omitempty" db:"content"`
	Version    *string    `json:"version,omitempty" db:"version"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// --- MODULE B: HUMAN RESOURCES (HR) ---

// HrActivity represents To-dos.
type HrActivity struct {
	ID         string     `json:"id" db:"id"`
	OrgID      string     `json:"org_id" db:"org_id"`
	Title      string     `json:"title" db:"title"`
	AssigneeID *string    `json:"assignee_id,omitempty" db:"assignee_id"`
	Status     *string    `json:"status,omitempty" db:"status"`
	DueDate    *time.Time `json:"due_date,omitempty" db:"due_date"`
	Type       *string    `json:"type,omitempty" db:"type"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// HrEmployee represents the legal entity.
type HrEmployee struct {
	ID             string     `json:"id" db:"id"`
	OrgID          string     `json:"org_id" db:"org_id"`
	UserID         *string    `json:"user_id,omitempty" db:"user_id"`
	FirstName      string     `json:"first_name" db:"first_name"`
	LastName       string     `json:"last_name" db:"last_name"`
	JobTitle       *string    `json:"job_title,omitempty" db:"job_title"`
	EmploymentType *string    `json:"employment_type,omitempty" db:"employment_type"`
	Salary         *float64   `json:"salary,omitempty" db:"salary"`
	StartDate      *time.Time `json:"start_date,omitempty" db:"start_date"`
	ReportsToID    *string    `json:"reports_to_id,omitempty" db:"reports_to_id"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
}

// HrPeriod represents Pay Periods.
type HrPeriod struct {
	ID        string     `json:"id" db:"id"`
	OrgID     string     `json:"org_id" db:"org_id"`
	Name      string     `json:"name" db:"name"`
	StartDate *time.Time `json:"start_date,omitempty" db:"start_date"`
	EndDate   *time.Time `json:"end_date,omitempty" db:"end_date"`
	Status    *string    `json:"status,omitempty" db:"status"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

// HrLocation represents Offices.
type HrLocation struct {
	ID        string    `json:"id" db:"id"`
	OrgID     string    `json:"org_id" db:"org_id"`
	Name      string    `json:"name" db:"name"`
	Address   *string   `json:"address,omitempty" db:"address"`
	Capacity  *int      `json:"capacity,omitempty" db:"capacity"`
	Type      *string   `json:"type,omitempty" db:"type"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// HrDriver represents Strategy.
type HrDriver struct {
	ID        string     `json:"id" db:"id"`
	OrgID     string     `json:"org_id" db:"org_id"`
	Title     string     `json:"title" db:"title"`
	Category  *string    `json:"category,omitempty" db:"category"`
	Status    *string    `json:"status,omitempty" db:"status"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// HrPolicy represents Rules.
type HrPolicy struct {
	ID          string     `json:"id" db:"id"`
	OrgID       string     `json:"org_id" db:"org_id"`
	Title       string     `json:"title" db:"title"`
	Content     *string    `json:"content,omitempty" db:"content"`
	Version     *string    `json:"version,omitempty" db:"version"`
	IsMandatory *bool      `json:"is_mandatory,omitempty" db:"is_mandatory"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// --- MODULE C: CUSTOMER RELATIONSHIPS (CRM) ---

// CrmOpportunity represents Deals.
type CrmOpportunity struct {
	ID                string     `json:"id" db:"id"`
	OrgID             string     `json:"org_id" db:"org_id"`
	Title             string     `json:"title" db:"title"`
	Value             *float64   `json:"value,omitempty" db:"value"`
	Currency          *string    `json:"currency,omitempty" db:"currency"`
	Stage             *string    `json:"stage,omitempty" db:"stage"`
	Probability       *int       `json:"probability,omitempty" db:"probability"`
	ExpectedCloseDate *time.Time `json:"expected_close_date,omitempty" db:"expected_close_date"`
	OwnerID           *string    `json:"owner_id,omitempty" db:"owner_id"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

// CrmContact represents External People.
type CrmContact struct {
	ID          string     `json:"id" db:"id"`
	OrgID       string     `json:"org_id" db:"org_id"`
	FirstName   *string    `json:"first_name,omitempty" db:"first_name"`
	LastName    *string    `json:"last_name,omitempty" db:"last_name"`
	Email       *string    `json:"email,omitempty" db:"email"`
	Phone       *string    `json:"phone,omitempty" db:"phone"`
	CompanyName *string    `json:"company_name,omitempty" db:"company_name"`
	Role        *string    `json:"role,omitempty" db:"role"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// CrmTimeline represents Sales Cycles.
type CrmTimeline struct {
	ID            string     `json:"id" db:"id"`
	OrgID         string     `json:"org_id" db:"org_id"`
	Name          string     `json:"name" db:"name"`
	StartDate     *time.Time `json:"start_date,omitempty" db:"start_date"`
	EndDate       *time.Time `json:"end_date,omitempty" db:"end_date"`
	TargetRevenue *float64   `json:"target_revenue,omitempty" db:"target_revenue"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// CrmChannel represents Sources.
type CrmChannel struct {
	ID        string     `json:"id" db:"id"`
	OrgID     string     `json:"org_id" db:"org_id"`
	Name      string     `json:"name" db:"name"`
	Type      *string    `json:"type,omitempty" db:"type"`
	Spend     *float64   `json:"spend,omitempty" db:"spend"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

// CrmPainPoint represents Customer Needs.
type CrmPainPoint struct {
	ID            string     `json:"id" db:"id"`
	OrgID         string     `json:"org_id" db:"org_id"`
	OpportunityID *string    `json:"opportunity_id,omitempty" db:"opportunity_id"`
	Description   string     `json:"description" db:"description"`
	Severity      *string    `json:"severity,omitempty" db:"severity"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// CrmCollateral represents Documents.
type CrmCollateral struct {
	ID         string     `json:"id" db:"id"`
	OrgID      string     `json:"org_id" db:"org_id"`
	Title      string     `json:"title" db:"title"`
	ContentURL *string    `json:"content_url,omitempty" db:"content_url"`
	Type       *string    `json:"type,omitempty" db:"type"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// =========================================================================================
// IV. THE INTERACTION LAYER (ALIVE & SOCIAL)
// =========================================================================================

// SysComment represents universal chat threads.
type SysComment struct {
	ID         string     `json:"id" db:"id"`
	EntityType string     `json:"entity_type" db:"entity_type"`
	EntityID   string     `json:"entity_id" db:"entity_id"`
	UserID     *string    `json:"user_id,omitempty" db:"user_id"`
	Content    string     `json:"content" db:"content"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// SysReaction represents Emoji reactions.
type SysReaction struct {
	ID         string     `json:"id" db:"id"`
	EntityType string     `json:"entity_type" db:"entity_type"`
	EntityID   string     `json:"entity_id" db:"entity_id"`
	UserID     *string    `json:"user_id,omitempty" db:"user_id"`
	Emoji      string     `json:"emoji" db:"emoji"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}

// =========================================================================================
// V. THE AWARENESS LAYER (THE NERVOUS SYSTEM)
// =========================================================================================

// SysNotification represents the inbox.
type SysNotification struct {
	ID        string    `json:"id" db:"id"`
	UserID    *string   `json:"user_id,omitempty" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	Message   *string   `json:"message,omitempty" db:"message"`
	Link      *string   `json:"link,omitempty" db:"link"`
	IsRead    *bool     `json:"is_read,omitempty" db:"is_read"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// SysAuditLog represents the security tape.
type SysAuditLog struct {
	ID          string          `json:"id" db:"id"`
	OrgID       *string         `json:"org_id,omitempty" db:"org_id"`
	UserID      *string         `json:"user_id,omitempty" db:"user_id"`
	Action      string          `json:"action" db:"action"`
	EntityType  string          `json:"entity_type" db:"entity_type"`
	EntityID    string          `json:"entity_id" db:"entity_id"`
	Changes     json.RawMessage `json:"changes,omitempty" db:"changes"` // JSONB
	PerformedAt time.Time       `json:"performed_at" db:"performed_at"`
}

// =========================================================================================
// VI. THE SUPER-POWER LAYER (EXTENSIBILITY & ASSETS)
// =========================================================================================

// SysFieldDefinition represents custom fields schema.
type SysFieldDefinition struct {
	ID         string          `json:"id" db:"id"`
	OrgID      string          `json:"org_id" db:"org_id"`
	EntityType string          `json:"entity_type" db:"entity_type"`
	Name       string          `json:"name" db:"name"`
	Key        string          `json:"key" db:"key"`
	DataType   string          `json:"data_type" db:"data_type"`
	Options    json.RawMessage `json:"options,omitempty" db:"options"` // JSONB
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
}

// SysFile represents the file system.
type SysFile struct {
	ID            string     `json:"id" db:"id"`
	OrgID         string     `json:"org_id" db:"org_id"`
	FileName      string     `json:"file_name" db:"file_name"`
	FileSizeBytes *int64     `json:"file_size_bytes,omitempty" db:"file_size_bytes"`
	MimeType      *string    `json:"mime_type,omitempty" db:"mime_type"`
	S3Key         string     `json:"s3_key" db:"s3_key"`
	UploadedBy    *string    `json:"uploaded_by,omitempty" db:"uploaded_by"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// SysTag represents global labels.
type SysTag struct {
	ID        string     `json:"id" db:"id"`
	OrgID     string     `json:"org_id" db:"org_id"`
	Name      string     `json:"name" db:"name"`
	Color     *string    `json:"color,omitempty" db:"color"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

// SysTagging represents the link Tag <-> Entity.
type SysTagging struct {
	ID         string    `json:"id" db:"id"`
	TagID      string    `json:"tag_id" db:"tag_id"`
	EntityType string    `json:"entity_type" db:"entity_type"`
	EntityID   string    `json:"entity_id" db:"entity_id"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// GlobalLink represents the Polymorphic Graph.
type GlobalLink struct {
	ID               string    `json:"id" db:"id"`
	SourceEntityType string    `json:"source_entity_type" db:"source_entity_type"`
	SourceEntityID   string    `json:"source_entity_id" db:"source_entity_id"`
	TargetEntityType string    `json:"target_entity_type" db:"target_entity_type"`
	TargetEntityID   string    `json:"target_entity_id" db:"target_entity_id"`
	LinkType         *string   `json:"link_type,omitempty" db:"link_type"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}
