"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r border-sidebar-border bg-sidebar w-[280px]">
                {/* We render AppSidebar here. Since AppSidebar manages its own state/hooks, it should work fine. 
                    We might need to pass a prop to close the sidebar on navigation if needed, 
                    but standard Link navigation usually doesn't auto-close Sheet unless we add logic. 
                    For now, let's just render it. 
                */}
                <div className="h-full overflow-y-auto">
                    <AppSidebar />
                </div>
            </SheetContent>
        </Sheet>
    );
}
