package pm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/services"
)

// HandleCreateWorkItem creates a new work item
func HandleCreateWorkItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req dto.CreateWorkItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	item, err := services.CreateWorkItem(r.Context(), req, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create work item"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// HandleListWorkItems lists work items with filtering
func HandleListWorkItems(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	// Extract filter parameters
	var status, itemType, priority, assigneeID, journeyID, goalID, parentID *string
	if s := r.URL.Query().Get("status"); s != "" {
		status = &s
	}
	if t := r.URL.Query().Get("type"); t != "" {
		itemType = &t
	}
	if p := r.URL.Query().Get("priority"); p != "" {
		priority = &p
	}
	if a := r.URL.Query().Get("assignee_id"); a != "" {
		assigneeID = &a
	}
	if j := r.URL.Query().Get("journey_id"); j != "" {
		journeyID = &j
	}
	if g := r.URL.Query().Get("goal_id"); g != "" {
		goalID = &g
	}
	if p := r.URL.Query().Get("parent_id"); p != "" {
		parentID = &p
	}

	items, err := services.ListWorkItems(r.Context(), userID, status, itemType, priority, assigneeID, journeyID, goalID, parentID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch work items"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// HandleGetWorkItem returns a single work item
func HandleGetWorkItem(w http.ResponseWriter, r *http.Request) {
	workItemID := chi.URLParam(r, "id")

	item, err := services.GetWorkItem(r.Context(), workItemID)
	if err != nil {
		http.Error(w, `{"error": "Work item not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// HandleUpdateWorkItem updates a work item
func HandleUpdateWorkItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	workItemID := chi.URLParam(r, "id")

	var req dto.UpdateWorkItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := services.UpdateWorkItem(r.Context(), workItemID, req, userID); err != nil {
		http.Error(w, `{"error": "Failed to update work item"}`, http.StatusInternalServerError)
		return
	}

	item, _ := services.GetWorkItem(r.Context(), workItemID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// HandleDeleteWorkItem deletes a work item
func HandleDeleteWorkItem(w http.ResponseWriter, r *http.Request) {
	workItemID := chi.URLParam(r, "id")

	if err := services.DeleteWorkItem(r.Context(), workItemID); err != nil {
		http.Error(w, `{"error": "Failed to delete work item"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Work item deleted successfully"})
}

// HandleGetSubtasks returns subtasks of a work item
func HandleGetSubtasks(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	parentID := chi.URLParam(r, "id")

	items, err := services.GetSubtasks(r.Context(), parentID, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch subtasks"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
