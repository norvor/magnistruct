'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModuleAccess } from '@/lib/hooks/useModuleAccess';
import { ModuleType } from '@/lib/redux/features/authSlice';

interface ModuleGuardProps {
    module: ModuleType;
    children: React.ReactNode;
    fallbackPath?: string;
}

export function ModuleGuard({ module, children, fallbackPath = '/' }: ModuleGuardProps) {
    const hasAccess = useModuleAccess(module);
    const router = useRouter();

    useEffect(() => {
        if (!hasAccess) {
            router.push(fallbackPath);
        }
    }, [hasAccess, router, fallbackPath]);

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
}
