package dto

import "time"

// ============================================================================
// LIFE: LOVES (The Whos)
// ============================================================================

type CreateLoveRequest struct {
	Name         string                 `json:"name" validate:"required"`
	Relationship string                 `json:"relationship"` // family, friend, partner, mentor, etc.
	Birthday     *string                `json:"birthday"`     // ISO date string YYYY-MM-DD
	ContactInfo  map[string]interface{} `json:"contact_info"`
	AvatarURL    string                 `json:"avatar_url"`
	Notes        string                 `json:"notes"`
	PinIDs       []string               `json:"pin_ids"`
}

type UpdateLoveRequest struct {
	Name         *string                 `json:"name"`
	Relationship *string                 `json:"relationship"`
	Birthday     *string                 `json:"birthday"`
	ContactInfo  map[string]interface{}  `json:"contact_info"`
	AvatarURL    *string                 `json:"avatar_url"`
	Notes        *string                 `json:"notes"`
	PinIDs       []string                `json:"pin_ids"`
}

type LoveResponse struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Relationship string                 `json:"relationship"`
	Birthday     *string                `json:"birthday,omitempty"`
	ContactInfo  map[string]interface{} `json:"contact_info,omitempty"`
	AvatarURL    string                 `json:"avatar_url,omitempty"`
	Notes        string                 `json:"notes,omitempty"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	Pins         []PinResponse          `json:"pins,omitempty"`
}

// ============================================================================
// LIFE: PURPOSES (The Whys)
// ============================================================================

type CreatePurposeRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	Type        string   `json:"type"`       // value, mission, vision
	Importance  int      `json:"importance"` // 1-5
	LoveIDs     []string `json:"love_ids"`
}

type UpdatePurposeRequest struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Type        *string  `json:"type"`
	Importance  *int     `json:"importance"`
	LoveIDs     []string `json:"love_ids"`
}

type PurposeResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Type        string    `json:"type"`
	Importance  int            `json:"importance"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Loves       []LoveResponse `json:"loves,omitempty"`
}

// ============================================================================
// LIFE: PINS (The Wheres)
// ============================================================================

type CreatePinRequest struct {
	Name        string   `json:"name" validate:"required"`
	Address     string   `json:"address"`
	Type        string   `json:"type"` // home, work, travel, favorite
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	Notes       string   `json:"notes"`
	VisitedAt   *string  `json:"visited_at"`
	ImageURL    string   `json:"image_url"`
}

type UpdatePinRequest struct {
	Name        *string  `json:"name"`
	Address     *string  `json:"address"`
	Type        *string  `json:"type"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	Notes       *string  `json:"notes"`
	VisitedAt   *string  `json:"visited_at"`
	ImageURL    *string  `json:"image_url"`
}

type PinResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Address     string     `json:"address,omitempty"`
	Type        string     `json:"type"`
	Latitude    *float64   `json:"latitude,omitempty"`
	Longitude   *float64   `json:"longitude,omitempty"`
	Notes       string     `json:"notes,omitempty"`
	ImageURL    string     `json:"image_url,omitempty"`
	VisitedAt   *time.Time `json:"visited_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
