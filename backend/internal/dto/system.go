package dto

import "time"

// ============================================================================
// ORGANIZATION DTOs
// ============================================================================

type OrganizationResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	PlanTier  string    `json:"plan_tier"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateOrganizationRequest struct {
	Name     string `json:"name" validate:"required"`
	PlanTier string `json:"plan_tier,omitempty"`
}

// ============================================================================
// TEAM DTOs
// ============================================================================

type TeamResponse struct {
	ID             string    `json:"id"`
	OrgID          string    `json:"org_id"`
	Name           string    `json:"name"`
	Description    string    `json:"description,omitempty"`
	EnabledModules []string  `json:"enabled_modules"`
	MemberCount    int       `json:"member_count,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateTeamRequest struct {
	OrgID          string   `json:"org_id" validate:"required"`
	Name           string   `json:"name" validate:"required"`
	Description    string   `json:"description"`
	EnabledModules []string `json:"enabled_modules" validate:"required"`
}

type UpdateTeamRequest struct {
	Name           string   `json:"name,omitempty"`
	Description    string   `json:"description,omitempty"`
	EnabledModules []string `json:"enabled_modules,omitempty"`
}

// ============================================================================
// MEMBER DTOs (Organization Members)
// ============================================================================

type MemberResponse struct {
	ID       string    `json:"id"`
	UserID   string    `json:"user_id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}

type AddMemberRequest struct {
	UserID string `json:"user_id" validate:"required"`
	Role   string `json:"role" validate:"required,oneof=owner admin member guest"`
}

type UpdateMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=owner admin member guest"`
}

// ============================================================================
// TEAM MEMBER DTOs
// ============================================================================

type TeamMemberResponse struct {
	ID       string    `json:"id"`
	UserID   string    `json:"user_id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}

type AddTeamMemberRequest struct {
	UserID string `json:"user_id" validate:"required"`
	Role   string `json:"role" validate:"oneof=lead contributor"`
}
