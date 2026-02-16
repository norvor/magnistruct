'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dock } from '@/components/layout/Dock';
import { TopBar } from '@/components/layout/TopBar';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '@/lib/api/auth';
import { setCredentials } from '@/lib/redux/features/authSlice';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const hydrateUser = async () => {
            if (!user) {
                try {
                    const userData = await authApi.getCurrentUser();
                    dispatch(setCredentials({ user: userData as any, token }));
                    setIsLoading(false);
                } catch (error) {
                    console.error("Failed to hydrate user:", error);
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } else {
                setIsLoading(false);
            }
        };

        hydrateUser();
    }, [router, user, dispatch]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-transparent relative selection:bg-primary/20 selection:text-primary">
            {/* Top Bar - Simplified or integrated? Keeping for now but maybe could be removed if dock handles navigation */}
            {/* <TopBar />  Let's keep TopBar for Profile/Notifications for now, but maybe style it differently? */}

            <div className="flex flex-1 flex-col overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 z-40">
                    <TopBar />
                </div>

                <main className="flex-1 overflow-y-auto scrollbar-none pt-16 pb-32">
                    <div className="container mx-auto max-w-7xl p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mac-like Dock */}
            <Dock />
        </div>
    );
}
