package life

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/norvor/magnistruct/backend/internal/dto"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
	"github.com/norvor/magnistruct/backend/internal/services"
)

type LifeHandler struct {
	Service *services.LifeService
}

func NewLifeHandler(service *services.LifeService) *LifeHandler {
	return &LifeHandler{Service: service}
}

func (h *LifeHandler) RegisterRoutes(r chi.Router) {
	r.Use(auth.Middleware)

	// Loves (The Whos)
	r.Get("/loves", h.HandleGetLoves)
	r.Post("/loves", h.HandleCreateLove)
	r.Put("/loves/{id}", h.HandleUpdateLove)
	r.Delete("/loves/{id}", h.HandleDeleteLove)

	// Purposes (The Whys)
	r.Get("/purposes", h.HandleGetPurposes)
	r.Post("/purposes", h.HandleCreatePurpose)
	r.Put("/purposes/{id}", h.HandleUpdatePurpose)
	r.Delete("/purposes/{id}", h.HandleDeletePurpose)

	// Pins (The Wheres)
	r.Get("/pins", h.HandleGetPins)
	r.Post("/pins", h.HandleCreatePin)
	r.Put("/pins/{id}", h.HandleUpdatePin)
	r.Delete("/pins/{id}", h.HandleDeletePin)
}

// Implement Handlers below...

// --- LOVES ---

func (h *LifeHandler) HandleGetLoves(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)

	loves, err := h.Service.GetLoves(r.Context(), userID)
	if err != nil {
		fmt.Printf("Error getting loves: %v\n", err)
		http.Error(w, `{"error": "Failed to fetch loves"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loves)
}

func (h *LifeHandler) HandleCreateLove(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	var req dto.CreateLoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	love, err := h.Service.CreateLove(r.Context(), userID, req)
	if err != nil {
		fmt.Printf("Error creating love: %v\n", err)
		http.Error(w, `{"error": "Failed to create love"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(love)
}

func (h *LifeHandler) HandleUpdateLove(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	loveID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	var req dto.UpdateLoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	love, err := h.Service.UpdateLove(r.Context(), userID, loveID, req)
	if err != nil {
		http.Error(w, `{"error": "Failed to update love"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(love)
}

func (h *LifeHandler) HandleDeleteLove(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	loveID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.DeleteLove(r.Context(), userID, loveID); err != nil {
		http.Error(w, `{"error": "Failed to delete love"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Love deleted"})
}

// --- PURPOSES ---

func (h *LifeHandler) HandleGetPurposes(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)

	purposes, err := h.Service.GetPurposes(r.Context(), userID)
	if err != nil {
		fmt.Printf("Error getting purposes: %v\n", err)
		http.Error(w, `{"error": "Failed to fetch purposes"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(purposes)
}

func (h *LifeHandler) HandleCreatePurpose(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	var req dto.CreatePurposeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	purpose, err := h.Service.CreatePurpose(r.Context(), userID, req)
	if err != nil {
		fmt.Printf("Error creating purpose: %v\n", err)
		http.Error(w, `{"error": "Failed to create purpose"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(purpose)
}

func (h *LifeHandler) HandleUpdatePurpose(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	purposeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	var req dto.UpdatePurposeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	purpose, err := h.Service.UpdatePurpose(r.Context(), userID, purposeID, req)
	if err != nil {
		fmt.Printf("Error updating purpose: %v\n", err)
		http.Error(w, `{"error": "Failed to update purpose"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(purpose)
}

func (h *LifeHandler) HandleDeletePurpose(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	purposeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.DeletePurpose(r.Context(), userID, purposeID); err != nil {
		http.Error(w, `{"error": "Failed to delete purpose"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Purpose deleted"})
}

// --- PINS ---

func (h *LifeHandler) HandleGetPins(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)

	pins, err := h.Service.GetPins(r.Context(), userID)
	if err != nil {
		fmt.Printf("Error getting pins: %v\n", err)
		http.Error(w, `{"error": "Failed to fetch pins"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pins)
}

func (h *LifeHandler) HandleCreatePin(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	var req dto.CreatePinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	pin, err := h.Service.CreatePin(r.Context(), userID, req)
	if err != nil {
		fmt.Printf("Error creating pin: %v\n", err)
		http.Error(w, `{"error": "Failed to create pin"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pin)
}

func (h *LifeHandler) HandleUpdatePin(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	pinID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	var req dto.UpdatePinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	pin, err := h.Service.UpdatePin(r.Context(), userID, pinID, req)
	if err != nil {
		http.Error(w, `{"error": "Failed to update pin"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pin)
}

func (h *LifeHandler) HandleDeletePin(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.Context().Value("user_id").(string)
	userID, _ := uuid.Parse(userIdStr)
	pinID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "Invalid ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.DeletePin(r.Context(), userID, pinID); err != nil {
		http.Error(w, `{"error": "Failed to delete pin"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Pin deleted"})
}
