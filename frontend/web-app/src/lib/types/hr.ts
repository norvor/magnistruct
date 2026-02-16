// HR Module TypeScript Types
// Matching backend DTOs from internal/dto/hr.go

export interface Activity {
    id: string;
    title: string;
    assignee_id?: string;
    status: 'pending' | 'in_progress' | 'completed';
    due_date?: string;
    type: 'review' | 'onboarding_task' | 'training';
    created_at: string;
    updated_at: string;
    // Populated via joins
    assignee_name?: string;
}

export interface CreateActivityRequest {
    title: string;
    assignee_id?: string;
    status?: string;
    due_date?: string;
    type?: string;
}

export interface UpdateActivityRequest {
    title?: string;
    assignee_id?: string;
    status?: string;
    due_date?: string;
    type?: string;
}

export interface Employee {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    job_title: string;
    employment_type: 'full_time' | 'contractor' | 'part_time';
    salary?: number;
    start_date?: string;
    reports_to_id?: string;
    created_at: string;
    updated_at: string;
    // Populated via joins
    user_email?: string;
    manager_name?: string;
    direct_report_count: number;
}

export interface CreateEmployeeRequest {
    user_id?: string;
    first_name: string;
    last_name: string;
    job_title?: string;
    employment_type?: string;
    salary?: number;
    start_date?: string;
    reports_to_id?: string;
}

export interface UpdateEmployeeRequest {
    user_id?: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    employment_type?: string;
    salary?: number;
    start_date?: string;
    reports_to_id?: string;
}

export interface Period {
    id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    status: 'draft' | 'processing' | 'paid';
    created_at: string;
}

export interface CreatePeriodRequest {
    name: string;
    start_date?: string;
    end_date?: string;
    status?: string;
}

export interface UpdatePeriodRequest {
    name?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
}

export interface Location {
    id: string;
    name: string;
    address: string;
    capacity: number;
    type: 'physical' | 'remote' | 'desk';
    created_at: string;
}

export interface CreateLocationRequest {
    name: string;
    address?: string;
    capacity?: number;
    type?: string;
}

export interface UpdateLocationRequest {
    name?: string;
    address?: string;
    capacity?: number;
    type?: string;
}

export interface Driver {
    id: string;
    title: string;
    category: 'culture' | 'compliance' | 'growth';
    status: 'active' | 'completed' | 'paused';
    created_at: string;
    updated_at: string;
}

export interface CreateDriverRequest {
    title: string;
    category?: string;
    status?: string;
}

export interface UpdateDriverRequest {
    title?: string;
    category?: string;
    status?: string;
}

export interface Policy {
    id: string;
    title: string;
    content: string; // Markdown
    version: string;
    is_mandatory: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePolicyRequest {
    title: string;
    content?: string;
    version?: string;
    is_mandatory?: boolean;
}

export interface UpdatePolicyRequest {
    title?: string;
    content?: string;
    version?: string;
    is_mandatory?: boolean;
}
