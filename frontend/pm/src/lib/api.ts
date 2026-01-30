import { writable } from 'svelte/store';

// --- CONFIGURATION ---
const API_BASE = 'http://localhost:8080/api'; // Local Dev

// ==========================================
// 1. CORE TYPES (Identity & Structure)
// ==========================================

export interface UserSummary {
    id: string;
    full_name: string;
    avatar?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    created_at: string;
    active_engines: string[]; // ['classic', 'venture', 'stream', etc.]
}

export interface BoardColumn {
    id: string;
    name: string;
    position: number;
    tasks: Task[]; 
}

export interface BoardData {
    project: Project;
    columns: BoardColumn[];
    orphaned_tasks: Task[]; // Tasks belonging to engines without columns
}

// ==========================================
// 2. ENGINE DATA INTERFACES (Read Mode)
// ==========================================

export interface Subtask {
    id: string;
    title: string;
    is_complete: boolean;
}

// 1. CLASSIC (Kanban)
export interface ClassicTaskData {
    short_id: number;
    column_id: string;
    priority: 'p1' | 'p2' | 'p3' | 'p4';
    due_date?: string;
    position: number;
    is_complete: boolean;
    assignee?: UserSummary;
    
    // Extended Metadata
    start_date?: string;
    estimated_hours?: number;
    logged_hours?: number;
    story_points?: number;
    tags?: string;
    subtasks?: Subtask[];
}

// 2. VENTURE (Radar/Risk)
export interface VentureTaskData {
    stage: 'discovery' | 'validation' | 'efficiency' | 'scale';
    confidence_score: number; // 0-100
    resource_allocation: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

// 3. STREAM (DevOps/Flow)
export interface StreamTaskData {
    lifecycle_stage: string;
    is_stalled: boolean;
    stall_reason?: string;
    priority_score: number;
}

// 4. STRUCTURE (Tree)
export interface StructureTaskData {
    node_type: 'trunk' | 'branch' | 'leaf';
    weight: number;
    inherited_health: string;
}

// 5. HIVE (Swarm)
export interface HiveTaskData {
    swarm_role: 'queen' | 'drone' | 'scout';
    heat_level: number;
}

// 6. SEED (Incubator)
export interface SeedTaskData {
    growth_stage: number;
    is_sprouted: boolean;
    water_level: number;
}

// 7. SHELL (Security)
export interface ShellTaskData {
    integrity: number;
    is_hardened: boolean;
}

// 8. WAVE (Launch)
export interface WaveTaskData {
    phase: string;
    amplitude: number;
}

// 9. NEST (Staging)
export interface NestTaskData {
    materials_gathered: number;
    is_occupied: boolean;
}

// 10. COCOON (Pivot)
export interface CocoonTaskData {
    dissolve_progress: number;
    emergence_ready: boolean;
}

// ==========================================
// 3. THE SUPER TASK (Polymorphic Container)
// ==========================================
export interface Task {
    id: string;
    project_id: string;
    engine_type: string; // 'classic', 'venture', etc.
    title: string;
    description: string;
    created_at: string;
    updated_at: string;

    // Optional Engine Slots
    classic?: ClassicTaskData;
    venture?: VentureTaskData;
    stream?: StreamTaskData;
    structure?: StructureTaskData;
    hive?: HiveTaskData;
    seed?: SeedTaskData;
    shell?: ShellTaskData;
    wave?: WaveTaskData;
    nest?: NestTaskData;
    cocoon?: CocoonTaskData;
}

// ==========================================
// 4. WRITE INTERFACES (Payloads)
// ==========================================

export interface CreateTaskPayload {
    title: string;
    description?: string;
    engine_type: string;
    
    // Classic specific
    column_id?: string;
}

// A generic map allows flexible updates across all engines
export interface UpdateTaskPayload {
    [key: string]: any; 
}

// ==========================================
// 5. API CLIENT (The "Axios Killer")
// ==========================================

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
    };

    // SAFETY CHECK: Auto-stringify body if it's a plain object
    // This prevents [object Object] errors and double-encoding
    if (options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)) {
        options.body = JSON.stringify(options.body);
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include' // Important for auth cookies
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
        // Handle 401 (Auth)
        if (res.status === 401) {
            if (typeof window !== 'undefined' && 
                !window.location.pathname.startsWith('/login') && 
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }
        
        // Handle other errors
        const text = await res.text();
        throw new Error(text || `API Error: ${res.status}`);
    }

    if (res.status === 204) return {} as T;
    
    // Safety check for empty responses
    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
}

export const api = {
    auth: {
        register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: data }),
        login: (data: any) => fetchAPI('/auth/login', { method: 'POST', body: data }),
        logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
        me: () => fetchAPI<UserSummary>('/auth/me')
    },
    projects: {
        list: () => fetchAPI<Project[]>('/projects'),
        create: (data: { name: string, description: string }) => fetchAPI<Project>('/projects', { method: 'POST', body: data }),
        getBoard: (id: string) => fetchAPI<BoardData>(`/projects/${id}/board`),
        createColumn: (projectId: string, name: string) => fetchAPI<BoardColumn>(`/projects/${projectId}/columns`, { method: 'POST', body: { name } }),
        
        // Engine Toggling
        toggleEngine: (projectId: string, engineType: string, isActive: boolean) => 
            fetchAPI(`/projects/${projectId}/engines`, { 
                method: 'PUT', 
                body: { engine_type: engineType, is_active: isActive } 
            })
    },
    tasks: {
        // Create (Polymorphic) - Now uses ProjectID in URL
        create: (projectId: string, data: CreateTaskPayload) => 
            fetchAPI<Task>(`/projects/${projectId}/tasks`, { 
                method: 'POST', 
                body: data 
            }),
        
        // Update (Polymorphic)
        update: (taskId: string, data: UpdateTaskPayload) => 
            fetchAPI<Task>(`/tasks/${taskId}`, { method: 'PUT', body: data }),
        
        // Move (Classic DnD)
        move: (taskId: string, newColumnId: string, newPosition: number) => 
            fetchAPI(`/tasks/${taskId}/move`, { 
                method: 'PUT', 
                body: { 
                    new_column_id: newColumnId, 
                    new_position: Number(newPosition) 
                } 
            }),
        
        delete: (taskId: string) => fetchAPI(`/tasks/${taskId}`, { method: 'DELETE' }),
        
        // --- SUBTASKS ---
        createSubtask: (taskId: string, title: string) => 
            fetchAPI<Subtask>(`/tasks/${taskId}/subtasks`, { method: 'POST', body: { title } }),
        
        toggleSubtask: (subtaskId: string) => 
            fetchAPI(`/subtasks/${subtaskId}/toggle`, { method: 'PUT' }),
            
        deleteSubtask: (subtaskId: string) => 
            fetchAPI(`/subtasks/${subtaskId}`, { method: 'DELETE' }),

        // --- COMMENTS ---
        getComments: (taskId: string) => fetchAPI<any[]>(`/tasks/${taskId}/comments`),
        postComment: (taskId: string, content: string, userId: string) => 
            fetchAPI(`/tasks/${taskId}/comments`, { method: 'POST', body: { content, user_id: userId } }),
    }
};