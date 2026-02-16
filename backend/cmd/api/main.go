package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger"
	"golang.org/x/time/rate"

	_ "github.com/norvor/magnistruct/backend/docs" // Import generated docs

	"github.com/norvor/magnistruct/backend/internal/database"
	customMiddleware "github.com/norvor/magnistruct/backend/internal/middleware"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
	"github.com/norvor/magnistruct/backend/internal/modules/awareness"
	"github.com/norvor/magnistruct/backend/internal/modules/files"
	"github.com/norvor/magnistruct/backend/internal/modules/governance"
	"github.com/norvor/magnistruct/backend/internal/modules/iam"
	"github.com/norvor/magnistruct/backend/internal/modules/interaction"
	"github.com/norvor/magnistruct/backend/internal/modules/life"
	"github.com/norvor/magnistruct/backend/internal/modules/pm"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// @title Magnistruct API
// @version 1.0
// @description Backend API for the Magnistruct platform.
// @host localhost:8080
// @BasePath /api
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found (using system env)")
	}

	database.Connect()

	// INIT MODULES
	auth.Init()
	governance.Init()
	pm.Init()
	interaction.Init()
	awareness.Init()

	// INIT SERVICES
	// MinIO Config
	minioEndpoint := os.Getenv("MINIO_ENDPOINT")
	if minioEndpoint == "" {
		minioEndpoint = "localhost:9000" // Fallback for local dev
	}
	minioAccessKey := os.Getenv("MINIO_ACCESS_KEY")
	if minioAccessKey == "" {
		minioAccessKey = "minioadmin"
	}
	minioSecretKey := os.Getenv("MINIO_SECRET_KEY")
	if minioSecretKey == "" {
		minioSecretKey = "minioadmin"
	}
	minioBucket := os.Getenv("MINIO_BUCKET_NAME")
	if minioBucket == "" {
		minioBucket = "magnistruct-uploads"
	}
	minioBaseURL := os.Getenv("MINIO_PUBLIC_URL") // Optional public URL
	if minioBaseURL == "" {
		minioBaseURL = "http://" + minioEndpoint
	}

	filesService, err := files.NewService(database.DB, minioEndpoint, minioAccessKey, minioSecretKey, minioBucket, minioBaseURL)
	if err != nil {
		log.Fatalf("Failed to init files service: %v", err)
	}
	filesHandler := files.NewHandler(filesService)

	iamService := iam.NewService(database.DB)
	iamHandler := iam.NewHandler(iamService)

	lifeService := services.NewLifeService(database.DB)
	lifeHandler := life.NewLifeHandler(lifeService)

	r := chi.NewRouter()
	
	// MIDDLEWARE CHAIN
	r.Use(middleware.Recoverer)
	r.Use(customMiddleware.RequestLogger)
	r.Use(customMiddleware.SecurityHeaders)
	
	rateLimiter := customMiddleware.NewRateLimiter(rate.Limit(100), 200)
	r.Use(rateLimiter.Middleware)

	// CORS
	// CORS
	originsRaw := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if originsRaw != "" {
		for _, o := range strings.Split(originsRaw, ",") {
			trimmed := strings.TrimSpace(o)
			if trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	}
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"http://localhost:5173", "http://localhost:3001", "http://localhost:3000"}
	}
	
	// Log origins for debugging
	log.Printf("CORS Allowed Origins: %v", allowedOrigins)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		AllowCredentials: true,
	}))

	r.Route("/api", func(r chi.Router) {
		
		// SWAGGER DOCS
		r.Get("/docs/*", httpSwagger.Handler(
			httpSwagger.URL("http://localhost:8080/api/docs/doc.json"),
		))

		// AUTH
		r.Route("/auth", auth.SetupRoutes())

		// FILES
		// FILES
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)
			r.Route("/files", filesHandler.RegisterRoutes)
		})

		// IAM / API KEYS
		r.Route("/iam", iamHandler.RegisterRoutes)

		// GOVERNANCE
		r.Group(governance.SetupRoutes())

		// PROJECT MANAGEMENT (PM)
		r.Group(pm.SetupRoutes())

		// INTERACTION
		r.Group(interaction.SetupRoutes())

		// AWARENESS
		r.Group(awareness.SetupRoutes())

		// LIFE (The Whos, Whys, Wheres)
		// LIFE (The Whos, Whys, Wheres)
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)
			r.Route("/life", lifeHandler.RegisterRoutes)
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Backend server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
