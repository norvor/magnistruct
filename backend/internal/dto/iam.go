package dto

import "time"

type APIKey struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	KeyPrefix string    `json:"key_prefix"`
	Label     string    `json:"label"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateAPIKeyRequest struct {
	Label     string `json:"label"`
	ExpiresInDays int `json:"expires_in_days"` // 0 = no expiry
}

type CreateAPIKeyResponse struct {
	APIKey APIKey `json:"api_key"`
	RawKey string `json:"raw_key"` // Shown only once
}
