'use client';

import React from 'react';

export function StaticSunBackground() {
    return (
        <div className="relative w-full h-full bg-[#fffcf5] overflow-hidden">
            {/* Sunrise Gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, #fefce8 0%, #fef9c3 30%, #fef3c7 60%, #fff7ed 100%)',
                }}
            />

            {/* Sun Glow */}
            <div
                className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-40 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, #fde047 0%, transparent 70%)',
                }}
            />

            {/* Stylized Clouds (SVG) - Top Layer */}
            <div className="absolute top-[5%] left-[10%] w-[300px] h-[100px] opacity-30 pointer-events-none">
                <svg viewBox="0 0 200 60" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 45a20 20 0 1 1 5-39 25 25 0 1 1 45 4 15 15 0 1 1 25 15 10 10 0 1 1 5 20z" />
                </svg>
            </div>

            <div className="absolute top-[15%] right-[15%] w-[400px] h-[120px] opacity-20 pointer-events-none transform scale-x-[-1]">
                <svg viewBox="0 0 200 60" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 45a20 20 0 1 1 5-39 25 25 0 1 1 45 4 15 15 0 1 1 25 15 10 10 0 1 1 5 20z" />
                </svg>
            </div>

            <div className="absolute top-[8%] left-[45%] w-[250px] h-[80px] opacity-15 pointer-events-none">
                <svg viewBox="0 0 200 60" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 40a15 15 0 1 1 4-29 20 20 0 1 1 36 3 12 12 0 1 1 20 12 8 8 0 1 1 4 16z" />
                </svg>
            </div>

            {/* Mesh Gradient Accents */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none blur-[80px]"
                style={{
                    background: 'radial-gradient(circle at 20% 40%, #fbbf24, transparent), radial-gradient(circle at 80% 10%, #fde68a, transparent)',
                }}
            />

            {/* Subtle Texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
    );
}
