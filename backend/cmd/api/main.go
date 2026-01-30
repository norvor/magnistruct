package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
	"github.com/norvor/magnistruct/backend/internal/modules/pm"
)

func main() {
	// 1. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env")
	}

	// 2. Connect to Database
	database.Connect()
	defer database.Close()

	// 3. Initialize Module Tables
	// Note: setup.go in 'pm' package now handles all PM tables including comments
	auth.Init()
	pm.Init()

	// 4. Setup Router
	r := chi.NewRouter()

	// 5. Global Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS: Allow Frontend
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Magnistruct Systems Online 🟢"))
	})

	// --- API v1 ROUTES ---
	r.Route("/api", func(r chi.Router) {

		// PUBLIC AUTH
		r.Post("/auth/register", auth.HandleRegister)
		r.Post("/auth/login", auth.HandleLogin)
		r.Post("/auth/logout", auth.HandleLogout)
		r.Get("/auth/me", auth.HandleMe)

		// PROTECTED MODULES
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)

			// User Profile
			r.Put("/auth/profile", auth.HandleUpdateProfile)

			// --- PM MODULE ---

			// Projects
			r.Get("/projects", pm.HandleListProjects)
			r.Post("/projects", pm.HandleCreateProject)
			r.Get("/projects/{projectID}/board", pm.HandleGetBoard)
			r.Post("/projects/{projectID}/columns", pm.HandleCreateColumn)
			r.Post("/projects/{projectID}/tasks", pm.HandleCreateTask)

			// Tasks
			r.Route("/tasks/{taskID}", func(r chi.Router) {
				r.Put("/", pm.HandleUpdateTask)       // General Update
				r.Put("/toggle", pm.HandleToggleTask) // Checkbox
				r.Delete("/", pm.HandleDeleteTask)    // Archive/Delete

				// Re-ordering (Drag & Drop)
				// Note: Board.go handler currently reads task_id from body,
				// but this route structure is cleaner for the API.
				r.Put("/move", pm.HandleMoveTask)

				// Conversation Layer (New)
				r.Get("/comments", pm.HandleListComments)
				r.Post("/comments", pm.HandleCreateComment)
			})
		})
	})

	// 6. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Starting Magnistruct Monolith on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
