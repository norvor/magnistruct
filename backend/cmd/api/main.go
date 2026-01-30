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

		// 1. AUTH MODULE (Handles /api/auth/login, /api/auth/me, etc.)
		r.Route("/auth", auth.SetupRoutes)

		// 2. PM MODULE (Needs Auth Middleware explicitly)
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware) // Protect everything below

			r.Get("/projects", pm.HandleListProjects)
			r.Post("/projects", pm.HandleCreateProject)

			r.Get("/projects/{projectID}/board", pm.HandleGetBoard)
			r.Put("/projects/{projectID}/engines", pm.HandleToggleEngine)

			r.Post("/projects/{projectID}/columns", pm.HandleCreateColumn)
			r.Post("/projects/{projectID}/tasks", pm.HandleCreateTask)

			r.Route("/tasks/{taskID}", func(r chi.Router) {
				r.Put("/", pm.HandleUpdateTask)
				r.Post("/toggle", pm.HandleToggleTask)
				r.Delete("/", pm.HandleDeleteTask)
				r.Put("/move", pm.HandleMoveTask)
				r.Get("/comments", pm.HandleListComments)
				r.Post("/comments", pm.HandleCreateComment)
				r.Post("/subtasks", pm.HandleCreateSubtask)
			})

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
