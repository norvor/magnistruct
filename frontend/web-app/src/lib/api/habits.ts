import api from './client';

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly';
    color: string;
    current_streak: number;
    max_streak: number;
    is_completed_today: boolean;
    last_completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateHabitRequest {
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly';
    color?: string;
}

export const habitsApi = {
    list: async (): Promise<Habit[]> => {
        const response = await api.get<Habit[]>('/pm/habits');
        return response.data;
    },

    create: async (data: CreateHabitRequest): Promise<Habit> => {
        const response = await api.post<Habit>('/pm/habits', data);
        return response.data;
    },

    toggle: async (id: string, date?: string): Promise<Habit> => {
        const response = await api.post<Habit>(`/pm/habits/${id}/toggle`, { date });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/habits/${id}`);
    },
};
