package files

import (
	"context"
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

type Service struct {
	db          *pgxpool.Pool
	minioClient *minio.Client
	bucketName  string
	baseURL     string
}

func NewService(db *pgxpool.Pool, endpoint, accessKey, secretKey, bucketName, baseURL string) (*Service, error) {
	// Initialize MinIO client object.
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false, // Dev (localhost)
	})
	if err != nil {
		return nil, err
	}

	// Ensure bucket exists
	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket existence: %w", err)
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket: %w", err)
		}
		
		// Set public policy for read access (simplified for dev)
		policy := fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": {"AWS": ["*"]},
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}
			]
		}`, bucketName)
		err = minioClient.SetBucketPolicy(ctx, bucketName, policy)
		if err != nil {
		    fmt.Printf("Warning: failed to set bucket policy: %v\n", err)
		}
	}

	return &Service{
		db:          db,
		minioClient: minioClient,
		bucketName:  bucketName,
		baseURL:     baseURL,
	}, nil
}

func (s *Service) Upload(ctx context.Context, userID string, fileHeader *multipart.FileHeader, entityType, entityID string) (*dto.File, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Generate keys
	fileID := uuid.New().String()
	ext := filepath.Ext(fileHeader.Filename)
	objectName := fmt.Sprintf("%s/%s%s", userID, fileID, ext)
	
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	// Compress/Optimize Image
	var uploadBody io.Reader = src
	var uploadSize = fileHeader.Size
	
	// Decode and re-encode for optimization (if image)
	if mimeType == "image/jpeg" || mimeType == "image/png" || mimeType == "image/jpg" {
		// Reset file pointer just in case
		src.Seek(0, 0)
		img, format, err := image.Decode(src)
		if err == nil {
			buf := new(bytes.Buffer)
			var optErr error
			if format == "jpeg" || format == "jpg" {
				// 85 quality is a good balance of "lossless-like" quality and compression
				optErr = jpeg.Encode(buf, img, &jpeg.Options{Quality: 85})
			} else if format == "png" {
				// Standard PNG compression (lossless)
				optErr = png.Encode(buf, img)
			} else {
				// If webp or other, just use original
				optErr = fmt.Errorf("unsupported format for optimization")
			}
			
			if optErr == nil {
				uploadBody = buf
				uploadSize = int64(buf.Len())
				mimeType = "image/" + format // ensure correct mime
			} else {
				// Fallback to original
				src.Seek(0, 0)
			}
		} else {
			// Fallback to original
			src.Seek(0, 0)
		}
	} else {
		src.Seek(0, 0)
	}

	// Upload to MinIO
	_, err = s.minioClient.PutObject(ctx, s.bucketName, objectName, uploadBody, uploadSize, minio.PutObjectOptions{
		ContentType: mimeType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to MinIO: %w", err)
	}

	// Record in DB
	query := `
		INSERT INTO sys_files (id, user_id, file_name, s3_key, mime_type, file_size_bytes, entity_type, entity_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING created_at
	`
	
	var createdAt time.Time
	// Handle entityID being empty string causing UUID parsing error or just store as NULL if empty
	var dbEntityID *string
	if entityID != "" {
		dbEntityID = &entityID
	}

	err = s.db.QueryRow(ctx, query, 
		fileID, userID, fileHeader.Filename, objectName, mimeType, uploadSize, 
		entityType, dbEntityID,
	).Scan(&createdAt)

	if err != nil {
		// Cleanup orphan object
		s.minioClient.RemoveObject(ctx, s.bucketName, objectName, minio.RemoveObjectOptions{})
		return nil, fmt.Errorf("failed to insert file record: %w", err)
	}

	return &dto.File{
		ID:         fileID,
		UploaderID: userID,
		Filename:   fileHeader.Filename,
		MimeType:   mimeType,
		Size:       uploadSize,
		EntityType: entityType,
		EntityID:   entityID,
		URL:        fmt.Sprintf("%s/%s/%s", s.baseURL, s.bucketName, objectName),
		CreatedAt:  createdAt,
	}, nil
}

func (s *Service) Get(ctx context.Context, id, userID string) (*dto.File, error) {
	query := `
		SELECT id, user_id, file_name, s3_key, mime_type, file_size_bytes, entity_type, entity_id, created_at
		FROM sys_files
		WHERE id = $1 AND user_id = $2
	`

	var f dto.File
	var key string
	var eType, eID *string

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&f.ID, &f.UploaderID, &f.Filename, &key, &f.MimeType, &f.Size, &eType, &eID, &f.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if eType != nil { f.EntityType = *eType }
	if eID != nil { f.EntityID = *eID }
	f.URL = fmt.Sprintf("%s/%s/%s", s.baseURL, s.bucketName, key)

	return &f, nil
}

func (s *Service) ListByEntity(ctx context.Context, userID, entityType, entityID string) ([]*dto.File, error) {
	query := `
		SELECT id, user_id, file_name, s3_key, mime_type, file_size_bytes, created_at
		FROM sys_files
		WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3
		ORDER BY created_at DESC
	`

	rows, err := s.db.Query(ctx, query, userID, entityType, entityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []*dto.File
	for rows.Next() {
		var f dto.File
		var key string
		if err := rows.Scan(&f.ID, &f.UploaderID, &f.Filename, &key, &f.MimeType, &f.Size, &f.CreatedAt); err != nil {
			return nil, err
		}
		f.EntityType = entityType
		f.EntityID = entityID
		f.URL = fmt.Sprintf("%s/%s/%s", s.baseURL, s.bucketName, key)
		files = append(files, &f)
	}
	return files, nil
}
