package auth

import (
	"context"
	"net/http"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Cookie
		c, err := r.Cookie("session_token")
		if err != nil || c.Value == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// 2. Check DB
		var userID string
		err = database.DB.QueryRow(r.Context(),
			"SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
			c.Value).Scan(&userID)

		if err != nil {
			http.Error(w, "Session Expired", http.StatusUnauthorized)
			return
		}

		// 3. Success! Pass "user_id" (snake_case) to next handler
		// FIX: Changed "userID" to "user_id" to match the PM module
		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
