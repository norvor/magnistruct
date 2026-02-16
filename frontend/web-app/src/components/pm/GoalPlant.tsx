"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GoalPlantProps {
    stage: number; // 0 to 5
    className?: string;
}

export function GoalPlant({ stage, className = "" }: GoalPlantProps) {
    // Stage-based visuals (0=seed, 1=sprout, 2=stem, 3=leaves, 4=bud, 5=bloom)

    return (
        <div className={`relative flex items-center justify-center w-32 h-32 ${className}`}>
            {/* Pot */}
            <div className="absolute bottom-0 w-16 h-10 bg-gradient-to-t from-zinc-900 via-zinc-800 to-zinc-700 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 rounded-b-xl border-x-2 border-primary/20 z-10 shadow-xl" />
            <div className="absolute bottom-8 w-18 h-3 bg-zinc-700 dark:bg-stone-800 rounded-full z-20 shadow-sm border border-border/50" />

            {/* Dirt Layer */}
            <div className="absolute bottom-9 w-14 h-2 bg-stone-950/80 rounded-full z-15 mix-blend-multiply" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={stage}
                    initial={{ scale: 0.5, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="absolute bottom-10 flex flex-col items-center"
                >
                    {/* Growth Logic */}
                    <svg width="120" height="140" viewBox="0 -20 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                        {/* Seed / Initial Sprout */}
                        {stage === 0 && (
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                d="M50 90C50 90 48 85 45 82"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        )}

                        {stage >= 1 && (
                            <>
                                {/* Main Stem with Organic Loops */}
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    d={stage === 5
                                        ? "M50 90 C50 80, 55 75, 50 65 C45 55, 45 45, 50 35 C55 25, 55 15, 50 5"
                                        : `M50 90 Q${50 + (stage % 2 === 0 ? 5 : -5)} ${90 - stage * 10} 50 ${90 - stage * 15}`
                                    }
                                    stroke="#059669"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />

                                {/* Organic Leaves */}
                                {stage >= 2 && (
                                    <motion.path
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        d="M50 75 C40 70, 30 70, 35 80 C40 85, 50 75, 50 75"
                                        fill="#10b981"
                                    />
                                )}

                                {stage >= 3 && (
                                    <motion.path
                                        initial={{ scale: 0, rotate: 45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        d="M50 65 C60 60, 70 60, 65 70 C60 75, 50 65, 50 65"
                                        fill="#059669"
                                    />
                                )}

                                {/* Bloom & Falling Petals */}
                                {stage === 5 && (
                                    <g transform="translate(50, 5)"> {/* Centered at the stem summit */}
                                        {/* Floating Petals */}
                                        {[...Array(3)].map((_, i) => (
                                            <motion.path
                                                key={`falling-${i}`}
                                                d="M0 0 Q-5 10 0 20 Q5 10 0 0"
                                                fill="#ec4899"
                                                initial={{ x: 0, y: 0, rotate: i * 45, opacity: 0, scale: 0.5 }}
                                                animate={{
                                                    x: [0, 30 + i * 15, 50 + i * 10],
                                                    y: [0, 20 + i * 10, 60 + i * 5],
                                                    rotate: [i * 45, i * 180, i * 360 + 720],
                                                    opacity: [0, 1, 0],
                                                    scale: [0.5, 1, 0.5]
                                                }}
                                                transition={{ duration: 6 + i, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
                                            />
                                        ))}

                                        {/* The Actual Flower */}
                                        <motion.g
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1.4 }}
                                            transition={{ type: "spring", stiffness: 120, damping: 12 }}
                                        >
                                            {/* Each Petal wrapped in its own rotation group */}
                                            {[0, 60, 120, 180, 240, 300].map((rot) => (
                                                <g key={rot} transform={`rotate(${rot})`}>
                                                    <motion.path
                                                        d="M0 0 C-8 -15, 0 -22, 0 -22 C0 -22, 8 -15, 0 0"
                                                        fill="#ec4899"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: rot / 1000 }}
                                                    />
                                                </g>
                                            ))}
                                            {/* Flower Center with pulse */}
                                            <motion.circle
                                                cx="0" cy="0" r="5"
                                                fill="#facc15"
                                                className="shadow-inner"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.g>
                                    </g>
                                )}

                                {/* Bud for stage 4 */}
                                {stage === 4 && (
                                    <motion.circle
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        cx="50" cy="30" r="6"
                                        fill="#f472b6"
                                    />
                                )}
                            </>
                        )}
                    </svg>
                </motion.div>
            </AnimatePresence>
        </div >
    );
}
