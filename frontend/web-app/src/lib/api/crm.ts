import api from './client';
import type {
    Opportunity,
    CreateOpportunityRequest,
    UpdateOpportunityRequest,
    Contact,
    CreateContactRequest,
    UpdateContactRequest,
    Timeline,
    CreateTimelineRequest,
    UpdateTimelineRequest,
    Channel,
    CreateChannelRequest,
    UpdateChannelRequest,
    PainPoint,
    CreatePainPointRequest,
    UpdatePainPointRequest,
    Collateral,
    CreateCollateralRequest,
    UpdateCollateralRequest,
} from '../types/crm';

// ============================================================================
// OPPORTUNITIES API
// ============================================================================

export const opportunitiesApi = {
    list: async (orgId: string): Promise<Opportunity[]> => {
        const response = await api.get<Opportunity[]>(`/crm/opportunities?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Opportunity> => {
        const response = await api.get<Opportunity>(`/crm/opportunities/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateOpportunityRequest): Promise<Opportunity> => {
        const response = await api.post<Opportunity>(`/crm/opportunities?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateOpportunityRequest): Promise<Opportunity> => {
        const response = await api.put<Opportunity>(`/crm/opportunities/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/opportunities/${id}`);
    },
};

// ============================================================================
// CONTACTS API
// ============================================================================

export const contactsApi = {
    list: async (orgId: string): Promise<Contact[]> => {
        const response = await api.get<Contact[]>(`/crm/contacts?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Contact> => {
        const response = await api.get<Contact>(`/crm/contacts/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateContactRequest): Promise<Contact> => {
        const response = await api.post<Contact>(`/crm/contacts?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
        const response = await api.put<Contact>(`/crm/contacts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/contacts/${id}`);
    },
};

// ============================================================================
// TIMELINES API
// ============================================================================

export const timelinesApi = {
    list: async (orgId: string): Promise<Timeline[]> => {
        const response = await api.get<Timeline[]>(`/crm/timelines?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Timeline> => {
        const response = await api.get<Timeline>(`/crm/timelines/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateTimelineRequest): Promise<Timeline> => {
        const response = await api.post<Timeline>(`/crm/timelines?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateTimelineRequest): Promise<Timeline> => {
        const response = await api.put<Timeline>(`/crm/timelines/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/timelines/${id}`);
    },
};

// ============================================================================
// CHANNELS API
// ============================================================================

export const channelsApi = {
    list: async (orgId: string): Promise<Channel[]> => {
        const response = await api.get<Channel[]>(`/crm/channels?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Channel> => {
        const response = await api.get<Channel>(`/crm/channels/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateChannelRequest): Promise<Channel> => {
        const response = await api.post<Channel>(`/crm/channels?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateChannelRequest): Promise<Channel> => {
        const response = await api.put<Channel>(`/crm/channels/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/channels/${id}`);
    },
};

// ============================================================================
// PAIN POINTS API
// ============================================================================

export const painPointsApi = {
    list: async (orgId: string): Promise<PainPoint[]> => {
        const response = await api.get<PainPoint[]>(`/crm/pain-points?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<PainPoint> => {
        const response = await api.get<PainPoint>(`/crm/pain-points/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreatePainPointRequest): Promise<PainPoint> => {
        const response = await api.post<PainPoint>(`/crm/pain-points?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdatePainPointRequest): Promise<PainPoint> => {
        const response = await api.put<PainPoint>(`/crm/pain-points/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/pain-points/${id}`);
    },
};

// ============================================================================
// COLLATERAL API
// ============================================================================

export const collateralApi = {
    list: async (orgId: string): Promise<Collateral[]> => {
        const response = await api.get<Collateral[]>(`/crm/collateral?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Collateral> => {
        const response = await api.get<Collateral>(`/crm/collateral/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateCollateralRequest): Promise<Collateral> => {
        const response = await api.post<Collateral>(`/crm/collateral?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateCollateralRequest): Promise<Collateral> => {
        const response = await api.put<Collateral>(`/crm/collateral/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/crm/collateral/${id}`);
    },
};

export const crmApi = {
    opportunities: opportunitiesApi,
    contacts: contactsApi,
    timelines: timelinesApi,
    channels: channelsApi,
    painPoints: painPointsApi,
    collateral: collateralApi,
};
