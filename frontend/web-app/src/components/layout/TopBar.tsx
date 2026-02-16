'use client';

import { usePathname } from 'next/navigation';
import { Search, User, Menu, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { useState } from 'react';
import { CreateActionModal } from '@/components/pm/modals/CreateActionModal';
import { Zap } from 'lucide-react';
import { MagnistructLogo } from '@/components/ui/MagnistructLogo';
import { MobileSidebar } from '@/components/layout/MobileSidebar';

export function TopBar() {

    const pathname = usePathname();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Generate breadcrumbs from pathname
    const breadcrumbs = pathname
        ?.split('/')
        .filter(Boolean)
        .map((segment, index, array) => {
            const href = '/' + array.slice(0, index + 1).join('/');
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return { href, label };
        });

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex h-14 w-[95%] max-w-7xl items-center justify-between rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl px-6 shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Left Section: Breadcrumbs - HIDDEN per user request */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <MagnistructLogo className="h-8 w-8 shadow-md" />
                    {!pathname.includes('settings') && (
                        <span className="text-sm font-semibold tracking-tight hidden md:block">Magnistruct</span>
                    )}
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Global Add Task Button */}
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-3 text-xs mr-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    New Action
                </Button>





                <div className="h-4 w-[1px] bg-border/50 mx-1" />

                {/* Theme Toggle */}
                <ThemeToggle />



                {/* Profile Help/Menu - Replaced with MobileSidebar trigger for mobile */}
                <MobileSidebar />
            </div>

            <CreateActionModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />
        </header>
    );
}
