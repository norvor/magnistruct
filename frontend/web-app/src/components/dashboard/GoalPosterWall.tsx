"use client";

import { Goal } from "@/lib/types/pm";
import { Target, Link2 } from "lucide-react";
import Link from "next/link";

interface GoalPosterWallProps {
    goals: Goal[];
}

export function GoalPosterWall({ goals }: GoalPosterWallProps) {
    const posterColors = [
        'bg-[#FF5733]', // Red-Orange
        'bg-[#33FF57]', // Neon Green
        'bg-[#3357FF]', // Royal Blue
        'bg-[#F3FF33]', // Bright Yellow
        'bg-[#FF33F6]', // Hot Pink
        'bg-[#33FFF6]', // Sky Blue
    ];

    const tapeStyles = [
        'rotate-[45deg] -top-2 -left-2',
        'rotate-[-45deg] -top-2 -right-2',
        'rotate-[10deg] -bottom-2 left-1/2 -translate-x-1/2',
        'rotate-[-5deg] top-0 left-4',
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00CCFF] rounded-lg border-2 border-black rotate-[2deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[1px_1px_rgba(0,0,0,1)]">Strategic Cargo</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-stone-800/20 dark:bg-stone-900/50 border-[4px] border-black rounded-[2.5rem] shadow-inner relative overflow-hidden min-h-[400px]">
                {/* Wall Texture */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {goals.map((goal, i) => {
                    const bgColor = posterColors[i % posterColors.length];
                    const rotation = (i % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[2deg]');

                    return (
                        <Link key={goal.id} href={`/dashboard/goals/${goal.id}`} className="block relative group/poster">
                            {/* Tape Bits */}
                            <div className="absolute -top-3 left-1/4 w-12 h-6 bg-white/40 border border-black/20 rotate-[-15deg] z-20 backdrop-blur-sm" />
                            <div className="absolute -top-3 right-1/4 w-12 h-6 bg-white/40 border border-black/20 rotate-[15deg] z-20 backdrop-blur-sm" />

                            <div className={`${rotation} ${bgColor} border-[3px] border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.4)] transition-transform group-hover/poster:scale-105 group-hover/poster:rotate-0 relative z-10`}>
                                <div className="space-y-4">
                                    <div className="border-b-2 border-black/20 pb-2 flex justify-between items-start">
                                        <h4 className="text-lg font-black text-black uppercase leading-tight tracking-tighter">
                                            {goal.name}
                                        </h4>
                                        <Link2 className="w-4 h-4 text-black/40" />
                                    </div>

                                    {goal.description && (
                                        <p className="text-xs font-bold text-black/60 uppercase leading-snug line-clamp-2">
                                            {goal.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded rotate-[-2deg]">
                                            CLASSIFIED
                                        </div>
                                        <div className="text-[10px] font-bold text-black/40 uppercase">
                                            Target: {goal.target_end_date ? new Date(goal.target_end_date).toLocaleDateString() : 'TBD'}
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Shadow for paper feel */}
                                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
                            </div>
                        </Link>
                    );
                })}

                {goals.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                        <Target className="w-16 h-16 mx-auto text-white" />
                        <p className="text-sm font-black uppercase tracking-widest text-white">No Mission Objectives on the Wall</p>
                    </div>
                )}
            </div>
        </div>
    );
}
