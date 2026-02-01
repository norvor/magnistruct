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
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	database.Connect()

	// INIT MODULES (Creates Tables)
	auth.Init()
	pm.SetupRoutes() // (Rename this to pm.Init() if you want consistency)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Route("/api", func(r chi.Router) {

		// --- AUTHENTICATION ---
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", auth.HandleRegister)
			r.Post("/login", auth.HandleLogin)
			r.Post("/logout", auth.HandleLogout)
			r.With(auth.Middleware).Get("/me", auth.HandleMe)
		})

		// --- PROTECTED ROUTES ---
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)

			// 1. ORGANIZATION & TEAMS (The Hierarchy)
			r.Route("/orgs", func(r chi.Router) {
				r.Get("/", pm.HandleGetMyOrgs)                // List my orgs
				r.Post("/", pm.HandleCreateOrg)               // Create new org
				r.Post("/{orgID}/switch", pm.HandleSwitchOrg) // Switch context

				// Teams within Org
				r.Get("/{orgID}/teams", pm.HandleListTeams)
				r.Post("/{orgID}/teams", pm.HandleCreateTeam)
			})

			// 2. PROJECTS (Context Aware)
			r.Route("/projects", func(r chi.Router) {
				r.Get("/", pm.HandleListProjects) // Lists based on ?org_id= or active context
				r.Post("/", pm.HandleCreateProject)

				r.Route("/{projectID}", func(r chi.Router) {
					r.Get("/board", pm.HandleGetBoard) // The "Steel" Dashboard Load
					r.Put("/", pm.HandleUpdateProject)

					// Creating tasks needs project context
					r.Post("/tasks", pm.HandleCreateTask)

					// Toggle Engine (if needed separate, or use UpdateProject)
					// r.Put("/engines", pm.HandleToggleEngine)
				})
			})

			// 3. TASKS (The Engine Room)
			r.Route("/tasks/{taskID}", func(r chi.Router) {
				r.Put("/", pm.HandleUpdateTask) // Universal Update
				r.Delete("/", pm.HandleDeleteTask)
				r.Put("/move", pm.HandleMoveTask) // Kanban Drag & Drop

				// JSONB Activity Log
				r.Get("/activity", pm.HandleGetTaskActivity)

				// Subtasks
				r.Post("/subtasks", pm.HandleCreateSubtask)
			})

			// 4. SUBTASKS (Direct manipulation)
			r.Route("/subtasks/{subtaskID}", func(r chi.Router) {
				r.Put("/toggle", pm.HandleToggleSubtask)
				r.Delete("/", pm.HandleDeleteSubtask)
			})
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Starting Server on %s...\n", port)
	http.ListenAndServe(":"+port, r)
}
