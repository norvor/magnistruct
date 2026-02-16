'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { StaticSpaceBackground } from './StaticSpaceBackground';
import { StaticSunBackground } from './StaticSunBackground';

export function DynamicBackground() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const currentTheme = resolvedTheme || theme || 'light';
    const bgColor = currentTheme === 'dark' ? 'oklch(0.10 0.05 270)' : 'oklch(0.98 0.01 90)';

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ backgroundColor: bgColor }}>
            {/* Pure CSS/SVG Background Layer - Zero WebGL Overhead */}
            <div className="absolute inset-0 z-0">
                {currentTheme === 'dark' ? <StaticSpaceBackground /> : <StaticSunBackground />}
            </div>

            {/* Mesh Gradient Layer (overlayed for depth) */}
            <div
                className={`absolute inset-[-50%] z-10 blur-[100px] transition-opacity duration-1000 ${currentTheme === 'dark' ? 'opacity-10' : 'opacity-30'
                    }`}
                style={{
                    background: currentTheme === 'dark'
                        ? 'radial-gradient(ellipse 100% 70% at 30% 20%, oklch(0.15 0.15 280), transparent), radial-gradient(ellipse 80% 100% at 70% 50%, oklch(0.20 0.25 310), transparent)'
                        : 'radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.92 0.12 85), transparent), radial-gradient(ellipse 60% 50% at 80% 10%, oklch(0.95 0.08 80), transparent)',
                    animation: currentTheme === 'dark' ? 'cosmicNebula 60s linear infinite' : 'sunburst 40s ease-in-out infinite'
                }}
            />
        </div>
    );
}
