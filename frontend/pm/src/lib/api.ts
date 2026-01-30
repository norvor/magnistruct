import { writable } from 'svelte/store';

const API_BASE = 'http://localhost:8080/api';

// --- TYPES (Linear-Grade) ---

export interface User {
    id: string;
    email: string;
    full_name: string;
    job_title?: string;
    theme?: 'aurora' | 'cloudy';
}

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
}

export interface Task {
    id: string;
    short_id: number;
    column_id: string;
    title: string;
    description: string;
    priority: 'p1' | 'p2' | 'p3' | 'p4';
    due_date?: string;
    position: number;
    is_complete: boolean;
    assignee?: UserSummary;
}

export interface Column {
    id: string;
    name: string;
    position: number;
    tasks: Task[];
}

export interface BoardData {
    project: Project;
    columns: Column[];
}

export interface Comment {
    id: string;
    task_id: string;
    content: string;
    created_at: string;
    user: UserSummary;
}

// --- API CLIENT ---

// frontend/pm/src/lib/api.ts

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include'
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
        if (res.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }
        throw new Error(await res.text() || 'API Error');
    }

    // --- FIX STARTS HERE ---
    
    // 1. Handle explicit "No Content"
    if (res.status === 204) return {} as T;

    // 2. Safely handle "Empty 200 OK" (The fix for your Delete bug)
    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
    
    // --- FIX ENDS HERE ---
}

export const api = {
    auth: {
        login: (creds: any) => fetchAPI<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
        register: (data: any) => fetchAPI<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        me: () => fetchAPI<User>('/auth/me'),
        logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
        updateProfile: (data: Partial<User>) => fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    },
    projects: {
        list: () => fetchAPI<Project[]>('/projects'),
        create: (data: { name: string, description: string }) => fetchAPI<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
        getBoard: (id: string) => fetchAPI<BoardData>(`/projects/${id}/board`),
        createColumn: (projectId: string, name: string) => fetchAPI<{ id: string, name: string }>(`/projects/${projectId}/columns`, { method: 'POST', body: JSON.stringify({ name }) }),
    },
    tasks: {
        create: (projectId: string, data: { column_id: string, title: string, assignee_id?: string }) => 
            fetchAPI<Task>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
        
        update: (taskId: string, data: Partial<Task> & { assignee_id?: string }) => 
            fetchAPI(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) }),
            
        move: (taskId: string, data: { new_column_id: string, new_position: number }) => 
            fetchAPI(`/tasks/${taskId}/move`, { method: 'PUT', body: JSON.stringify(data) }),
            
        toggle: (taskId: string) => fetchAPI(`/tasks/${taskId}/toggle`, { method: 'PUT' }),
        delete: (taskId: string) => fetchAPI(`/tasks/${taskId}`, { method: 'DELETE' }),

        // Comments
        getComments: (taskId: string) => fetchAPI<Comment[]>(`/tasks/${taskId}/comments`),
        postComment: (taskId: string, data: { content: string, user_id: string }) => 
            fetchAPI<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify(data) })
    }
};