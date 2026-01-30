package pm

import "time"

// UserSummary: A lightweight representation of a user (for assignees/commenters)
type UserSummary struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	Avatar   string `json:"avatar,omitempty"` // Optional URL or data
}

// Task: The core unit of work
type Task struct {
	ID          string       `json:"id"`
	ShortID     int          `json:"short_id"` // The friendly ID (e.g. 102)
	ColumnID    string       `json:"column_id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Priority    string       `json:"priority"` // p1, p2, p3, p4
	DueDate     *time.Time   `json:"due_date"` // Nullable
	Position    float64      `json:"position"` // Float allows infinite reordering
	IsComplete  bool         `json:"is_complete"`
	Assignee    *UserSummary `json:"assignee"` // Nullable nested object
}

// Note: BoardColumn and Project are defined in board.go,
// and Comment is defined in comments.go, which is fine for now
// as long as they are in the same 'package pm'.
