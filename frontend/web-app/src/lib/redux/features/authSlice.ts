import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ModuleType = 'hr' | 'pm' | 'crm';

interface User {
    id: string;
    email: string;
    fullName: string;
    enabled_modules?: ModuleType[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    enabledModules: ModuleType[];
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    enabledModules: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            if (!action.payload.user) {
                console.error("setCredentials called with null/undefined user");
                return;
            }
            state.user = {
                id: (action.payload.user as any).id,
                email: (action.payload.user as any).email,
                fullName: (action.payload.user as any).full_name || (action.payload.user as any).fullName,
                enabled_modules: (action.payload.user as any).enabled_modules || (action.payload.user as any).enabledModules,
            };
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.enabledModules = action.payload.user.enabled_modules || [];

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.enabledModules = [];

            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
