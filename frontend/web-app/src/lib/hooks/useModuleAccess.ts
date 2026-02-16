import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/redux/store';
import { ModuleType } from '@/lib/redux/features/authSlice';

export function useModuleAccess(module: ModuleType): boolean {
    const enabledModules = useSelector((state: RootState) => state.auth.enabledModules);
    return enabledModules.includes(module);
}

export function useEnabledModules(): ModuleType[] {
    return useSelector((state: RootState) => state.auth.enabledModules);
}
