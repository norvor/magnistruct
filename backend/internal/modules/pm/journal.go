package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/services"
)

func HandleCreateJournalEntry(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req services.CreateJournalEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, 400)
		return
	}

	entry, err := services.CreateJournalEntry(r.Context(), userID, req)
	if err != nil {
		http.Error(w, `{"error":"Failed to create entry"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

func HandleListJournalEntries(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	entries, err := services.ListJournalEntries(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to list entries"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

func HandleDeleteJournalEntry(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	entryID := chi.URLParam(r, "id")

	err := services.DeleteJournalEntry(r.Context(), entryID, userID)
	if err != nil {
		http.Error(w, `{"error":"Failed to delete entry"}`, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}
