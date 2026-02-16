package dto

import "time"

// ============================================================================
// PM HABITS (Daily Routines, Focus)
// ============================================================================

type CreateHabitRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	Frequency   string `json:"frequency"` // daily, weekly
	Color       string `json:"color"`     // hex code or tailwind class
}

type UpdateHabitRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Frequency   *string `json:"frequency"`
	Color       *string `json:"color"`
}

type ToggleHabitRequest struct {
	Date        string `json:"date"` // YYYY-MM-DD to toggle for
	IsCompleted bool   `json:"is_completed"`
}

type HabitResponse struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	OrgID           string    `json:"org_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description,omitempty"`
	Frequency       string    `json:"frequency"`
	Color           string    `json:"color"`
	CurrentStreak   int       `json:"current_streak"`
	MaxStreak       int       `json:"max_streak"`
	IsCompletedToday bool     `json:"is_completed_today"`
	LastCompletedAt *time.Time `json:"last_completed_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
