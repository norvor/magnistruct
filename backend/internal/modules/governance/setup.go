package governance

import (
	"fmt"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
)

// Init initializes the governance module
func Init() {
	fmt.Println("✅ Governance Layer: Ready")
}

// SetupRoutes registers all governance routes
func SetupRoutes() func(chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.Middleware)
		
		// Custody Chain
		r.Get("/governance/custody", HandleGetCustodyHistory)
		r.Post("/governance/custody/transfer", HandleTransferOwnership)
	}
}
