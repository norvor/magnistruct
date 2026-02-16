package auth

import (
	"context"
	"net/http"

	"github.com/norvor/magnistruct/backend/internal/database"
)

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Token from Cookie OR Header
		var tokenString string
		c, err := r.Cookie("session_token")
		if err == nil && c.Value != "" {
			tokenString = c.Value
		}

		if tokenString == "" {
			authHeader := r.Header.Get("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
			}
		}

		if tokenString == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// 2. Check DB
		var userID string
		err = database.DB.QueryRow(r.Context(),
			"SELECT user_id FROM sys_sessions WHERE token = $1 AND expires_at > NOW()",
			tokenString).Scan(&userID)

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
