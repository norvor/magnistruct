'use client';

import React from 'react';

export function StaticSpaceBackground() {
    return (
        <div className="relative w-full h-full bg-[#030712] overflow-hidden">
            {/* Nebula Glow 1 */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                }}
            />

            {/* Nebula Glow 2 */}
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[150px] opacity-15 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                }}
            />

            {/* Stars Layer */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(2px 2px at 50px 160px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(1px 1px at 160px 120px, #fff, rgba(0,0,0,0))`,
                    backgroundSize: '200px 200px',
                }}
            />

            {/* Secondary Tiny Stars Layer */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
                                      radial-gradient(1px 1px at 150px 150px, #fff, rgba(0,0,0,0))`,
                    backgroundSize: '100px 100px',
                }}
            />

            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50 pointer-events-none" />
        </div>
    );
}
