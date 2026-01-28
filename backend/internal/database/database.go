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
	DB = db
}

// Close gracefully shuts down the connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
