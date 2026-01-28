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

	// 3. Initialize Module Tables (Run Migrations)
	pm.Init()   // Creates Projects, Tasks, Columns tables
	auth.Init() // Creates Users, Sessions tables

	// 4. Setup Router
	r := chi.NewRouter()

	// 5. Global Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS: CRITICAL for Auth
	// We must allow the frontend origin explicitly to support Cookies (Credentials)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // The SvelteKit Port
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // Required for HTTP-Only Cookies
		MaxAge:           300,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Magnistruct Systems Online 🟢"))
	})

	// --- PUBLIC ROUTES (Auth) ---
	r.Post("/auth/register", auth.HandleRegister)
	r.Post("/auth/login", auth.HandleLogin)
	r.Post("/auth/logout", auth.HandleLogout)
	r.Get("/auth/me", auth.HandleMe) // Check current session

	// --- PROTECTED ROUTES (PM Module) ---
	// All routes inside this Group require a valid Login Cookie
	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware) // The Gatekeeper

		r.Put("/auth/profile", auth.HandleUpdateProfile)

		r.Route("/pm", func(r chi.Router) {
			// Projects
			r.Get("/projects", pm.HandleListProjects)
			r.Post("/projects", pm.HandleCreateProject)

			// The Board (Kanban Data)
			r.Get("/projects/{projectID}/board", pm.HandleGetBoard)

			// Columns
			r.Post("/projects/{projectID}/columns", pm.HandleCreateColumn)

			// Tasks
			r.Post("/projects/{projectID}/tasks", pm.HandleCreateTask)
			r.Put("/tasks/{taskID}", pm.HandleUpdateTask)        // Edit Title/Desc
			r.Put("/tasks/{taskID}/toggle", pm.HandleToggleTask) // Check off
			r.Delete("/tasks/{taskID}", pm.HandleDeleteTask)     // Delete
			r.Post("/tasks/move", pm.HandleMoveTask)             // Drag & Drop
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
