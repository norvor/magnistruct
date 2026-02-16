import { Pin } from "@/lib/types/life";
import { MapPin, Navigation } from "lucide-react";

interface PinsWidgetProps {
    pins: Pin[];
}

export function PinsWidget({ pins }: PinsWidgetProps) {
    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#66CC00] rounded-lg border-2 border-black rotate-[-2deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[1px_1px_rgba(0,0,0,1)]">
                    The Town
                </h3>
            </div>

            <div className="flex-1 bg-[#88CC88] dark:bg-[#14532D] border-[3px] border-black p-0 rounded-[2rem] shadow-[6px_6px_0px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[300px] transition-colors duration-500">
                {/* Grass texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Simple Roads */}
                <div className="absolute top-1/2 left-0 right-0 h-16 bg-[#555] dark:bg-[#333] border-y-[3px] border-black transform -skew-y-3 z-0 transition-colors">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-[2px] border-dashed border-yellow-400" />
                </div>
                <div className="absolute top-0 bottom-0 left-1/3 w-16 bg-[#555] dark:bg-[#333] border-x-[3px] border-black transform skew-x-6 z-0 transition-colors" />

                <div className="relative z-10 p-6 grid grid-cols-2 gap-4">
                    {pins.map((pin, i) => (
                        <div key={pin.id} className="flex items-center gap-2 group/pin cursor-pointer hover:scale-105 transition-transform">
                            {/* Pin Icon - South Park Style */}
                            <div className="w-8 h-8 bg-[#FF3333] border-[2px] border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] relative z-10">
                                <div className="w-2 h-2 bg-black rounded-full opacity-30" />
                                {/* Pin Point */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black translate-y-0.5" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#FF3333]" />
                            </div>

                            {/* Label */}
                            <div className="bg-white dark:bg-slate-800 border-2 border-black px-2 py-1 rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-colors">
                                <p className="text-[10px] font-black uppercase leading-none text-black dark:text-white transition-colors">{pin.name}</p>
                            </div>
                        </div>
                    ))}

                    {pins.length === 0 && (
                        <div className="col-span-2 flex flex-col items-center justify-center pt-10 opacity-40">
                            <Navigation className="w-12 h-12 text-black dark:text-white mb-2" />
                            <p className="text-xs font-black text-black dark:text-white uppercase">Lost in the Woods</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
