import api from './client';
import type {
    Activity,
    CreateActivityRequest,
    UpdateActivityRequest,
    Employee,
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    Period,
    CreatePeriodRequest,
    UpdatePeriodRequest,
    Location,
    CreateLocationRequest,
    UpdateLocationRequest,
    Driver,
    CreateDriverRequest,
    UpdateDriverRequest,
    Policy,
    CreatePolicyRequest,
    UpdatePolicyRequest,
} from '../types/hr';

// ============================================================================
// ACTIVITIES API
// ============================================================================

export const activitiesApi = {
    list: async (orgId: string): Promise<Activity[]> => {
        const response = await api.get<Activity[]>(`/hr/activities?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Activity> => {
        const response = await api.get<Activity>(`/hr/activities/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateActivityRequest): Promise<Activity> => {
        const response = await api.post<Activity>(`/hr/activities?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateActivityRequest): Promise<Activity> => {
        const response = await api.put<Activity>(`/hr/activities/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/activities/${id}`);
    },
};

// ============================================================================
// EMPLOYEES API
// ============================================================================

export const employeesApi = {
    list: async (orgId: string): Promise<Employee[]> => {
        const response = await api.get<Employee[]>(`/hr/employees?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Employee> => {
        const response = await api.get<Employee>(`/hr/employees/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateEmployeeRequest): Promise<Employee> => {
        const response = await api.post<Employee>(`/hr/employees?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
        const response = await api.put<Employee>(`/hr/employees/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/employees/${id}`);
    },
};

// ============================================================================
// PERIODS API
// ============================================================================

export const periodsApi = {
    list: async (orgId: string): Promise<Period[]> => {
        const response = await api.get<Period[]>(`/hr/periods?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Period> => {
        const response = await api.get<Period>(`/hr/periods/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreatePeriodRequest): Promise<Period> => {
        const response = await api.post<Period>(`/hr/periods?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdatePeriodRequest): Promise<Period> => {
        const response = await api.put<Period>(`/hr/periods/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/periods/${id}`);
    },
};

// ============================================================================
// LOCATIONS API
// ============================================================================

export const locationsApi = {
    list: async (orgId: string): Promise<Location[]> => {
        const response = await api.get<Location[]>(`/hr/locations?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Location> => {
        const response = await api.get<Location>(`/hr/locations/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateLocationRequest): Promise<Location> => {
        const response = await api.post<Location>(`/hr/locations?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateLocationRequest): Promise<Location> => {
        const response = await api.put<Location>(`/hr/locations/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/locations/${id}`);
    },
};

// ============================================================================
// DRIVERS API
// ============================================================================

export const driversApi = {
    list: async (orgId: string): Promise<Driver[]> => {
        const response = await api.get<Driver[]>(`/hr/drivers?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Driver> => {
        const response = await api.get<Driver>(`/hr/drivers/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreateDriverRequest): Promise<Driver> => {
        const response = await api.post<Driver>(`/hr/drivers?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateDriverRequest): Promise<Driver> => {
        const response = await api.put<Driver>(`/hr/drivers/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/drivers/${id}`);
    },
};

// ============================================================================
// POLICIES API
// ============================================================================

export const policiesApi = {
    list: async (orgId: string): Promise<Policy[]> => {
        const response = await api.get<Policy[]>(`/hr/policies?org_id=${orgId}`);
        return response.data;
    },

    get: async (id: string): Promise<Policy> => {
        const response = await api.get<Policy>(`/hr/policies/${id}`);
        return response.data;
    },

    create: async (orgId: string, data: CreatePolicyRequest): Promise<Policy> => {
        const response = await api.post<Policy>(`/hr/policies?org_id=${orgId}`, data);
        return response.data;
    },

    update: async (id: string, data: UpdatePolicyRequest): Promise<Policy> => {
        const response = await api.put<Policy>(`/hr/policies/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/hr/policies/${id}`);
    },
};

export const hrApi = {
    activities: activitiesApi,
    employees: employeesApi,
    periods: periodsApi,
    locations: locationsApi,
    drivers: driversApi,
    policies: policiesApi,
};
