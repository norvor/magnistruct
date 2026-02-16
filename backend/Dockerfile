FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# Run stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies (like ca-certificates for HTTPS)
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/main .
COPY --from=builder /app/migrations ./migrations
# Copy any other necessary assets, e.g., templates or config files if not embedded

EXPOSE 8080

CMD ["./main"]
