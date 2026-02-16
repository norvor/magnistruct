import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api/hr';
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
import { toast } from 'sonner';

// ============================================================================
// ACTIVITIES HOOKS
// ============================================================================

export function useActivities(orgId: string) {
    return useQuery({
        queryKey: ['activities', orgId],
        queryFn: () => hrApi.activities.list(orgId),
        enabled: !!orgId,
    });
}

export function useActivity(id: string) {
    return useQuery({
        queryKey: ['activity', id],
        queryFn: () => hrApi.activities.get(id),
        enabled: !!id,
    });
}

export function useCreateActivity(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateActivityRequest) => hrApi.activities.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', orgId] });
            toast.success('Activity created!');
        },
        onError: () => toast.error('Failed to create activity'),
    });
}

export function useUpdateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
            hrApi.activities.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['activity', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Activity updated!');
        },
        onError: () => toast.error('Failed to update activity'),
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.activities.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Activity deleted!');
        },
        onError: () => toast.error('Failed to delete activity'),
    });
}

// ============================================================================
// EMPLOYEES HOOKS
// ============================================================================

export function useEmployees(orgId: string) {
    return useQuery({
        queryKey: ['employees', orgId],
        queryFn: () => hrApi.employees.list(orgId),
        enabled: !!orgId,
    });
}

export function useEmployee(id: string) {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: () => hrApi.employees.get(id),
        enabled: !!id,
    });
}

export function useCreateEmployee(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEmployeeRequest) => hrApi.employees.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees', orgId] });
            toast.success('Employee created!');
        },
        onError: () => toast.error('Failed to create employee'),
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
            hrApi.employees.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee updated!');
        },
        onError: () => toast.error('Failed to update employee'),
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.employees.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee deleted!');
        },
        onError: () => toast.error('Failed to delete employee'),
    });
}

// ============================================================================
// PERIODS HOOKS
// ============================================================================

export function usePeriods(orgId: string) {
    return useQuery({
        queryKey: ['periods', orgId],
        queryFn: () => hrApi.periods.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreatePeriod(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePeriodRequest) => hrApi.periods.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['periods', orgId] });
            toast.success('Period created!');
        },
        onError: () => toast.error('Failed to create period'),
    });
}

export function useUpdatePeriod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePeriodRequest }) =>
            hrApi.periods.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['periods'] });
            toast.success('Period updated!');
        },
        onError: () => toast.error('Failed to update period'),
    });
}

export function useDeletePeriod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.periods.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['periods'] });
            toast.success('Period deleted!');
        },
        onError: () => toast.error('Failed to delete period'),
    });
}

// ============================================================================
// LOCATIONS HOOKS
// ============================================================================

export function useLocations(orgId: string) {
    return useQuery({
        queryKey: ['locations', orgId],
        queryFn: () => hrApi.locations.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateLocation(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLocationRequest) => hrApi.locations.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations', orgId] });
            toast.success('Location created!');
        },
        onError: () => toast.error('Failed to create location'),
    });
}

export function useUpdateLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
            hrApi.locations.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success('Location updated!');
        },
        onError: () => toast.error('Failed to update location'),
    });
}

export function useDeleteLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.locations.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success('Location deleted!');
        },
        onError: () => toast.error('Failed to delete location'),
    });
}

// ============================================================================
// DRIVERS HOOKS
// ============================================================================

export function useDrivers(orgId: string) {
    return useQuery({
        queryKey: ['drivers', orgId],
        queryFn: () => hrApi.drivers.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateDriver(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDriverRequest) => hrApi.drivers.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers', orgId] });
            toast.success('Driver created!');
        },
        onError: () => toast.error('Failed to create driver'),
    });
}

export function useUpdateDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDriverRequest }) =>
            hrApi.drivers.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            toast.success('Driver updated!');
        },
        onError: () => toast.error('Failed to update driver'),
    });
}

export function useDeleteDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.drivers.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            toast.success('Driver deleted!');
        },
        onError: () => toast.error('Failed to delete driver'),
    });
}

// ============================================================================
// POLICIES HOOKS
// ============================================================================

export function usePolicies(orgId: string) {
    return useQuery({
        queryKey: ['policies', orgId],
        queryFn: () => hrApi.policies.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreatePolicy(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePolicyRequest) => hrApi.policies.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies', orgId] });
            toast.success('Policy created!');
        },
        onError: () => toast.error('Failed to create policy'),
    });
}

export function useUpdatePolicy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePolicyRequest }) =>
            hrApi.policies.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy updated!');
        },
        onError: () => toast.error('Failed to update policy'),
    });
}

export function useDeletePolicy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrApi.policies.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy deleted!');
        },
        onError: () => toast.error('Failed to delete policy'),
    });
}
