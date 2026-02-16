import axios from 'axios';
import {
    Love, CreateLoveRequest,
    Purpose, CreatePurposeRequest,
    Pin, CreatePinRequest
} from '@/lib/types/life';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const lifeApi = {
    // LOVES (The Whos)
    getLoves: async (): Promise<Love[]> => {
        const response = await api.get('/life/loves');
        return response.data;
    },
    createLove: async (data: CreateLoveRequest): Promise<Love> => {
        const response = await api.post('/life/loves', data);
        return response.data;
    },
    updateLove: async (id: string, data: Partial<CreateLoveRequest>): Promise<Love> => {
        const response = await api.put(`/life/loves/${id}`, data);
        return response.data;
    },
    deleteLove: async (id: string): Promise<void> => {
        await api.delete(`/life/loves/${id}`);
    },

    // PURPOSES (The Whys)
    getPurposes: async (): Promise<Purpose[]> => {
        const response = await api.get('/life/purposes');
        return response.data;
    },
    createPurpose: async (data: CreatePurposeRequest): Promise<Purpose> => {
        const response = await api.post('/life/purposes', data);
        return response.data;
    },
    updatePurpose: async (id: string, data: Partial<CreatePurposeRequest>): Promise<Purpose> => {
        const response = await api.put(`/life/purposes/${id}`, data);
        return response.data;
    },
    deletePurpose: async (id: string): Promise<void> => {
        await api.delete(`/life/purposes/${id}`);
    },

    // PINS (The Wheres)
    getPins: async (): Promise<Pin[]> => {
        const response = await api.get('/life/pins');
        return response.data;
    },
    createPin: async (data: CreatePinRequest): Promise<Pin> => {
        const response = await api.post('/life/pins', data);
        return response.data;
    },
    updatePin: async (id: string, data: Partial<CreatePinRequest>): Promise<Pin> => {
        const response = await api.put(`/life/pins/${id}`, data);
        return response.data;
    },
    deletePin: async (id: string): Promise<void> => {
        await api.delete(`/life/pins/${id}`);
    },
};
