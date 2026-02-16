package pm

import (
	"context"
	"encoding/json"
	"log"

	"github.com/norvor/magnistruct/backend/internal/database"
)

// LogActivity inserts into sys_audit_logs
func LogActivity(ctx context.Context, entityID, userID, action, details string) {
	
	changesMap := map[string]string{
		"details": details,
	}
	changesJSON, _ := json.Marshal(changesMap)

	query := `
		INSERT INTO sys_audit_logs (user_id, action, entity_type, entity_id, changes)
		VALUES ($1, $2, 'pm_work_item', $3, $4)
	`

	_, err := database.DB.Exec(ctx, query, userID, action, entityID, changesJSON)
	if err != nil {
		log.Printf("ERROR: Failed to write audit log: %v", err)
	}
}
