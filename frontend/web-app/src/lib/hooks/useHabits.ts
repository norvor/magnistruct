import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, CreateHabitRequest } from '../api/habits';
import { toast } from 'sonner';

export function useHabits() {
    return useQuery({
        queryKey: ['habits'],
        queryFn: habitsApi.list,
    });
}

export function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHabitRequest) => habitsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            toast.success('Habit created');
        },
        onError: () => {
            toast.error('Failed to create habit');
        },
    });
}

export function useToggleHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.toggle(id, date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });

        },
        onError: () => {
            toast.error('Failed to toggle habit');
        },
    });
}

export function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => habitsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            toast.success('Habit deleted');
        },
        onError: () => {
            toast.error('Failed to delete habit');
        },
    });
}
