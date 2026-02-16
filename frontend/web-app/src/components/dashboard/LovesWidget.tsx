import { Love } from "@/lib/types/life";
import { Heart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LovesWidgetProps {
    loves: Love[];
}

export function LovesWidget({ loves }: LovesWidgetProps) {
    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF3366] rounded-lg border-2 border-black rotate-[2deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[1px_1px_rgba(0,0,0,1)]">
                    The Squad
                </h3>
            </div>

            <div className="flex-1 bg-white dark:bg-[#1E293B] border-[3px] border-black p-0 rounded-[2rem] shadow-[6px_6px_0px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[300px] flex flex-col transition-colors duration-500">
                {/* Snowy Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#FFFFFF] dark:from-[#0F172A] dark:to-[#1E293B] z-0 transition-colors duration-500" />

                {/* Simple Mountains */}
                <div className="absolute top-10 left-0 right-0 h-32 flex items-end opacity-50 z-0">
                    <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-700 clip-triangle transition-colors" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    <div className="w-1/2 h-3/4 bg-slate-300 dark:bg-slate-600 clip-triangle -ml-10 transition-colors" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-700 clip-triangle -ml-10 transition-colors" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                </div>

                {/* Bus Stop Sign */}
                <div className="absolute top-8 right-8 z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center rotate-12 shadow-sm">
                        <span className="font-black text-[10px] text-center leading-none">BUS<br />STOP</span>
                    </div>
                    <div className="w-2 h-20 bg-[#4a3b32] border-x-2 border-black -mt-1" />
                </div>

                {/* Characters Waiting */}
                <div className="flex-1 relative z-20 flex items-end justify-center pb-8 gap-4 px-6 overflow-x-auto">
                    {loves.map((love, i) => {
                        // Randomize parka colors for that South Park look
                        const parkaColors = ['bg-[#FF5733]', 'bg-[#33FF57]', 'bg-[#3357FF]', 'bg-[#F3FF33]'];
                        const color = parkaColors[i % parkaColors.length];

                        return (
                            <div key={love.id} className="flex flex-col items-center gap-1 group/char min-w-[60px]">
                                {/* Character Head */}
                                <div className={`w-12 h-12 rounded-full border-[3px] border-black ${color} relative flex items-center justify-center shadow-md group-hover/char:-translate-y-1 transition-transform`}>
                                    {/* Face hole */}
                                    <div className="w-8 h-8 bg-[#FFCCAA] rounded-full border-2 border-black/50" />
                                    {/* Eyes (simple) */}
                                    <div className="absolute top-4 left-3 w-1.5 h-2 bg-white rounded-full border border-black"><div className="w-0.5 h-0.5 bg-black rounded-full absolute top-0.5 right-0.5" /></div>
                                    <div className="absolute top-4 right-3 w-1.5 h-2 bg-white rounded-full border border-black"><div className="w-0.5 h-0.5 bg-black rounded-full absolute top-0.5 left-0.5" /></div>
                                </div>
                                {/* Body */}
                                <div className={`w-14 h-10 ${color} border-[3px] border-black rounded-t-xl -mt-2 z-[-1] shadow-sm`} />
                                {/* Feet */}
                                <div className="flex gap-2 -mt-1">
                                    <div className="w-4 h-3 bg-black rounded-full" />
                                    <div className="w-4 h-3 bg-black rounded-full" />
                                </div>

                                {/* Name Tag */}
                                <div className="mt-1 bg-white dark:bg-slate-800 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight text-black dark:text-white transition-colors">
                                    {love.name}
                                </div>
                            </div>
                        );
                    })}
                    {loves.length === 0 && (
                        <div className="text-center opacity-40 mb-10">
                            <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">No one at the stop</p>
                        </div>
                    )}
                </div>

                {/* Snowy Ground */}
                <div className="absolute bottom-0 w-full h-8 bg-white dark:bg-[#1E293B] border-t-[3px] border-black z-10 transition-colors" />
            </div>
        </div>
    );
}
