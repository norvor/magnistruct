package dto

// AuthRequest DTOs
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	FullName string `json:"full_name" validate:"required"`
}

// AuthResponse DTOs
type UserResponse struct {
	ID             string   `json:"id"`
	Email          string   `json:"email"`
	FullName       string   `json:"full_name"`
	EnabledModules []string `json:"enabled_modules,omitempty"`
}

type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token,omitempty"`
}
