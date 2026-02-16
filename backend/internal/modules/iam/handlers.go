package iam

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Post("/", h.Create)
	r.Get("/", h.List)
	r.Delete("/{id}", h.Revoke)
}

// Create godoc
// @Summary Create API Key
// @Description Create a new API key for fetching data
// @Tags iam
// @Accept json
// @Produce json
// @Param request body dto.CreateAPIKeyRequest true "Request"
// @Success 201 {object} dto.CreateAPIKeyResponse
// @Router /iam/api-keys [post]
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAPIKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	resp, err := h.service.CreateAPIKey(ctx, userID, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// List godoc
// @Summary List API Keys
// @Description List active API keys for the user
// @Tags iam
// @Produce json
// @Success 200 {array} dto.APIKey
// @Router /iam/api-keys [get]
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	keys, err := h.service.ListAPIKeys(ctx, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(keys)
}

// Revoke godoc
// @Summary Revoke API Key
// @Description Delete an API key
// @Tags iam
// @Param id path string true "API Key ID"
// @Success 204
// @Router /iam/api-keys/{id} [delete]
func (h *Handler) Revoke(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.service.RevokeAPIKey(ctx, id, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
