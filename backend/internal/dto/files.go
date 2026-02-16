package dto

import "time"

type File struct {
	ID         string    `json:"id"`
	UploaderID string    `json:"uploader_id"`
	Filename   string    `json:"filename"`
	MimeType   string    `json:"mime_type"`
	Size       int64     `json:"size_bytes"`
	EntityType string    `json:"entity_type,omitempty"`
	EntityID   string    `json:"entity_id,omitempty"`
	URL        string    `json:"url"` // Signed or public URL
	CreatedAt  time.Time `json:"created_at"`
}

type UploadFileRequest struct {
	EntityType string `form:"entity_type"`
	EntityID   string `form:"entity_id"`
	// File binary is in multipart form "file"
}
