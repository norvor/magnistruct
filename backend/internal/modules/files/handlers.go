package files

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	var _ = dto.File{} // Force import for Swag
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Post("/", h.Upload)
	r.Get("/{id}", h.Get)
	r.Get("/entity/{type}/{id}", h.ListByEntity)
}

// Upload godoc
// @Summary Upload a file
// @Description Upload a file associated with an entity
// @Tags files
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param entity_type formData string false "Entity Type"
// @Param entity_id formData string false "Entity ID"
// @Success 201 {object} dto.File
// @Failure 400 {object} models.ErrorResponse
// @Router /files [post]
func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	// 32MB max memory
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		fmt.Printf("Error parsing multipart form: %v\n", err)
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		fmt.Printf("Error retrieving file from form: %v\n", err)
		http.Error(w, "Invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Strict MIME type validation
	buff := make([]byte, 512)
	_, err = file.Read(buff)
	if err != nil {
		fmt.Printf("Error reading file buffer: %v\n", err)
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}
	fileType := http.DetectContentType(buff)
	fmt.Printf("Detected content type: %s\n", fileType)
	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "image/webp" {
		fmt.Printf("Invalid file type: %s\n", fileType)
		http.Error(w, "Invalid file type. Only JPEG, PNG, and WebP are allowed.", http.StatusBadRequest)
		return
	}
	// Reset file pointer
	file.Seek(0, 0)

	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	entityType := r.FormValue("entity_type")
	entityID := r.FormValue("entity_id")

	uploadedFile, err := h.service.Upload(ctx, userID, header, entityType, entityID)
	if err != nil {
		fmt.Printf("Upload service error: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(uploadedFile)
}

// Get godoc
// @Summary Get file metadata
// @Description Get metadata for a specific file
// @Tags files
// @Produce json
// @Param id path string true "File ID"
// @Success 200 {object} dto.File
// @Failure 404 {object} models.ErrorResponse
// @Router /files/{id} [get]
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	file, err := h.service.Get(ctx, id, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if file == nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(file)
}

// ListByEntity godoc
// @Summary List files for an entity
// @Description List all files attached to a specific entity
// @Tags files
// @Produce json
// @Param type path string true "Entity Type"
// @Param id path string true "Entity ID"
// @Success 200 {array} dto.File
// @Router /files/entity/{type}/{id} [get]
func (h *Handler) ListByEntity(w http.ResponseWriter, r *http.Request) {
	eType := chi.URLParam(r, "type")
	eID := chi.URLParam(r, "id")
	ctx := r.Context()
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	files, err := h.service.ListByEntity(ctx, userID, eType, eID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(files)
}
