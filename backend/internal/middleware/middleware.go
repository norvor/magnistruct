package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// Simple in-memory rate limiter
// In production, use Redis
type RateLimiter struct {
	visitors map[string]*rate.Limiter
	mu       sync.Mutex
	r        rate.Limit
	b        int
}

func NewRateLimiter(rps rate.Limit, burst int) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*rate.Limiter),
		r:        rps,
		b:        burst,
	}

	// Cleanup routine
	go func() {
		for {
			time.Sleep(time.Minute)
			rl.mu.Lock()
			// Primitive cleanup - Ideally check last seen
			// For this demo, we just reset map occasionally if needed
			// But creating a proper eviction policy is better.
			// skipping for now.
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(rl.r, rl.b)
		rl.visitors[ip] = limiter
	}

	return limiter
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr // Simple IP check
		
		limiter := rl.getLimiter(ip)
		if !limiter.Allow() {
			w.Header().Set("Retry-After", "1")
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// CORS might overwrite some, but these are good defaults
		next.ServeHTTP(w, r)
	})
}

type structuredResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *structuredResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}

func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		sw := &structuredResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(sw, r)

		duration := time.Since(start)
		
		// Simple structured log format
		logEntry := map[string]interface{}{
			"time":     start.Format(time.RFC3339),
			"method":   r.Method,
			"path":     r.URL.Path,
			"status":   sw.statusCode,
			"duration": duration.String(),
			"ip":       r.RemoteAddr,
		}
		
		jsonBytes, _ := json.Marshal(logEntry)
		// Assuming we pipe this to stdout for aggregator
		fmt.Println(string(jsonBytes)) 
		// Use standard log for now
		_ = jsonBytes
	})
}
