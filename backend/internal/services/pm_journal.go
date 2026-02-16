package services

import (
	"context"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
)

type JournalEntry struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Content   string    `json:"content"`
	Mood      string    `json:"mood"` // happy, neutral, sad, energetic, tired
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateJournalEntryRequest struct {
	Content string   `json:"content"`
	Mood    string   `json:"mood"`
	Tags    []string `json:"tags"`
}

// InitJournalTable creates the table
func InitJournalTable() {
	query := `
	CREATE TABLE IF NOT EXISTS pm_journal_entries (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL,
		content TEXT NOT NULL,
		mood TEXT,
		tags TEXT[],
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);
	`
	database.DB.Exec(context.Background(), query)
}

func CreateJournalEntry(ctx context.Context, userID string, req CreateJournalEntryRequest) (*JournalEntry, error) {
	var e JournalEntry
	query := `
		INSERT INTO pm_journal_entries (user_id, content, mood, tags)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, content, mood, tags, created_at, updated_at
	`
	err := database.DB.QueryRow(ctx, query, userID, req.Content, req.Mood, req.Tags).Scan(
		&e.ID, &e.UserID, &e.Content, &e.Mood, &e.Tags, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	


	return &e, nil
}

func ListJournalEntries(ctx context.Context, userID string) ([]JournalEntry, error) {
	query := `
		SELECT id, user_id, content, mood, tags, created_at, updated_at
		FROM pm_journal_entries
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := []JournalEntry{}
	for rows.Next() {
		var e JournalEntry
		if err := rows.Scan(&e.ID, &e.UserID, &e.Content, &e.Mood, &e.Tags, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, nil
}

func DeleteJournalEntry(ctx context.Context, id string, userID string) error {
	query := `DELETE FROM pm_journal_entries WHERE id = $1 AND user_id = $2`
	_, err := database.DB.Exec(ctx, query, id, userID)
	return err
}
