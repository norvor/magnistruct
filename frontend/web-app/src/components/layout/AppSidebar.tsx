'use client';

import { Users2, Briefcase, Users, Settings, LayoutDashboard, CheckSquare, Zap, BookOpen, Repeat, Heart, Compass, MapPin } from 'lucide-react';
import Link from 'next/link';
import { MagnistructLogo } from '@/components/ui/MagnistructLogo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEnabledModules } from '@/lib/hooks/useModuleAccess';
import { ModuleType } from '@/lib/redux/features/authSlice';

interface NavItem {
    name: string;
    href?: string;
    icon: any;
    module?: ModuleType; // If specified, only show if user has this module
    children?: Array<{
        name: string;
        href: string;
    }>;
}

const allNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Cycles', href: '/dashboard/cycles', icon: Repeat },
    { name: 'Habits', href: '/dashboard/habits', icon: Zap },
    { name: 'The Whos', href: '/dashboard/loves', icon: Heart },
    { name: 'The Whys', href: '/dashboard/purposes', icon: Compass },
    { name: 'The Wheres', href: '/dashboard/pins', icon: MapPin },
];

export function AppSidebar() {
    const pathname = usePathname();
    const enabledModules = useEnabledModules();

    // Filter navigation based on enabled modules
    const navigation = allNavigation.filter(item => {
        // If no module specified, always show (Dashboard, Settings)
        if (!item.module) return true;
        // Otherwise, check if module is enabled
        return enabledModules.includes(item.module);
    });

    return (
        <div className="flex h-full flex-col gap-y-5 bg-sidebar border-r border-sidebar-border px-6 py-4 text-sidebar-foreground">
            {/* Logo */}
            <div className="flex h-16 items-center gap-x-4">
                <MagnistructLogo className="h-10 w-10 shadow-lg" />
                <span className="text-xl font-semibold tracking-tight">Magnistruct</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                    {navigation.map((item) => (
                        <li key={item.name}>
                            {!item.children ? (
                                <Link
                                    href={item.href!}
                                    className={cn(
                                        pathname === item.href
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.name}
                                </Link>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-sidebar-foreground/70">
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        {item.name}
                                    </div>
                                    <ul className="mt-1 space-y-1 pl-9">
                                        {item.children.map((child) => (
                                            <li key={child.name}>
                                                <Link
                                                    href={child.href}
                                                    className={cn(
                                                        pathname === child.href
                                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                        'block rounded-md py-2 px-3 text-sm'
                                                    )}
                                                >
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Module Access Info */}
                {enabledModules.length > 0 && (
                    <div className="mt-auto pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Active Modules</p>
                        <div className="flex flex-wrap gap-1">
                            {enabledModules.map((module) => (
                                <span
                                    key={module}
                                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                >
                                    {module.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
