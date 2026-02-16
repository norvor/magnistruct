import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pmApi } from '../api/pm';
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
import { toast } from 'sonner';

// ============================================================================
// WORK ITEMS HOOKS
// ============================================================================

export function useWorkItems(filters?: WorkItemFilters) {
    return useQuery({
        queryKey: ['workItems', filters],
        queryFn: () => pmApi.workItems.list(filters),
    });
}

export function useWorkItem(id: string) {
    return useQuery({
        queryKey: ['workItem', id],
        queryFn: () => pmApi.workItems.get(id),
        enabled: !!id,
    });
}

export function useCreateWorkItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWorkItemRequest) => pmApi.workItems.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            if (variables.parent_id) {
                queryClient.invalidateQueries({ queryKey: ['workItem', variables.parent_id, 'subtasks'] });
            }
            if (variables.goal_id) {
                queryClient.invalidateQueries({ queryKey: ['goal', variables.goal_id] });
            }
            toast.success('Action created!');
        },
        onError: () => {
            toast.error('Failed to create action');
        },
    });
}

export function useUpdateWorkItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkItemRequest }) =>
            pmApi.workItems.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workItem', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            toast.success('Action updated!');
        },
        onError: () => {
            toast.error('Failed to update action');
        },
    });
}

export function useDeleteWorkItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.workItems.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
            toast.success('Action deleted!');
        },
        onError: () => {
            toast.error('Failed to delete action');
        },
    });
}

export function useSubtasks(parentId: string) {
    return useQuery({
        queryKey: ['workItem', parentId, 'subtasks'],
        queryFn: () => pmApi.workItems.getSubtasks(parentId),
        enabled: !!parentId,
    });
}

// ============================================================================
// RESOURCES HOOKS
// ============================================================================

export function useResources() {
    return useQuery({
        queryKey: ['resources'],
        queryFn: () => pmApi.resources.list(),
    });
}

export function useResource(id: string) {
    return useQuery({
        queryKey: ['resource', id],
        queryFn: () => pmApi.resources.get(id),
        enabled: !!id,
    });
}

export function useCreateResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateResourceRequest) => pmApi.resources.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('Resource created!');
        },
        onError: () => {
            toast.error('Failed to create resource');
        },
    });
}

export function useUpdateResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateResourceRequest }) =>
            pmApi.resources.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['resource', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('Resource updated!');
        },
        onError: () => {
            toast.error('Failed to update resource');
        },
    });
}

export function useDeleteResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.resources.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('Resource deleted!');
        },
        onError: () => {
            toast.error('Failed to delete resource');
        },
    });
}

// ============================================================================
// JOURNEYS HOOKS
// ============================================================================

export function useJourneys(goalId?: string) {
    return useQuery({
        queryKey: ['journeys', goalId],
        queryFn: () => pmApi.journeys.list(goalId),
    });
}

export function useJourney(id: string) {
    return useQuery({
        queryKey: ['journey', id],
        queryFn: () => pmApi.journeys.get(id),
        enabled: !!id,
    });
}

export function useCreateJourney() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateJourneyRequest) => pmApi.journeys.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
            toast.success('Journey created!');
        },
        onError: () => {
            toast.error('Failed to create journey');
        },
    });
}

export function useUpdateJourney() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateJourneyRequest }) =>
            pmApi.journeys.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['journey', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
            toast.success('Journey updated!');
        },
        onError: () => {
            toast.error('Failed to update journey');
        },
    });
}

export function useDeleteJourney() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.journeys.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
            toast.success('Journey deleted!');
        },
        onError: () => {
            toast.error('Failed to delete journey');
        },
    });
}

// ============================================================================
// ENVIRONMENTS HOOKS
// ============================================================================

export function useEnvironments() {
    return useQuery({
        queryKey: ['environments'],
        queryFn: () => pmApi.environments.list(),
    });
}

export function useEnvironment(id: string) {
    return useQuery({
        queryKey: ['environment', id],
        queryFn: () => pmApi.environments.get(id),
        enabled: !!id,
    });
}

export function useCreateEnvironment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEnvironmentRequest) => pmApi.environments.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['environments'] });
            toast.success('Environment created!');
        },
        onError: () => {
            toast.error('Failed to create environment');
        },
    });
}

export function useUpdateEnvironment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEnvironmentRequest }) =>
            pmApi.environments.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['environment', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['environments'] });
            toast.success('Environment updated!');
        },
        onError: () => {
            toast.error('Failed to update environment');
        },
    });
}

export function useDeleteEnvironment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.environments.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['environments'] });
            toast.success('Environment deleted!');
        },
        onError: () => {
            toast.error('Failed to delete environment');
        },
    });
}

// ============================================================================
// GOALS HOOKS
// ============================================================================

export function useGoals() {
    return useQuery({
        queryKey: ['goals'],
        queryFn: () => pmApi.goals.list(),
    });
}

export function useGoal(id: string) {
    return useQuery({
        queryKey: ['goal', id],
        queryFn: () => pmApi.goals.get(id),
        enabled: !!id,
    });
}

export function useCreateGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateGoalRequest) => pmApi.goals.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success('Goal created!');
        },
        onError: () => {
            toast.error('Failed to create goal');
        },
    });
}

export function useUpdateGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
            pmApi.goals.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['goal', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success('Goal updated!');
        },
        onError: () => {
            toast.error('Failed to update goal');
        },
    });
}

export function useDeleteGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.goals.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            toast.success('Goal deleted!');
        },
        onError: () => {
            toast.error('Failed to delete goal');
        },
    });
}

// ============================================================================
// SPECS HOOKS
// ============================================================================

export function useSpecs(entityType?: string, entityId?: string) {
    return useQuery({
        queryKey: ['specs', entityType, entityId],
        queryFn: () => pmApi.specs.list(entityType, entityId),
    });
}

export function useSpec(id: string) {
    return useQuery({
        queryKey: ['spec', id],
        queryFn: () => pmApi.specs.get(id),
        enabled: !!id,
    });
}

export function useCreateSpec() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSpecRequest) => pmApi.specs.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specs'] });
            toast.success('Spec created!');
        },
        onError: () => {
            toast.error('Failed to create spec');
        },
    });
}

export function useUpdateSpec() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSpecRequest }) =>
            pmApi.specs.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['spec', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['specs'] });
            toast.success('Spec updated!');
        },
        onError: () => {
            toast.error('Failed to update spec');
        },
    });
}

export function useDeleteSpec() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pmApi.specs.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specs'] });
            toast.success('Spec deleted!');
        },
        onError: () => {
            toast.error('Failed to delete spec');
        },
    });
}

export function useUpdateGoalStep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stepId, data }: { stepId: string; data: UpdateGoalStepRequest }) =>
            pmApi.goals.updateStep(stepId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            queryClient.invalidateQueries({ queryKey: ['goal'] });
        },
    });
}
