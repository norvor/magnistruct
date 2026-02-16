import api from './client';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        full_name: string;
        enabled_modules?: string[];
    };
    token?: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<AuthResponse['user']> => {
        const response = await api.get<{ user: AuthResponse['user'] }>('/auth/me');
        return response.data.user;
    },
};
