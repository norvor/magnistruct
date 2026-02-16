package iam

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) CreateAPIKey(ctx context.Context, userID string, req dto.CreateAPIKeyRequest) (*dto.CreateAPIKeyResponse, error) {
	// 1. Generate Raw Key (e.g., "mk_live_...")
	rawKeyBytes := make([]byte, 32)
	if _, err := rand.Read(rawKeyBytes); err != nil {
		return nil, err
	}
	rawKey := fmt.Sprintf("mk_live_%x", rawKeyBytes)
	keyPrefix := rawKey[:12]

	// 2. Hash Key
	hasher := sha256.New()
	hasher.Write([]byte(rawKey))
	keyHash := hex.EncodeToString(hasher.Sum(nil))

	// 3. Expiry
	var expiresAt *time.Time
	if req.ExpiresInDays > 0 {
		t := time.Now().Add(time.Duration(req.ExpiresInDays) * 24 * time.Hour)
		expiresAt = &t
	}

	// 4. Insert DB
	id := uuid.New().String()
	query := `
		INSERT INTO sys_api_keys (id, user_id, key_hash, key_prefix, label, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING created_at
	`
	var createdAt time.Time
	err := s.db.QueryRow(ctx, query, id, userID, keyHash, keyPrefix, req.Label, expiresAt).Scan(&createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create api key: %w", err)
	}

	return &dto.CreateAPIKeyResponse{
		APIKey: dto.APIKey{
			ID:        id,
			UserID:    userID,
			KeyPrefix: keyPrefix,
			Label:     req.Label,
			ExpiresAt: expiresAt,
			CreatedAt: createdAt,
		},
		RawKey: rawKey,
	}, nil
}

func (s *Service) ListAPIKeys(ctx context.Context, userID string) ([]*dto.APIKey, error) {
	query := `
		SELECT id, key_prefix, label, last_used_at, expires_at, created_at
		FROM sys_api_keys
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []*dto.APIKey
	for rows.Next() {
		var k dto.APIKey
		if err := rows.Scan(&k.ID, &k.KeyPrefix, &k.Label, &k.LastUsedAt, &k.ExpiresAt, &k.CreatedAt); err != nil {
			return nil, err
		}
		k.UserID = userID
		keys = append(keys, &k)
	}
	return keys, nil
}

func (s *Service) RevokeAPIKey(ctx context.Context, id, userID string) error {
	query := `DELETE FROM sys_api_keys WHERE id = $1 AND user_id = $2`
	_, err := s.db.Exec(ctx, query, id, userID)
	return err
}

// Authenticate returns user info if key is valid
func (s *Service) Authenticate(ctx context.Context, rawKey string) (string, error) {
	hasher := sha256.New()
	hasher.Write([]byte(rawKey))
	keyHash := hex.EncodeToString(hasher.Sum(nil))

	query := `
		UPDATE sys_api_keys
		SET last_used_at = NOW()
		WHERE key_hash = $1
		  AND (expires_at IS NULL OR expires_at > NOW())
		RETURNING user_id
	`
	var userID string
	err := s.db.QueryRow(ctx, query, keyHash).Scan(&userID)
	if err == pgx.ErrNoRows {
		return "", fmt.Errorf("invalid or expired api key")
	}
	if err != nil {
		return "", err
	}
	return userID, nil
}
