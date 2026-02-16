package interaction

import (
	"fmt"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
)

func Init() {
	fmt.Println("✅ Interaction Module: Ready")
}

func SetupRoutes() func(chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.Middleware)

		// Comments
		r.Post("/comments", HandleCreateComment)
		r.Get("/comments", HandleListComments)
		r.Get("/comments/{id}", HandleGetComment)
		r.Put("/comments/{id}", HandleUpdateComment)
		r.Delete("/comments/{id}", HandleDeleteComment)

		// Reactions
		r.Post("/reactions", HandleAddReaction)
		r.Delete("/reactions", HandleRemoveReaction)
		r.Get("/reactions", HandleListReactions)
		r.Get("/reactions/summary", HandleGetReactionSummary)

		// Activity Feed
		r.Get("/activity/comments", HandleGetRecentComments)
	}
}
