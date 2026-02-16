export interface Love {
    id: string;
    name: string;
    relationship: string;
    birthday?: string;
    contact_info?: Record<string, any>;
    avatar_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    pins?: Pin[];
}

export interface Purpose {
    id: string;
    title: string;
    description?: string;
    type: 'value' | 'mission' | 'vision' | string;
    importance: number;
    created_at: string;
    updated_at: string;
    loves?: Love[];
}

export interface Pin {
    id: string;
    name: string;
    address?: string;
    type: 'home' | 'work' | 'travel' | 'favorite' | string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    visited_at?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateLoveRequest {
    name: string;
    relationship?: string;
    birthday?: string;
    contact_info?: Record<string, any>;
    avatar_url?: string;
    notes?: string;
    pin_ids?: string[];
}

export interface CreatePurposeRequest {
    title: string;
    description?: string;
    type?: string;
    importance?: number;
    love_ids?: string[];
}

export interface CreatePinRequest {
    name: string;
    address?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    visited_at?: string;
    image_url?: string;
}
