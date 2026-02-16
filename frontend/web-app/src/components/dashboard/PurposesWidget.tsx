import { Purpose } from "@/lib/types/life";
import { Cloud, Quote } from "lucide-react";

interface PurposesWidgetProps {
    purposes: Purpose[];
}

export function PurposesWidget({ purposes }: PurposesWidgetProps) {
    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#66CCFF] rounded-lg border-2 border-black rotate-[-1deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Cloud className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[1px_1px_rgba(0,0,0,1)]">
                    The Why
                </h3>
            </div>

            <div className="flex-1 bg-[#87CEEB] dark:bg-[#0F172A] border-[3px] border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[300px] transition-colors duration-500">
                {/* Cartoon Clouds Background (Light Mode) */}
                <div className="absolute top-4 left-4 w-20 h-10 bg-white/40 rounded-full blur-md dark:hidden" />
                <div className="absolute bottom-8 right-8 w-32 h-16 bg-white/30 rounded-full blur-xl dark:hidden" />

                {/* Stars Background (Dark Mode) */}
                <div className="absolute inset-0 hidden dark:block">
                    <div className="absolute top-4 left-10 w-1 h-1 bg-white rounded-full animate-pulse" />
                    <div className="absolute top-12 right-20 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse delay-75" />
                    <div className="absolute bottom-10 left-8 w-1 h-1 bg-white rounded-full animate-pulse delay-150" />
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full" />
                    <div className="absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-pulse delay-300" />
                </div>

                <div className="relative z-10 space-y-6">
                    {purposes.map((p, i) => (
                        <div key={p.id} className="relative group/purpose">
                            {/* Thought Bubble Shape */}
                            <div className="bg-white dark:bg-slate-800 border-[3px] border-black rounded-[2rem] p-4 relative shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-colors">
                                <Quote className="w-4 h-4 text-sky-400 dark:text-sky-300 mb-1" />
                                <h4 className="text-sm font-black text-black dark:text-white uppercase">{p.title}</h4>
                                {p.description && (
                                    <p className="text-[10px] font-bold text-black/60 dark:text-white/60 leading-tight mt-1 line-clamp-2">
                                        {p.description}
                                    </p>
                                )}

                                {/* Bubble Tail Circles */}
                                <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white dark:bg-slate-800 border-[2px] border-black rounded-full transition-colors" />
                                <div className="absolute -bottom-4 left-4 w-2 h-2 bg-white dark:bg-slate-800 border-[2px] border-black rounded-full transition-colors" />
                            </div>
                        </div>
                    ))}

                    {purposes.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 opacity-50">
                            <Cloud className="w-16 h-16 text-white mb-2" />
                            <p className="text-sm font-black text-white uppercase tracking-widest">Head Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
