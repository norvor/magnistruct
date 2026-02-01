package pm

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
)

// LogActivity appends a new entry to the task's JSONB activity_log array.
// This is atomic and much faster than a separate table insert for read-heavy boards.
func LogActivity(ctx context.Context, taskID, userID, action, details string) {
	// 1. Construct the Log Entry object
	entry := LogEntry{
		// We can generate a simple ID if needed, or rely on array index
		UserID:    userID,
		Action:    action,
		Details:   details,
		Timestamp: time.Now(),
	}

	// 2. Marshal to JSON
	jsonEntry, err := json.Marshal(entry)
	if err != nil {
		log.Printf("ERROR: Failed to marshal log entry: %v", err)
		return
	}

	// 3. Append to JSONB Array in Postgres
	// The operator '||' concatenates jsonb arrays.
	// We cast the input string to ::jsonb so Postgres understands it.
	query := `
		UPDATE tasks 
		SET activity_log = activity_log || $1::jsonb 
		WHERE id = $2
	`

	_, err = database.DB.Exec(ctx, query, jsonEntry, taskID)
	if err != nil {
		// Non-fatal error logging
		log.Printf("ERROR: Failed to write activity log (Task: %s): %v", taskID, err)
	}
}
