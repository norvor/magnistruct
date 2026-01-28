import { writable } from 'svelte/store';
import type { User } from '$lib/api';

export const currentUser = writable<User | null>(null);
// We removed isAuthInitialized because it was causing race conditions.