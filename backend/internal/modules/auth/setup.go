package auth

import (
	"fmt"

	"github.com/go-chi/chi/v5"
)

// Init is now handled by the central migration system
func Init() {
	fmt.Println("✅ Auth System: Schema managed by central migration")
}

func SetupRoutes() func(chi.Router) {
	return func(r chi.Router) {
		// Public
		r.Post("/register", HandleRegister)
		r.Post("/login", HandleLogin)
		r.Post("/logout", HandleLogout)

		// Protected
		r.With(Middleware).Get("/me", HandleMe)
	}
}
