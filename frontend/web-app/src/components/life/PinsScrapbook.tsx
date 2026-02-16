"use client";

import { Pin } from "@/lib/types/life";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PinsScrapbookProps {
    pins: Pin[];
    onEdit: (pin: Pin) => void;
}

export default function PinsScrapbook({ pins, onEdit }: PinsScrapbookProps) {
    // 2 pages at a time (spread)
    // For simplicity, let's say 4 items per page, so 8 items per spread.
    const ITEMS_PER_PAGE = 4;
    const ITEMS_PER_SPREAD = ITEMS_PER_PAGE * 2;

    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const totalSpreads = Math.ceil(pins.length / ITEMS_PER_SPREAD) || 1;

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
    const currentItems = pins.slice(startIdx, startIdx + ITEMS_PER_SPREAD);

    const leftPageItems = currentItems.slice(0, ITEMS_PER_PAGE);
    const rightPageItems = currentItems.slice(ITEMS_PER_PAGE, ITEMS_PER_SPREAD);

    // Helper to generate consistent random rotation based on ID
    const getRotation = (id: string) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash % 10) - 5; // -5 to 5 degrees
    };

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
                <div className="flex-1 p-8 relative bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-blend-multiply">
                    <div className="grid grid-cols-2 grid-rows-2 gap-8 h-full">
                        {leftPageItems.map((pin) => (
                            <ScrapbookItem key={pin.id} pin={pin} rotation={getRotation(pin.id)} onEdit={onEdit} />
                        ))}
                    </div>
                    {/* Page Number */}
                    <div className="absolute bottom-4 left-4 font-serif text-muted-foreground/50 text-sm">
                        {currentPageIndex * 2 + 1}
                    </div>
                </div>

                {/* Right Page */}
                <div className="flex-1 p-8 relative bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-blend-multiply border-l border-[#f0f0f0]">
                    <div className="grid grid-cols-2 grid-rows-2 gap-8 h-full">
                        {rightPageItems.map((pin) => (
                            <ScrapbookItem key={pin.id} pin={pin} rotation={getRotation(pin.id)} onEdit={onEdit} />
                        ))}
                    </div>
                    {/* Page Number */}
                    <div className="absolute bottom-4 right-4 font-serif text-muted-foreground/50 text-sm">
                        {currentPageIndex * 2 + 2}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScrapbookItem({ pin, rotation, onEdit }: { pin: Pin, rotation: number, onEdit: (pin: Pin) => void }) {
    return (
        <motion.div
            className="relative group cursor-pointer"
            style={{ rotate: rotation }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            onClick={() => onEdit(pin)}
        >
            {/* Tape */}
            <div className="absolute -top-3 left-1/2 -ml-4 w-8 h-3 bg-[#e8e8e8]/80 rotate-[-2deg] shadow-sm z-20 backdrop-blur-[1px]" />

            {pin.image_url ? (
                // Polaroid Style
                <div className="bg-white p-3 pt-3 pb-8 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                    <div className="aspect-square bg-gray-100 overflow-hidden mb-2 filter sepia-[0.2]">
                        <img src={pin.image_url} alt={pin.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-handwriting text-center text-gray-700 leading-tight">
                        <span className="font-bold block text-lg">{pin.name}</span>
                        {pin.visited_at && <span className="text-xs text-gray-500">{new Date(pin.visited_at).toLocaleDateString()}</span>}
                    </div>
                </div>
            ) : (
                // Sticky Note Style
                <div className={`p-6 shadow-md hover:shadow-xl transition-shadow h-full flex flex-col justify-between
                    ${pin.type === 'favorite' ? 'bg-[#fffdc9]' :
                        pin.type === 'home' ? 'bg-[#ffc9c9]' :
                            pin.type === 'work' ? 'bg-[#c9e4ff]' : 'bg-[#e3ffc9]'}
                `}>
                    <div className="font-handwriting text-gray-800">
                        <h3 className="font-bold text-xl mb-2">{pin.name}</h3>
                        <p className="text-sm leading-relaxed opacity-80 line-clamp-4">{pin.notes || "No notes for this memory..."}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-end opacity-50">
                        <MapPin className="h-4 w-4" />
                    </div>
                </div>
            )}
        </motion.div>
    )
}
