package services

import (
	"context"
	"fmt"
	"time"

	"github.com/norvor/magnistruct/backend/internal/database"
	"github.com/norvor/magnistruct/backend/internal/dto"
)

// CreateHabit creates a new habit
func CreateHabit(ctx context.Context, userID string, req dto.CreateHabitRequest) (*dto.HabitResponse, error) {
	var habitID string
	query := `
		INSERT INTO pm_habits (user_id, name, description, frequency)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	
	// Defaults
	frequency := "daily"
	if req.Frequency != "" {
		frequency = req.Frequency
	}

	err := database.DB.QueryRow(ctx, query, userID, req.Title, req.Description, frequency).Scan(&habitID)
	if err != nil {
		return nil, err
	}

	return GetHabit(ctx, habitID, userID)
}

// ListHabits returns all habits for a user with today's completion status
func ListHabits(ctx context.Context, userID string) ([]dto.HabitResponse, error) {
	today := time.Now().Format("2006-01-02")
	
	query := `
		SELECT h.id, h.user_id, h.name, h.description, h.frequency,
		       h.streak_count, h.last_completed_at, h.created_at, h.updated_at,
		       CASE WHEN l.id IS NOT NULL THEN true ELSE false END as is_completed_today
		FROM pm_habits h
		LEFT JOIN pm_habit_logs l ON h.id = l.habit_id AND l.completed_date = $1
		WHERE h.user_id = $2
		ORDER BY h.created_at ASC
	`

	rows, err := database.DB.Query(ctx, query, today, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	habits := []dto.HabitResponse{}
	for rows.Next() {
		var h dto.HabitResponse
		
		err := rows.Scan(
			&h.ID, &h.UserID, &h.Title, &h.Description, &h.Frequency,
			&h.CurrentStreak, &h.LastCompletedAt, &h.CreatedAt, &h.UpdatedAt,
			&h.IsCompletedToday,
		)
		if err != nil {
			return nil, err
		}
		habits = append(habits, h)
	}

	return habits, nil
}

// GetHabit returns a single habit
func GetHabit(ctx context.Context, habitID, userID string) (*dto.HabitResponse, error) {
	today := time.Now().Format("2006-01-02")
	
	query := `
		SELECT h.id, h.user_id, h.name, h.description, h.frequency,
		       h.streak_count, h.last_completed_at, h.created_at, h.updated_at,
		       CASE WHEN l.id IS NOT NULL THEN true ELSE false END as is_completed_today
		FROM pm_habits h
		LEFT JOIN pm_habit_logs l ON h.id = l.habit_id AND l.completed_date = $1
		WHERE h.id = $2 AND h.user_id = $3
	`

	var h dto.HabitResponse

	err := database.DB.QueryRow(ctx, query, today, habitID, userID).Scan(
		&h.ID, &h.UserID, &h.Title, &h.Description, &h.Frequency,
		&h.CurrentStreak, &h.LastCompletedAt, &h.CreatedAt, &h.UpdatedAt,
		&h.IsCompletedToday,
	)
	if err != nil {
		return nil, err
	}

	return &h, nil
}

// ToggleHabit allows marking a habit as complete/incomplete for a specific date
func ToggleHabit(ctx context.Context, habitID, userID string, date string) (*dto.HabitResponse, error) {
	// 1. Verify ownership
	var streakCount int
	err := database.DB.QueryRow(ctx, `SELECT streak_count FROM pm_habits WHERE id = $1 AND user_id = $2`, habitID, userID).Scan(&streakCount)
	if err != nil {
		return nil, fmt.Errorf("habit not found")
	}

	// 2. Check if already completed
	var logID string
	err = database.DB.QueryRow(ctx, `SELECT id FROM pm_habit_logs WHERE habit_id = $1 AND completed_date = $2`, habitID, date).Scan(&logID)
	
	isCompleted := err == nil
	
	if isCompleted {
		// UN-COMPLETE (Delete log)
		_, err = database.DB.Exec(ctx, `DELETE FROM pm_habit_logs WHERE id = $1`, logID)
		if err != nil {
			return nil, err
		}
		
		if streakCount > 0 {
			database.DB.Exec(ctx, `UPDATE pm_habits SET streak_count = streak_count - 1 WHERE id = $1`, habitID)
		}
	} else {
		// COMPLETE (Insert log)
		_, err = database.DB.Exec(ctx, `INSERT INTO pm_habit_logs (habit_id, user_id, completed_date) VALUES ($1, $2, $3)`, habitID, userID, date)
		if err != nil {
			return nil, err
		}

		// Increment Streak
		yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
		var yesterdayLog string
		err = database.DB.QueryRow(ctx, `SELECT id FROM pm_habit_logs WHERE habit_id = $1 AND completed_date = $2`, habitID, yesterday).Scan(&yesterdayLog)
		
		newStreak := 1
		if err == nil {
			newStreak = streakCount + 1
		}
		
		database.DB.Exec(ctx, `
			UPDATE pm_habits 
			SET streak_count = $1, last_completed_at = NOW(), updated_at = NOW() 
			WHERE id = $2`, 
			newStreak, habitID)
			

	}

	return GetHabit(ctx, habitID, userID)
}

// DeleteHabit deletes a habit
func DeleteHabit(ctx context.Context, habitID, userID string) error {
	_, err := database.DB.Exec(ctx, `DELETE FROM pm_habits WHERE id = $1 AND user_id = $2`, habitID, userID)
	return err
}
