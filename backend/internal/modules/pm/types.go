package pm

import (
	"time"
)

// ==========================================
// 1. SYSTEM CORE
// ==========================================

type UserSummary struct {
	ID           string `json:"id"`
	FullName     string `json:"full_name"`
	AvatarURL    string `json:"avatar_url,omitempty"`
	JobTitle     string `json:"job_title,omitempty"`
}

// ==========================================
// 2. PM MODULE
// ==========================================

type Comment struct {
	ID        string       `json:"id"`
	EntityID  string       `json:"entity_id"`
	Content   string       `json:"content"`
	UserID    string       `json:"user_id"`
	User      *UserSummary `json:"user,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
}
