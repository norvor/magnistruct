"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
    children: React.ReactNode;
    content: React.ReactNode;
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export function Popover({ children, content, align = "center", side = "bottom", className }: PopoverProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                        side === "bottom" && "top-full mt-2",
                        side === "top" && "bottom-full mb-2",
                        align === "center" && "left-1/2 -translate-x-1/2",
                        align === "start" && "left-0",
                        align === "end" && "right-0",
                        className
                    )}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
