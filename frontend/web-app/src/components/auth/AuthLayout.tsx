"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MagnistructLogo } from '@/components/ui/MagnistructLogo';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#030303] text-white selection:bg-primary/30 relative flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden">
            {/* Background Decorations - Sync with Landing Page */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
            </div>

            {/* Navbar for Logo & Home Link */}
            <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-center sm:justify-start">
                <Link href="/" className="flex items-center gap-2 group transition-all duration-300">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                        <MagnistructLogo className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:to-white transition-all">
                        Magnistruct
                    </span>
                </Link>
            </div>

            {/* Auth Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg z-10"
            >
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl shadow-black/50 overflow-hidden group">
                    {/* Inner Accent */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />

                    <div className="relative">
                        <div className="mb-10 space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                                {title}
                            </h1>
                            <p className="text-white/40 text-lg leading-relaxed">
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>

                {/* Footer Credits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-xs text-white/20 uppercase tracking-[0.2em] font-medium">
                        &copy; 2026 Norvor Platform Group
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
