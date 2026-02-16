import api from './client';

export interface JournalEntry {
    id: string;
    user_id: string;
    content: string;
    mood: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateJournalEntryRequest {
    content: string;
    mood: string;
    tags: string[];
}

export const journalApi = {
    list: async (): Promise<JournalEntry[]> => {
        const response = await api.get<JournalEntry[]>('/pm/journal');
        return response.data;
    },

    create: async (data: CreateJournalEntryRequest): Promise<JournalEntry> => {
        const response = await api.post<JournalEntry>('/pm/journal', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/journal/${id}`);
    },
};
