"use client";

import { Love } from "@/lib/types/life";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface LovesScrapbookProps {
    loves: Love[];
    onEdit: (love: Love) => void;
}

export default function LovesScrapbook({ loves, onEdit }: LovesScrapbookProps) {
    // 1 item per page for Loves to give more space for details and pins
    // So 2 items per spread
    const ITEMS_PER_PAGE = 1;
    const ITEMS_PER_SPREAD = ITEMS_PER_PAGE * 2;

    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const totalSpreads = Math.ceil(loves.length / ITEMS_PER_SPREAD) || 1;

    const nextSpread = () => {
        if (currentPageIndex < totalSpreads - 1) {
            setCurrentPageIndex(prev => prev + 1);
        }
    };

    const prevSpread = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    // Get items for current spread
    const startIdx = currentPageIndex * ITEMS_PER_SPREAD;
    const currentItems = loves.slice(startIdx, startIdx + ITEMS_PER_SPREAD);

    const leftPageItem = currentItems[0];
    const rightPageItem = currentItems[1];

    return (
        <div className="w-full flex flex-col items-center gap-6 py-8">
            <div className="flex items-center gap-4 text-muted-foreground">
                <Button variant="ghost" disabled={currentPageIndex === 0} onClick={prevSpread}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous Pages
                </Button>
                <span>Spread {currentPageIndex + 1} of {totalSpreads}</span>
                <Button variant="ghost" disabled={currentPageIndex >= totalSpreads - 1} onClick={nextSpread}>
                    Next Pages <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl aspect-[3/2] bg-[#fdfbf7] rounded-sm shadow-2xl flex border border-[#e5e0d8] overflow-hidden perspective-1000">
                {/* Binding Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-black/10 to-transparent z-20 pointer-events-none mix-blend-multiply" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#dcdcdc] z-10" />

                {/* Left Page */}
                <div className="flex-1 p-12 relative bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-blend-multiply flex items-center justify-center">
                    {leftPageItem && <ScrapbookLoveItem love={leftPageItem} onEdit={onEdit} rotation={-2} />}

                    {/* Page Number */}
                    <div className="absolute bottom-4 left-4 font-serif text-muted-foreground/50 text-sm">
                        {currentPageIndex * 2 + 1}
                    </div>
                </div>

                {/* Right Page */}
                <div className="flex-1 p-12 relative bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-blend-multiply border-l border-[#f0f0f0] flex items-center justify-center">
                    {rightPageItem && <ScrapbookLoveItem love={rightPageItem} onEdit={onEdit} rotation={3} />}

                    {/* Page Number */}
                    <div className="absolute bottom-4 right-4 font-serif text-muted-foreground/50 text-sm">
                        {currentPageIndex * 2 + 2}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScrapbookLoveItem({ love, rotation, onEdit }: { love: Love, rotation: number, onEdit: (love: Love) => void }) {
    return (
        <motion.div
            className="relative group cursor-pointer w-full max-w-md"
            style={{ rotate: rotation }}
            whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
            onClick={() => onEdit(love)}
        >
            {/* Washi Tape */}
            <div className="absolute -top-4 left-1/2 -ml-10 w-20 h-6 bg-[#ffb7b2]/80 rotate-[-1deg] shadow-sm z-20 backdrop-blur-[1px] opacity-90" />

            <div className="bg-white p-4 pt-8 pb-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 rotate-[1deg]">
                <div className="flex flex-col gap-4">
                    {/* Photo Area */}
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden border-4 border-white shadow-inner relative">
                        {love.avatar_url ? (
                            <img src={love.avatar_url} alt={love.name} className="w-full h-full object-cover filter contrast-[1.1] sepia-[0.1]" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                <Heart className="h-20 w-20 opacity-20" />
                            </div>
                        )}

                        {/* Overlay relationship badge */}
                        <div className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 text-xs font-handwriting shadow-sm rotate-[-2deg]">
                            {love.relationship}
                        </div>
                    </div>

                    {/* Text Area */}
                    <div className="font-handwriting text-center text-gray-800 space-y-2 mt-2">
                        <h2 className="text-3xl font-bold text-gray-900">{love.name}</h2>
                        {love.birthday && (
                            <p className="text-sm text-gray-500">Born: {new Date(love.birthday).toLocaleDateString()}</p>
                        )}
                        {love.notes && (
                            <p className="text-base leading-relaxed text-gray-600 mt-4 px-4 relative">
                                <span className="absolute -left-2 -top-2 text-4xl text-gray-200 font-serif leading-none">“</span>
                                {love.notes}
                                <span className="absolute -right-2 -bottom-4 text-4xl text-gray-200 font-serif leading-none">”</span>
                            </p>
                        )}
                    </div>

                    {/* Associated Pins (Stickers) */}
                    {love.pins && love.pins.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                            <p className="text-xs font-handwriting text-gray-400 mb-2 center">Our Places:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {love.pins.map((pin, i) => (
                                    <div key={pin.id} className="bg-[#fff9c4] text-gray-800 px-2 py-1 text-xs font-handwriting shadow-sm rotate-[var(--r)] border border-yellow-200/50" style={{ '--r': `${(i % 2 === 0 ? 2 : -2)}deg` } as any}>
                                        📍 {pin.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
