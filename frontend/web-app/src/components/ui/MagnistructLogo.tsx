"use client";

import { cn } from "@/lib/utils";

interface MagnistructLogoProps {
    className?: string;
    showBg?: boolean;
}

export function MagnistructLogo({ className, showBg = true }: MagnistructLogoProps) {
    return (
        <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-10 h-10", className)}
        >
            <defs>
                <linearGradient id="ms-union-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
            </defs>

            {showBg && (
                <>
                    <rect x="0" y="0" width="512" height="512" rx="120" fill="url(#ms-union-grad)" />
                    <rect x="10" y="10" width="492" height="492" rx="110" stroke="white" strokeOpacity="0.2" strokeWidth="20" />
                </>
            )}

            {/* Custom M Path - Thick Rounded Style matching the R aesthetic */}
            <g transform="translate(86, 106) scale(0.65)">
                <path
                    d="M0 452V60C0 26.8629 26.8629 0 60 0C93.1371 0 120 26.8629 120 60V320L230 110C240 90 270 90 280 110L390 320V60C390 26.8629 416.863 0 450 0C483.137 0 510 26.8629 510 60V452C510 485.137 483.137 512 450 512C416.863 512 390 485.137 390 452V200L280 410C270 430 240 430 230 410L120 200V452C120 485.137 93.1371 512 60 512C26.8629 512 0 485.137 0 452Z"
                    fill="white"
                />
            </g>
        </svg>
    );
}
