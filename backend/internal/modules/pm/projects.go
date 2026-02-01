package pm

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/database"
)

// ==========================================
// LIST & GET
// ==========================================

// HandleListProjects: Lists projects for the specific Organization
func HandleListProjects(w http.ResponseWriter, r *http.Request) {
	// We assume the frontend passes ?org_id=... or we get it from context
	// For now, let's look for a query param or fall back to user's active org
	ctx := r.Context()

	// 1. Determine Scope
	orgID := r.URL.Query().Get("org_id")
	if orgID == "" {
		// Fallback: Check user's current context
		userID := ctx.Value("user_id").(string)
		database.DB.QueryRow(ctx, "SELECT current_org_id FROM users WHERE id=$1", userID).Scan(&orgID)
	}

	if orgID == "" {
		http.Error(w, "Organization Context Missing", 400)
		return
	}

	// 2. Fetch "Steel" Metadata
	rows, err := database.DB.Query(ctx, `
        SELECT 
            id, org_id, team_id, name, description, 
            project_key, status, health, icon, 
            active_engines, start_date, due_date
        FROM projects 
        WHERE org_id = $1 
        ORDER BY updated_at DESC
    `, orgID)

	if err != nil {
		http.Error(w, "DB Error", 500)
		log.Println("❌ HandleListProjects DB Error:", err)
		return
	}
	defer rows.Close()

	var projects []Project
	for rows.Next() {
		var p Project
		// Nullable handling
		var teamID *string
		var start, due *time.Time
		var key, status, health, icon string

		err := rows.Scan(
			&p.ID, &p.OrgID, &teamID, &p.Name, &p.Description,
			&key, &status, &health, &icon,
			&p.ActiveEngines, &start, &due,
		)
		if err != nil {
			continue
		}

		p.TeamID = teamID
		p.ProjectKey = key
		p.Status = status
		p.Health = health
		p.Icon = icon
		p.StartDate = start
		p.DueDate = due

		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// HandleGetBoard: Loads the full board environment
func HandleGetBoard(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")
	ctx := r.Context()

	// 1. Fetch Project Core
	var p Project
	var rawSettings []byte
	err := database.DB.QueryRow(ctx, `
        SELECT id, name, description, project_key, status, icon, active_engines, engine_settings 
        FROM projects WHERE id = $1
    `, projectID).Scan(
		&p.ID, &p.Name, &p.Description, &p.ProjectKey, &p.Status, &p.Icon, &p.ActiveEngines, &rawSettings,
	)
	if err != nil {
		http.Error(w, "Project not found", 404)
		return
	}
	// Safe raw message handling
	if len(rawSettings) > 0 {
		p.EngineSettings = json.RawMessage(rawSettings)
	}

	// 2. Fetch Columns (For Classic/Agile)
	// FIX: Check error, do not ignore with _
	colRows, err := database.DB.Query(ctx, "SELECT id, name, position, is_system FROM boards_columns WHERE project_id=$1 ORDER BY position ASC", projectID)
	if err != nil {
		log.Println("Error fetching columns:", err)
		http.Error(w, "DB Error Columns", 500)
		return
	}

	var columns []BoardColumn
	for colRows.Next() {
		var c BoardColumn
		if err := colRows.Scan(&c.ID, &c.Name, &c.Position, &c.IsSystem); err == nil {
			columns = append(columns, c)
		}
	}
	colRows.Close() // <--- CRITICAL: Close immediately to free connection

	// 3. Fetch Tasks (Base Info Only - Lightweight)
	// FIX: Use explicit close and error checking
	taskRows, err := database.DB.Query(ctx, `
        SELECT 
            t.id, t.title, t.description, t.engine_type, t.tags,
            -- Classic Fields
            tc.column_id, tc.priority, tc.is_complete, tc.estimated_hours, tc.logged_hours,
            -- Agile Fields
            ta.sprint_id, ta.story_points, ta.type,
            -- Venture Fields
            tv.stage, tv.confidence_score, tv.risk_level,
            -- Stream Fields
            ts.lifecycle_stage, ts.is_stalled, ts.priority_score,
            -- Competition Fields
            tcomp.bounty_points, tcomp.status
        FROM tasks t
        LEFT JOIN tasks_classic tc ON t.id = tc.super_task_id
        LEFT JOIN tasks_agile ta ON t.id = ta.super_task_id
        LEFT JOIN tasks_venture tv ON t.id = tv.super_task_id
        LEFT JOIN tasks_stream ts ON t.id = ts.super_task_id
        LEFT JOIN tasks_competition tcomp ON t.id = tcomp.super_task_id
        WHERE t.project_id = $1
    `, projectID)

	if err != nil {
		log.Println("Error fetching tasks:", err)
		http.Error(w, "DB Error Tasks", 500)
		return
	}

	var tasks []Task
	for taskRows.Next() {
		var t Task
		t.ProjectID = projectID

		// Nullable Holders
		var cCol, cPrio *string
		var cComp *bool
		var cEst, cLog *float64
		var aSprint, aType *string
		var aPoints *int
		var vStage, vRisk *string
		var vConf *int
		var sStage *string
		var sStall *bool
		var sScore *float64
		var compPoints *int
		var compStatus *string

		err := taskRows.Scan(
			&t.ID, &t.Title, &t.Description, &t.EngineType, &t.Tags,
			&cCol, &cPrio, &cComp, &cEst, &cLog,
			&aSprint, &aPoints, &aType,
			&vStage, &vConf, &vRisk,
			&sStage, &sStall, &sScore,
			&compPoints, &compStatus,
		)
		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		// Hydrate Engine Slots if data exists
		if t.EngineType == "classic" && cCol != nil {
			t.Classic = &ClassicData{ColumnID: *cCol, Priority: *cPrio, IsComplete: *cComp}
			if cEst != nil {
				t.Classic.EstHours = *cEst
			}
			if cLog != nil {
				t.Classic.LogHours = *cLog
			}
		} else if t.EngineType == "agile" && aType != nil {
			t.Agile = &AgileData{SprintID: aSprint, Type: *aType, Points: *aPoints}
		} else if t.EngineType == "venture" && vStage != nil {
			t.Venture = &VentureData{Stage: *vStage, RiskLevel: *vRisk, ConfidenceScore: *vConf}
		} else if t.EngineType == "stream" && sStage != nil {
			t.Stream = &StreamData{LifecycleStage: *sStage, IsStalled: *sStall, PriorityScore: *sScore}
		} else if t.EngineType == "competition" && compStatus != nil {
			t.Competition = &CompetitionData{BountyPoints: *compPoints, Status: *compStatus}
		}

		tasks = append(tasks, t)
	}
	taskRows.Close() // <--- CRITICAL: Close immediately

	response := map[string]interface{}{
		"project": p,
		"columns": columns,
		"tasks":   tasks,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ==========================================
// WRITE HANDLERS
// ==========================================

func HandleCreateProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := ctx.Value("user_id").(string)

	var req struct {
		OrgID       string   `json:"org_id"`
		TeamID      string   `json:"team_id"`
		Name        string   `json:"name"`
		Description string   `json:"description"`
		ProjectKey  string   `json:"project_key"`
		Icon        string   `json:"icon"`
		Engines     []string `json:"engines"` // Which engines to enable
	}
	json.NewDecoder(r.Body).Decode(&req)

	// Defaults
	if req.Icon == "" {
		req.Icon = "🚀"
	}
	if req.ProjectKey == "" && len(req.Name) >= 3 {
		req.ProjectKey = strings.ToUpper(req.Name[:3])
	}
	if len(req.Engines) == 0 {
		req.Engines = []string{"classic"}
	}

	var p Project
	err := database.DB.QueryRow(ctx, `
        INSERT INTO projects (
            org_id, team_id, created_by, 
            name, description, project_key, icon, 
            active_engines
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, project_key, active_engines
    `, req.OrgID, req.TeamID, userID, req.Name, req.Description, req.ProjectKey, req.Icon, req.Engines).Scan(
		&p.ID, &p.Name, &p.ProjectKey, &p.ActiveEngines,
	)

	if err != nil {
		http.Error(w, "Creation failed: "+err.Error(), 500)
		log.Println("❌ CreateProject Error:", err)
		return
	}

	// Init Default Columns for Kanban
	if contains(p.ActiveEngines, "classic") || contains(p.ActiveEngines, "agile") {
		database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position, is_system) VALUES ($1, 'Backlog', 10000, true)", p.ID)
		database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position, is_system) VALUES ($1, 'In Progress', 20000, false)", p.ID)
		database.DB.Exec(ctx, "INSERT INTO boards_columns (project_id, name, position, is_system) VALUES ($1, 'Done', 30000, true)", p.ID)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

func HandleUpdateProject(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectID")

	// Flexible update struct
	var req struct {
		Name           *string          `json:"name"`
		Status         *string          `json:"status"`
		ActiveEngines  *[]string        `json:"active_engines"`
		EngineSettings *json.RawMessage `json:"engine_settings"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	tx, _ := database.DB.Begin(r.Context())

	if req.Name != nil {
		tx.Exec(r.Context(), "UPDATE projects SET name=$1 WHERE id=$2", *req.Name, projectID)
	}
	if req.Status != nil {
		tx.Exec(r.Context(), "UPDATE projects SET status=$1 WHERE id=$2", *req.Status, projectID)
	}
	if req.ActiveEngines != nil {
		tx.Exec(r.Context(), "UPDATE projects SET active_engines=$1 WHERE id=$2", *req.ActiveEngines, projectID)
	}
	if req.EngineSettings != nil {
		tx.Exec(r.Context(), "UPDATE projects SET engine_settings=$1 WHERE id=$2", *req.EngineSettings, projectID)
	}

	tx.Commit(r.Context())
	w.WriteHeader(http.StatusOK)
}

// Helper
func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
