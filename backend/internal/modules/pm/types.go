package pm

import "time"

// --- SHARED DATA STRUCTURES ---

type Subtask struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	IsComplete bool   `json:"is_complete"`
}

type ClassicData struct {
	ColumnID    string       `json:"column_id"`
	Position    float64      `json:"position"`
	Priority    string       `json:"priority"`
	DueDate     *time.Time   `json:"due_date,omitempty"`
	IsComplete  bool         `json:"is_complete"`
	EstHours    float64      `json:"estimated_hours"`
	LogHours    float64      `json:"logged_hours"`
	StoryPoints int          `json:"story_points"`
	Tags        string       `json:"tags"`
	Subtasks    []Subtask    `json:"subtasks"`
	Assignee    *UserSummary `json:"assignee,omitempty"`
}

type Task struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	EngineType  string       `json:"engine_type"`
	Classic     *ClassicData `json:"classic,omitempty"`
}

type Project struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	ActiveEngines []string `json:"active_engines"`
}

type BoardColumn struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Position float64 `json:"position"`
	Tasks    []Task  `json:"tasks"`
}

type BoardResponse struct {
	Project       Project       `json:"project"`
	Columns       []BoardColumn `json:"columns"`
	OrphanedTasks []Task        `json:"orphaned_tasks"`
}

type UserSummary struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
}
