import api from './client';

export type {
    WorkItem,
    CreateWorkItemRequest,
    UpdateWorkItemRequest,
    WorkItemFilters,
    Resource,
    CreateResourceRequest,
    UpdateResourceRequest,
    Journey,
    CreateJourneyRequest,
    UpdateJourneyRequest,
    Environment,
    CreateEnvironmentRequest,
    UpdateEnvironmentRequest,
    Goal,
    CreateGoalRequest,
    UpdateGoalRequest,
    UpdateGoalStepRequest,
    Spec,
    CreateSpecRequest,
    UpdateSpecRequest,
} from '../types/pm';

import type {
    WorkItem,
    CreateWorkItemRequest,
    UpdateWorkItemRequest,
    WorkItemFilters,
    Resource,
    CreateResourceRequest,
    UpdateResourceRequest,
    Journey,
    CreateJourneyRequest,
    UpdateJourneyRequest,
    Environment,
    CreateEnvironmentRequest,
    UpdateEnvironmentRequest,
    Goal,
    CreateGoalRequest,
    UpdateGoalRequest,
    UpdateGoalStepRequest,
    Spec,
    CreateSpecRequest,
    UpdateSpecRequest,
} from '../types/pm';

// ============================================================================
// WORK ITEMS API
// ============================================================================

export const workItemsApi = {
    list: async (filters?: WorkItemFilters): Promise<WorkItem[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id);
        if (filters?.journey_id) params.append('journey_id', filters.journey_id);
        if (filters?.goal_id) params.append('goal_id', filters.goal_id);
        if (filters?.parent_id) params.append('parent_id', filters.parent_id);

        const response = await api.get<WorkItem[]>(`/pm/work-items${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    },

    get: async (id: string): Promise<WorkItem> => {
        const response = await api.get<WorkItem>(`/pm/work-items/${id}`);
        return response.data;
    },

    create: async (data: CreateWorkItemRequest): Promise<WorkItem> => {
        const response = await api.post<WorkItem>('/pm/work-items', data);
        return response.data;
    },

    update: async (id: string, data: UpdateWorkItemRequest): Promise<WorkItem> => {
        const response = await api.put<WorkItem>(`/pm/work-items/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/work-items/${id}`);
    },

    getSubtasks: async (parentId: string): Promise<WorkItem[]> => {
        const response = await api.get<WorkItem[]>(`/pm/work-items/${parentId}/subtasks`);
        return response.data;
    },
};

// ============================================================================
// RESOURCES API
// ============================================================================

export const resourcesApi = {
    list: async (): Promise<Resource[]> => {
        const response = await api.get<Resource[]>('/pm/resources');
        return response.data;
    },

    get: async (id: string): Promise<Resource> => {
        const response = await api.get<Resource>(`/pm/resources/${id}`);
        return response.data;
    },

    create: async (data: CreateResourceRequest): Promise<Resource> => {
        const response = await api.post<Resource>('/pm/resources', data);
        return response.data;
    },

    update: async (id: string, data: UpdateResourceRequest): Promise<Resource> => {
        const response = await api.put<Resource>(`/pm/resources/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/resources/${id}`);
    },
};

// ============================================================================
// JOURNEYS API
// ============================================================================

export const journeysApi = {
    list: async (goalId?: string): Promise<Journey[]> => {
        const params = new URLSearchParams();
        if (goalId) params.append('goal_id', goalId);

        const response = await api.get<Journey[]>(`/pm/journeys${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    },

    get: async (id: string): Promise<Journey> => {
        const response = await api.get<Journey>(`/pm/journeys/${id}`);
        return response.data;
    },

    create: async (data: CreateJourneyRequest): Promise<Journey> => {
        const response = await api.post<Journey>('/pm/journeys', data);
        return response.data;
    },

    update: async (id: string, data: UpdateJourneyRequest): Promise<Journey> => {
        const response = await api.put<Journey>(`/pm/journeys/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/journeys/${id}`);
    },
};

// ============================================================================
// ENVIRONMENTS API
// ============================================================================

export const environmentsApi = {
    list: async (): Promise<Environment[]> => {
        const response = await api.get<Environment[]>('/pm/environments');
        return response.data;
    },

    get: async (id: string): Promise<Environment> => {
        const response = await api.get<Environment>(`/pm/environments/${id}`);
        return response.data;
    },

    create: async (data: CreateEnvironmentRequest): Promise<Environment> => {
        const response = await api.post<Environment>('/pm/environments', data);
        return response.data;
    },

    update: async (id: string, data: UpdateEnvironmentRequest): Promise<Environment> => {
        const response = await api.put<Environment>(`/pm/environments/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/environments/${id}`);
    },
};

// ============================================================================
// GOALS API
// ============================================================================

export const goalsApi = {
    list: async (): Promise<Goal[]> => {
        const response = await api.get<Goal[]>('/pm/goals');
        return response.data;
    },

    get: async (id: string): Promise<Goal> => {
        const response = await api.get<Goal>(`/pm/goals/${id}`);
        return response.data;
    },

    create: async (data: CreateGoalRequest): Promise<Goal> => {
        const response = await api.post<Goal>('/pm/goals', data);
        return response.data;
    },

    update: async (id: string, data: UpdateGoalRequest): Promise<Goal> => {
        const response = await api.put<Goal>(`/pm/goals/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/goals/${id}`);
    },
    updateStep: async (stepId: string, data: UpdateGoalStepRequest): Promise<void> => {
        await api.patch(`/pm/goals/steps/${stepId}`, data);
    },
};

// ============================================================================
// SPECS API
// ============================================================================

export const specsApi = {
    list: async (entityType?: string, entityId?: string): Promise<Spec[]> => {
        const params = new URLSearchParams();
        if (entityType) params.append('entity_type', entityType);
        if (entityId) params.append('entity_id', entityId);

        const response = await api.get<Spec[]>(`/pm/specs${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    },

    get: async (id: string): Promise<Spec> => {
        const response = await api.get<Spec>(`/pm/specs/${id}`);
        return response.data;
    },

    create: async (data: CreateSpecRequest): Promise<Spec> => {
        const response = await api.post<Spec>('/pm/specs', data);
        return response.data;
    },

    update: async (id: string, data: UpdateSpecRequest): Promise<Spec> => {
        const response = await api.put<Spec>(`/pm/specs/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/pm/specs/${id}`);
    },
};

// ============================================================================
// EXPORT ALL PM APIs AS A SINGLE OBJECT  
// ============================================================================

export const pmApi = {
    workItems: workItemsApi,
    resources: resourcesApi,
    journeys: journeysApi,
    environments: environmentsApi,
    goals: goalsApi,
    specs: specsApi,
};
