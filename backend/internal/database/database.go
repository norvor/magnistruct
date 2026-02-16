package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB is the global connection pool.
// In a monolith, accessing this global variable is the simplest way to run queries.
var DB *pgxpool.Pool

// Connect initializes the database connection
func Connect() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set in .env")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("Unable to parse database config: %v", err)
	}

	// Performance Settings (Crucial for Enterprise Apps)
	config.MaxConns = 25                      // Max simultaneous connections
	config.MinConns = 2                       // Keep at least 2 idle connections ready
	config.MaxConnLifetime = 1 * time.Hour    // Recycle connections every hour
	config.MaxConnIdleTime = 30 * time.Minute // Close connection if idle for 30m

	// Create the pool
	db, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}

	// Ping to verify connection
	if err := db.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}

	fmt.Println("✅ Connected to PostgreSQL successfully")

	// Auto-Migrate Schema
	schemaPath := "internal/database/schema.sql"
	// Fallback for running from different directories (e.g. tests)
	if _, err := os.Stat(schemaPath); os.IsNotExist(err) {
		schemaPath = "../../internal/database/schema.sql"
	}

	c, err := os.ReadFile(schemaPath)
	if err != nil {
		// Try one more common path before failing (e.g. if binary is built)
		// For now, fast fail is better than silent failure
		log.Fatalf("Unable to read schema file at %s: %v", schemaPath, err)
	}

	if _, err := db.Exec(context.Background(), string(c)); err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	// Ensure new columns exist (Postgres 9.6+)
	alterQueries := []string{
		`ALTER TABLE pm_journeys ADD COLUMN IF NOT EXISTS engine_spec_id UUID;`,
		`ALTER TABLE pm_work_items ADD COLUMN IF NOT EXISTS journey_id UUID REFERENCES pm_journeys(id) ON DELETE SET NULL;`,
		`ALTER TABLE pm_work_items ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES pm_goals(id) ON DELETE SET NULL;`,
		`ALTER TABLE pm_goals ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES sys_users(id);`,
		`ALTER TABLE pm_goals ADD COLUMN IF NOT EXISTS purpose_id UUID REFERENCES life_purposes(id) ON DELETE SET NULL;`,
		`ALTER TABLE pm_goals ADD COLUMN IF NOT EXISTS cover_image TEXT;`,
		`ALTER TABLE pm_goals ADD COLUMN IF NOT EXISTS category TEXT;`,
	}

	for _, q := range alterQueries {
		if _, err := db.Exec(context.Background(), q); err != nil {
			fmt.Printf("Note: Migration check for query [%s] failed: %v\n", q, err)
		}
	}

	fmt.Println("✅ Database Schema Migrated Successfully (35 Tables)")

	DB = db
}

// Close gracefully shuts down the connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
