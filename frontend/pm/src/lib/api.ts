const BASE_URL = 'http://localhost:8080';

// --- TYPES ---
export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar: string;
    job_title: string;
    theme: 'dark' | 'light' | 'system';
}

export interface Project {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

export interface BoardData {
    project: Project;
    columns: any[]; // Simplified for brevity
}

// --- REQUEST ENGINE ---
async function request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T | null> {
    const config: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CRITICAL: Sends Cookies
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, config);

        // CASE 1: Auth Check (Silent Fail)
        // If checking "Who am I?" and we get 401, just return null. Don't crash.
        if (res.status === 401 && endpoint.includes('/auth/me')) {
            return null;
        }

        // CASE 2: Actual Unauthorized Access (Loud Fail)
        // If trying to fetch data while logged out, throw error.
        if (res.status === 401) {
            throw new Error('UNAUTHORIZED');
        }

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `API Error ${res.status}`);
        }

        if (res.status === 204) return null;

        return await res.json();
    } catch (err) {
        console.error(`API Fail: ${method} ${endpoint}`, err);
        throw err;
    }
}

// --- EXPORTS ---
export const api = {
    auth: {
        login: (email, password) => request('/auth/login', 'POST', { email, password }),
        register: (email, password, full_name) => request('/auth/register', 'POST', { email, password, full_name }),
        logout: () => request('/auth/logout', 'POST'),
        me: () => request<User>('/auth/me'),
        updateProfile: (data) => request('/auth/profile', 'PUT', data)
    },
    projects: {
        list: () => request<Project[]>('/pm/projects'),
        create: (name, description) => request<Project>('/pm/projects', 'POST', { name, description }),
        getBoard: (id) => request<BoardData>(`/pm/projects/${id}/board`),
    }
};