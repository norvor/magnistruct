// PM Module TypeScript Types
// Matching backend DTOs from internal/dto/pm.go

export interface WorkItem {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    type: 'action' | 'bug' | 'story' | 'epic';
    priority: 'low' | 'medium' | 'high' | 'critical';
    parent_id?: string;
    assignee_id?: string;
    journey_id?: string;
    goal_id?: string;
    story_points?: number;
    due_date?: string;
    created_at: string;
    updated_at: string;
    // Populated via joins
    assignee_name?: string;
    journey_name?: string;
    goal_name?: string;
    parent_title?: string;
    subtask_count: number;
}

export type Action = WorkItem;

export interface CreateWorkItemRequest {
    title: string;
    description?: string;
    status?: string;
    type?: string;
    priority?: string;
    parent_id?: string;
    assignee_id?: string;
    journey_id?: string;
    goal_id?: string;
    story_points?: number;
    due_date?: string;
}

export interface UpdateWorkItemRequest {
    title?: string;
    description?: string;
    status?: string;
    type?: string;
    priority?: string;
    parent_id?: string;
    assignee_id?: string;
    journey_id?: string;
    goal_id?: string;
    story_points?: number;
    due_date?: string;
}

export interface WorkItemFilters {
    status?: string;
    type?: string;
    priority?: string;
    assignee_id?: string;
    journey_id?: string;
    goal_id?: string;
    parent_id?: string;
}

export interface Resource {
    id: string;
    user_id?: string;
    hourly_rate?: number;
    role: string;
    skills: string[];
    capacity_hours_per_week: number;
    created_at: string;
    updated_at: string;
    // Populated via joins
    user_email?: string;
    user_full_name?: string;
}

export interface CreateResourceRequest {
    user_id?: string;
    hourly_rate?: number;
    role: string;
    skills: string[];
    capacity_hours_per_week?: number;
}

export interface UpdateResourceRequest {
    user_id?: string;
    hourly_rate?: number;
    role?: string;
    skills?: string[];
    capacity_hours_per_week?: number;
}

export interface JourneyStats {
    todo_count: number;
    in_progress_count: number;
    review_count: number;
    done_count: number;
    total_count: number;
}

export interface Journey {
    id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
    status: 'planned' | 'active' | 'completed' | 'archived';
    goal_id?: string;
    engine_spec_id?: string;
    created_at: string;
    updated_at: string;
    work_item_count: number;
    stats?: JourneyStats;
    compartments?: Goal[];
    engine?: Spec;
    // Populated
    goal_name?: string;
}

export interface CreateJourneyRequest {
    name: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
    status?: string;
    goal_id?: string;
    compartments?: string[];
}

export interface UpdateJourneyRequest {
    name?: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
    status?: string;
    goal_id?: string;
    compartments?: string[];
}

export interface Environment {
    id: string;
    name: string;
    url?: string;
    type: 'git_repo' | 'kubernetes_cluster' | 'figma_file' | 'custom';
    provider?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface CreateEnvironmentRequest {
    name: string;
    url?: string;
    type: string;
    provider?: string;
    metadata?: Record<string, any>;
}

export interface UpdateEnvironmentRequest {
    name?: string;
    url?: string;
    type?: string;
    provider?: string;
    metadata?: Record<string, any>;
}

export interface GoalStats {
    todo_count: number;
    in_progress_count: number;
    review_count: number;
    done_count: number;
    total_count: number;
}

export interface GoalStep {
    id: string;
    title: string;
    is_done: boolean;
    position: number;
    created_at: string;
}

export interface Goal {
    id: string;
    name: string;
    description?: string;
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
    start_date?: string;
    target_end_date?: string;
    lead_id?: string;
    cover_image?: string;
    category?: string;
    created_at: string;
    updated_at: string;
    stats?: GoalStats;
    // Populated
    lead_name?: string;
    purpose_id?: string;
    journey_id?: string;
    steps?: GoalStep[];
    work_items?: WorkItem[];
}

export interface CreateGoalRequest {
    name: string;
    description?: string;
    status?: string;
    start_date?: string;
    target_end_date?: string;
    lead_id?: string;
    cover_image?: string;
    category?: string;
    purpose_id?: string;
    steps?: string[];
}

export interface UpdateGoalRequest {
    name?: string;
    description?: string;
    status?: string;
    start_date?: string;
    target_end_date?: string;
    lead_id?: string;
    cover_image?: string;
    category?: string;
    purpose_id?: string;
}

export interface UpdateGoalStepRequest {
    is_done?: boolean;
}

export interface Spec {
    id: string;
    entity_type?: string;
    entity_id?: string;
    title: string;
    content: string;
    type: 'prd' | 'technical_spec' | 'design_doc' | 'api_doc';
    version: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSpecRequest {
    entity_type: string;
    entity_id: string;
    title: string;
    content: string;
    type: string;
    version?: string;
}

export interface UpdateSpecRequest {
    title?: string;
    content?: string;
    type?: string;
    version?: string;
}
