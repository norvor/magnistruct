"use client";

import { Journey, Goal, WorkItem } from "@/lib/types/pm";
import { Purpose, Love, Pin } from "@/lib/types/life";
import { UnionNode } from "./UnionNode";
import {
    Flag,
    Target,
    Zap,
    Heart,
    MapPin,
    Compass,
    Sparkles,
    Link2,
    Calendar,
    Quote,
    Users,
    Navigation,
    Activity,
    TrainFront,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { GoalPosterWall } from "./GoalPosterWall";
import { PurposesWidget } from "./PurposesWidget";
import { LovesWidget } from "./LovesWidget";
import { PinsWidget } from "./PinsWidget";

interface UnionUnifiedViewProps {
    activeJourneys: Journey[];
    goals: Goal[];
    actions: WorkItem[];
    purposes: Purpose[];
    loves: Love[];
    pins: Pin[];
}

export function UnionUnifiedView({
    activeJourneys,
    goals,
    actions,
    purposes,
    loves,
    pins
}: UnionUnifiedViewProps) {
    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">

            {/* --- SOUTH PARK STYLE ACTIVE JOURNEYS --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#FFCC00] rounded-lg border-2 border-black rotate-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <TrainFront className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-[system-ui] font-black uppercase tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Active Journeys</h2>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-8 px-4 items-end">
                    {activeJourneys.map((j, i) => {
                        const colors = ['bg-[#00CCFF]', 'bg-[#FF9900]', 'bg-[#66CC00]', 'bg-[#FF3366]'];
                        const busColor = colors[i % colors.length];

                        return (
                            <Link key={j.id} href={`/dashboard/journeys/${j.id}`} className="block relative group/journey flex flex-col items-center">
                                {/* South Park "Season Bus" - Smaller Version */}
                                <div className={`relative ${busColor} border-[3px] border-black p-4 rounded-t-2xl min-w-[200px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] transform transition-transform group-hover/journey:-translate-y-2`}>

                                    {/* Journey Content */}
                                    <div className="bg-black/20 p-2 rounded-xl border border-black/30 text-center mt-2">
                                        <h4 className="text-base font-black text-white uppercase tracking-tighter drop-shadow-[1px_1px_rgba(0,0,0,1)]">{j.name}</h4>
                                    </div>

                                    {/* Small Headlights */}
                                    <div className="absolute -bottom-1 left-3 w-3 h-3 rounded-full bg-yellow-100 border-2 border-black" />
                                    <div className="absolute -bottom-1 right-3 w-3 h-3 rounded-full bg-yellow-100 border-2 border-black" />
                                </div>

                                {/* Smaller Wheels */}
                                <div className="flex justify-between w-[80%] -mt-2 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-[#333] border-[3px] border-black flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-500 border border-black" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#333] border-[3px] border-black flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-500 border border-black" />
                                    </div>
                                </div>

                                {/* Track shadow */}
                                <div className="w-full h-1 bg-black/20 rounded-full mt-2 blur-sm scale-x-110" />
                            </Link>
                        );
                    })}

                    {activeJourneys.length === 0 && (
                        <div className="py-10 flex flex-col items-center gap-4 opacity-40 grayscale px-6">
                            <div className="w-24 h-16 bg-gray-400 border-4 border-black rounded-t-3xl relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black">??</div>
                            </div>
                            <p className="text-sm font-black uppercase">Station Empty...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- TWO COLUMN WIDGETS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-4">

                {/* 1. LEFT COLUMN: UNIVERSAL TASK WIDGET */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF3366] rounded-lg border-2 border-black rotate-[-2deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[1px_1px_rgba(0,0,0,1)]">Mission Directives</h3>
                    </div>

                    <div className="bg-[#FFFFCC] border-[3px] border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[500px]">
                        {/* Paper Lines background */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00C 0.05em, transparent 0.05em)', backgroundSize: '100% 2rem' }} />

                        <div className="relative z-10 space-y-4">
                            {actions.map((action: any) => (
                                <Link key={action.id} href={`/dashboard/actions/${action.id}`} className="block group/task">
                                    <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-0.5 transition-all">
                                        <div className="mt-1 w-4 h-4 rounded-sm border-2 border-black bg-gray-100 flex-shrink-0 group-hover/task:bg-[#66CC00] transition-colors" />
                                        <div className="space-y-0.5 overflow-hidden">
                                            <p className="text-sm font-black text-black uppercase tracking-tighter truncate">{action.title}</p>
                                            <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">{action.status}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {actions.length === 0 && (
                                <div className="py-20 text-center space-y-3 opacity-20">
                                    <Zap className="w-10 h-10 mx-auto text-black" />
                                    <p className="text-xs font-black uppercase">Directives Off-Line</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: OTHER PILLARS */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Objectives Section */}
                    <GoalPosterWall goals={goals} />

                    {/* South Park Life Widgets */}
                    {/* South Park Life Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">
                        <div className="md:col-span-1 h-[300px] md:h-full">
                            <PurposesWidget purposes={purposes} />
                        </div>
                        <div className="md:col-span-1 h-[300px] md:h-full">
                            <LovesWidget loves={loves} />
                        </div>
                        <div className="md:col-span-1 h-[300px] md:h-full">
                            <PinsWidget pins={pins} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
