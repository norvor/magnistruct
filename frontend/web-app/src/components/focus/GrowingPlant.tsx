"use client";

import { motion } from "framer-motion";

interface GrowingPlantProps {
    stage: number; // 0-10: Seed, 11-30: Sprout, 30+: Bloom
    isWatered: boolean;
}

export function GrowingPlant({ stage, isWatered }: GrowingPlantProps) {
    // Determine plant stage based on streak/progress
    const getPlantPath = () => {
        if (stage < 3) {
            // Stage 1: Seed / Tiny Sprout
            return (
                <path d="M12 18V22M12 18C12 18 10 14 8 16M12 18C12 18 14 14 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            );
        } else if (stage < 10) {
            // Stage 2: Growing Sprout
            return (
                <>
                    <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 16L8 14C8 14 6 10 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 14L16 12C16 12 18 8 15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
            );
        } else {
            // Stage 3: Blooming Plant
            return (
                <>
                    <path d="M12 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    {/* Leaves */}
                    <path d="M12 18L7 16C7 16 4 12 7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 16L17 14C17 14 20 10 17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    {/* Flower */}
                    <path d="M12 10L9 7M12 10L15 7M12 10V5" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="5" r="2" fill="#F472B6" />
                </>
            );
        }
    };

    return (
        <div className="relative w-10 h-10 flex items-end justify-center overflow-visible">
            {/* Pot */}
            <svg viewBox="0 0 24 24" className="w-full h-full absolute bottom-0">
                <path d="M7 16H17L19 22H5L7 16Z" fill="#78350F" className="opacity-80" />
            </svg>

            {/* Plant */}
            <motion.svg
                viewBox="0 0 24 24"
                className={`w-full h-full absolute bottom-1 ${stage >= 10 ? 'text-green-500' : 'text-green-400'}`}
                animate={isWatered ? {
                    y: [0, -2, 0],
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {getPlantPath()}
            </motion.svg>

            {/* Water Droplets Animation (only when watered) */}
            {isWatered && (
                <motion.div
                    className="absolute -top-2"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: 10 }}
                    transition={{ duration: 0.8, repeat: 0 }}
                >
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                </motion.div>
            )}
        </div>
    );
}
