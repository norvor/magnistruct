import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeApi } from '@/lib/api/life';
import { CreateLoveRequest, CreatePurposeRequest, CreatePinRequest } from '@/lib/types/life';

// ============================================================================
// LOVES (The Whos)
// ============================================================================

export function useLoves() {
    return useQuery({
        queryKey: ['loves'],
        queryFn: lifeApi.getLoves,
    });
}

export function useCreateLove() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLoveRequest) => lifeApi.createLove(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loves'] });
        },
    });
}

export function useUpdateLove() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateLoveRequest> }) => lifeApi.updateLove(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loves'] });
        },
    });
}



export function useDeleteLove() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lifeApi.deleteLove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loves'] });
        },
    });
}

// ============================================================================
// PURPOSES (The Whys)
// ============================================================================

export function usePurposes() {
    return useQuery({
        queryKey: ['purposes'],
        queryFn: lifeApi.getPurposes,
    });
}

export function useCreatePurpose() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePurposeRequest) => lifeApi.createPurpose(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purposes'] });
        },
    });
}

export function useDeletePurpose() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lifeApi.deletePurpose(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purposes'] });
        },
    });
}

export function useUpdatePurpose() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePurposeRequest> }) => lifeApi.updatePurpose(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purposes'] });
        },
    });
}

// ============================================================================
// PINS (The Wheres)
// ============================================================================

export function usePins() {
    return useQuery({
        queryKey: ['pins'],
        queryFn: lifeApi.getPins,
    });
}

export function useCreatePin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePinRequest) => lifeApi.createPin(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pins'] });
        },
    });
}

export function useDeletePin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lifeApi.deletePin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pins'] });
        },
    });
}

export function useUpdatePin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePinRequest> }) => lifeApi.updatePin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pins'] });
        },
    });
}
