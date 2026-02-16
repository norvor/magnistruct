import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../api/crm';
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
import { toast } from 'sonner';

// ============================================================================
// OPPORTUNITES HOOKS
// ============================================================================

export function useOpportunities(orgId: string) {
    return useQuery({
        queryKey: ['opportunities', orgId],
        queryFn: () => crmApi.opportunities.list(orgId),
        enabled: !!orgId,
    });
}

export function useOpportunity(id: string) {
    return useQuery({
        queryKey: ['opportunity', id],
        queryFn: () => crmApi.opportunities.get(id),
        enabled: !!id,
    });
}

export function useCreateOpportunity(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOpportunityRequest) => crmApi.opportunities.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities', orgId] });
            toast.success('Opportunity created!');
        },
        onError: () => toast.error('Failed to create opportunity'),
    });
}

export function useUpdateOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityRequest }) =>
            crmApi.opportunities.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            toast.success('Opportunity updated!');
        },
        onError: () => toast.error('Failed to update opportunity'),
    });
}

export function useDeleteOpportunity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.opportunities.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            toast.success('Opportunity deleted!');
        },
        onError: () => toast.error('Failed to delete opportunity'),
    });
}

// ============================================================================
// CONTACTS HOOKS
// ============================================================================

export function useContacts(orgId: string) {
    return useQuery({
        queryKey: ['contacts', orgId],
        queryFn: () => crmApi.contacts.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateContact(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateContactRequest) => crmApi.contacts.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
            toast.success('Contact created!');
        },
        onError: () => toast.error('Failed to create contact'),
    });
}

export function useUpdateContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateContactRequest }) =>
            crmApi.contacts.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast.success('Contact updated!');
        },
        onError: () => toast.error('Failed to update contact'),
    });
}

export function useDeleteContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.contacts.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast.success('Contact deleted!');
        },
        onError: () => toast.error('Failed to delete contact'),
    });
}

// ============================================================================
// TIMELINES HOOKS
// ============================================================================

export function useTimelines(orgId: string) {
    return useQuery({
        queryKey: ['timelines', orgId],
        queryFn: () => crmApi.timelines.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateTimeline(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTimelineRequest) => crmApi.timelines.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timelines', orgId] });
            toast.success('Timeline created!');
        },
        onError: () => toast.error('Failed to create timeline'),
    });
}

export function useUpdateTimeline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTimelineRequest }) =>
            crmApi.timelines.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['timelines'] });
            toast.success('Timeline updated!');
        },
        onError: () => toast.error('Failed to update timeline'),
    });
}

export function useDeleteTimeline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.timelines.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timelines'] });
            toast.success('Timeline deleted!');
        },
        onError: () => toast.error('Failed to delete timeline'),
    });
}

// ============================================================================
// CHANNELS HOOKS
// ============================================================================

export function useChannels(orgId: string) {
    return useQuery({
        queryKey: ['channels', orgId],
        queryFn: () => crmApi.channels.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateChannel(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateChannelRequest) => crmApi.channels.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channels', orgId] });
            toast.success('Channel created!');
        },
        onError: () => toast.error('Failed to create channel'),
    });
}

export function useUpdateChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateChannelRequest }) =>
            crmApi.channels.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['channels'] });
            toast.success('Channel updated!');
        },
        onError: () => toast.error('Failed to update channel'),
    });
}

export function useDeleteChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.channels.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channels'] });
            toast.success('Channel deleted!');
        },
        onError: () => toast.error('Failed to delete channel'),
    });
}

// ============================================================================
// PAIN POINTS HOOKS
// ============================================================================

export function usePainPoints(orgId: string) {
    return useQuery({
        queryKey: ['painPoints', orgId],
        queryFn: () => crmApi.painPoints.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreatePainPoint(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePainPointRequest) => crmApi.painPoints.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['painPoints', orgId] });
            toast.success('Pain point created!');
        },
        onError: () => toast.error('Failed to create pain point'),
    });
}

export function useUpdatePainPoint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePainPointRequest }) =>
            crmApi.painPoints.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['painPoints'] });
            toast.success('Pain point updated!');
        },
        onError: () => toast.error('Failed to update pain point'),
    });
}

export function useDeletePainPoint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.painPoints.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['painPoints'] });
            toast.success('Pain point deleted!');
        },
        onError: () => toast.error('Failed to delete pain point'),
    });
}

// ============================================================================
// COLLATERAL HOOKS
// ============================================================================

export function useCollateral(orgId: string) {
    return useQuery({
        queryKey: ['collateral', orgId],
        queryFn: () => crmApi.collateral.list(orgId),
        enabled: !!orgId,
    });
}

export function useCreateCollateral(orgId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCollateralRequest) => crmApi.collateral.create(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collateral', orgId] });
            toast.success('Collateral created!');
        },
        onError: () => toast.error('Failed to create collateral'),
    });
}

export function useUpdateCollateral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCollateralRequest }) =>
            crmApi.collateral.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['collateral'] });
            toast.success('Collateral updated!');
        },
        onError: () => toast.error('Failed to update collateral'),
    });
}

export function useDeleteCollateral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => crmApi.collateral.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collateral'] });
            toast.success('Collateral deleted!');
        },
        onError: () => toast.error('Failed to delete collateral'),
    });
}
