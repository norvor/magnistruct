package pm

import (
	"fmt"

	"github.com/go-chi/chi/v5"
	"github.com/norvor/magnistruct/backend/internal/modules/auth"
	"github.com/norvor/magnistruct/backend/internal/services"
)

func Init() {
	services.InitJournalTable()
	fmt.Println("✅ PM Module: Ready")
}

func SetupRoutes() func(chi.Router) {
	return func(r chi.Router) {
		r.Use(auth.Middleware)

		// 1. WORK ITEMS (Actions, Bugs, Stories, Epics)
		r.Route("/pm/work-items", func(r chi.Router) {
			r.Post("/", HandleCreateWorkItem)               
			r.Get("/", HandleListWorkItems)                 
			r.Get("/{id}", HandleGetWorkItem)               
			r.Put("/{id}", HandleUpdateWorkItem)            
			r.Delete("/{id}", HandleDeleteWorkItem)         
			r.Get("/{id}/subtasks", HandleGetSubtasks)      
		})

		// 2. RESOURCES
		r.Route("/pm/resources", func(r chi.Router) {
			r.Post("/", HandleCreateResource)               
			r.Get("/", HandleListResources)                 
			r.Get("/{id}", HandleGetResource)               
			r.Put("/{id}", HandleUpdateResource)            
			r.Delete("/{id}", HandleDeleteResource)         
		})

		// 3. JOURNEYS (Milestones)
		r.Route("/pm/journeys", func(r chi.Router) {
			r.Post("/", HandleCreateJourney)                
			r.Get("/", HandleListJourneys)                  
			r.Get("/{id}", HandleGetJourney)                
			r.Put("/{id}", HandleUpdateJourney)             
			r.Delete("/{id}", HandleDeleteJourney)          
		})

		// 4. ENVIRONMENTS
		r.Route("/pm/environments", func(r chi.Router) {
			r.Post("/", HandleCreateEnvironment)            
			r.Get("/", HandleListEnvironments)              
			r.Get("/{id}", HandleGetEnvironment)            
			r.Put("/{id}", HandleUpdateEnvironment)         
			r.Delete("/{id}", HandleDeleteEnvironment)      
		})

		// 5. GOALS
		r.Route("/pm/goals", func(r chi.Router) {
			r.Post("/", HandleCreateGoal)                   
			r.Get("/", HandleListGoals)                     
			r.Get("/{id}", HandleGetGoal)                   
			r.Put("/{id}", HandleUpdateGoal)                
			r.Delete("/{id}", HandleDeleteGoal)             
			r.Patch("/steps/{stepId}", HandleUpdateGoalStep)
		})

		// 6. SPECS
		r.Route("/pm/specs", func(r chi.Router) {
			r.Post("/", HandleCreateSpec)                   
			r.Get("/", HandleListSpecs)                     
			r.Get("/{id}", HandleGetSpec)                   
			r.Put("/{id}", HandleUpdateSpec)                
			r.Delete("/{id}", HandleDeleteSpec)             
		})

		// 7. HABITS
		r.Route("/pm/habits", func(r chi.Router) {
			r.Post("/", HandleCreateHabit)                  
			r.Get("/", HandleListHabits)                    
			r.Post("/{id}/toggle", HandleToggleHabit)       
			r.Delete("/{id}", HandleDeleteHabit)            
		})

		// 8. JOURNAL
		r.Route("/pm/journal", func(r chi.Router) {
			r.Post("/", HandleCreateJournalEntry)           
			r.Get("/", HandleListJournalEntries)            
			r.Delete("/{id}", HandleDeleteJournalEntry)     
		})
	}
}
