import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'aurora' | 'cloudy';

export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar: string; // Ensure this matches your API response
    job_title: string;
    bio: string;
    theme: Theme;
}

function createCurrentUser() {
    const { subscribe, set, update } = writable<User | null>(null);

    // FIX: This subscription guarantees the theme applies instantly 
    // whenever the store value changes (whether via set OR update).
    subscribe((user) => {
        if (browser) {
            const theme = user?.theme || 'aurora';
            document.documentElement.setAttribute('data-theme', theme);
        }
    });

    return {
        subscribe,
        set,
        update
    };
}

export const currentUser = createCurrentUser();