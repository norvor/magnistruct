import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi, CreateJournalEntryRequest } from '../api/journal';
import { toast } from 'sonner';

export function useJournalEntries() {
    return useQuery({
        queryKey: ['journal'],
        queryFn: journalApi.list,
    });
}

export function useCreateJournalEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateJournalEntryRequest) => journalApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal'] });

            toast.success('Journal entry saved (+20 XP)');
        },
        onError: () => {
            toast.error('Failed to save journal entry');
        },
    });
}

export function useDeleteJournalEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => journalApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal'] });
            toast.success('Entry deleted');
        },
        onError: () => {
            toast.error('Failed to delete entry');
        },
    });
}
