'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MagnistructLogo } from '@/components/ui/MagnistructLogo';
import {
    Target,
    Zap,
    BookOpen,
    ArrowRight,
    Star,
    Compass,
    Sunrise,
    CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const user = useSelector((state: any) => state.auth.user);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (!mounted || user) return null;

    return (
        <div className="min-h-screen bg-[#020205] text-white selection:bg-amber-500/30 overflow-x-hidden">
            {/* Starry Night to Dawn Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Night Sky */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020205] via-[#050510] to-[#1a1a3a]" />

                {/* Sunrise Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-amber-500/20 via-orange-500/10 to-transparent" />
                <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-amber-500/10 rounded-[100%] blur-[120px] opacity-60" />

                {/* Stars Component */}
                <Stars />

                {/* Grainy Noise Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] contrast-150 brightness-100 mix-blend-overlay" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/20 border-b border-white/5 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center gap-2">
                    <MagnistructLogo className="w-8 h-8 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Magnistruct</span>
                </div>
                <div className="hidden md:flex items-center gap-10">
                    <a href="#philosophy" className="text-sm font-medium text-white/50 hover:text-white transition-all hover:tracking-wider">Philosophy</a>
                    <a href="#features" className="text-sm font-medium text-white/50 hover:text-white transition-all hover:tracking-wider">OS Pillars</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-sm font-semibold hover:bg-white/5 rounded-full px-6">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-white text-black hover:bg-white/90 text-sm font-bold rounded-full px-8 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95">
                            Join Mission
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 z-10">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-amber-200/80 mb-10 shadow-inner backdrop-blur-md"
                    >
                        <Sunrise className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        A NEW DAWN IN PERSONAL MANAGEMENT
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] max-w-4xl"
                    >
                        Your Life, <br />
                        <span className="bg-gradient-to-b from-white via-white to-amber-200/40 bg-clip-text text-transparent">Mastered.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-2xl text-white/50 max-w-2xl mb-12 font-medium leading-relaxed"
                    >
                        Magnistruct is the life operating system designed to turn
                        vague intentions into legendary missions. From daily habits
                        to lifelong goals.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-5"
                    >
                        <Link href="/register">
                            <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-black rounded-full px-10 h-14 text-lg group shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95">
                                Start Your Mission
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full px-10 h-14 text-lg backdrop-blur-md transition-all">
                                Entry Point
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Preview Image / Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.8 }}
                        className="mt-24 relative w-full max-w-5xl group"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020205] to-transparent z-20" />
                        <div className="absolute -inset-4 bg-amber-500/10 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl p-3 shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-500">
                            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl">
                                <img
                                    src="/Users/apoorvbansal/.gemini/antigravity/brain/6e2a003c-8b9a-4df3-9e36-662eae0c95ee/life_manager_landing_hero_1771037205562.png"
                                    alt="Magnistruct Life OS"
                                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="py-32 px-6 relative z-10 bg-gradient-to-b from-transparent to-black/40">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-12"
                    >
                        The OS for High-Resolution Living.
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                                <Compass className="w-5 h-5" /> Direction over Motion
                            </h3>
                            <p className="text-white/50 leading-relaxed font-medium">
                                Most tools measure how busy you are. We measure how close you are to your missions.
                                Everything in Magnistruct leads back to a North Star goal.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                                <Star className="w-5 h-5" /> Compounding Habits
                            </h3>
                            <p className="text-white/50 leading-relaxed font-medium">
                                Success isn't an event, it's a routine. Our habit engine treats your rituals
                                as the atomic building blocks of your grandest missions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section id="features" className="py-24 px-6 relative z-10 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white/40 mb-4">Five Pillars of Sovereignty</h2>
                        <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <PillarCard
                            icon={<Target className="w-6 h-6 text-rose-500" />}
                            title="Missions"
                            desc="The grand architecture of your future. Multi-year goals broken down."
                        />
                        <PillarCard
                            icon={<Sunrise className="w-6 h-6 text-amber-500" />}
                            title="Journeys"
                            desc="Focal periods of high-intensity execution. Sprints for your life."
                        />
                        <PillarCard
                            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                            title="Actions"
                            desc="The granular, daily moves that build the momentum of victory."
                        />
                        <PillarCard
                            icon={<Zap className="w-6 h-6 text-indigo-500" />}
                            title="Habits"
                            desc="The automated rituals that define your character and energy."
                        />
                        <PillarCard
                            icon={<BookOpen className="w-6 h-6 text-sky-500" />}
                            title="Journal"
                            desc="The mirror of your soul. Reflect, learn, and iterate on your existence."
                        />
                    </div>
                </div>
            </section>

            {/* Final Call */}
            <section className="py-40 px-6 relative z-10 text-center overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full scale-150" />
                <motion.div
                    whileInView={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto relative"
                >
                    <h2 className="text-5xl md:text-7xl font-black mb-8 italic">Seize the Dawn.</h2>
                    <p className="text-xl text-white/50 mb-12 font-medium">
                        Your future is a construction project. Start building it with the
                        highest resolution tools available.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-white text-black font-black rounded-full px-12 h-16 text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
                            Initialize Magnistruct
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-[#010103] relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <MagnistructLogo className="w-7 h-7" />
                            <span className="text-xl font-black tracking-tighter">MAGNISTRUCT</span>
                        </div>
                        <p className="text-sm font-medium text-white/30 italic">Crafted for those who architect their own destiny.</p>
                    </div>
                    <div className="flex gap-12 text-sm font-bold text-white/20">
                        <a href="#" className="hover:text-amber-500 transition-colors uppercase tracking-widest">Twitter</a>
                        <a href="#" className="hover:text-amber-500 transition-colors uppercase tracking-widest">LinkedIn</a>
                        <a href="#" className="hover:text-amber-500 transition-colors uppercase tracking-widest">Discord</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Stars() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full"
                    initial={{
                        opacity: Math.random() * 0.5 + 0.2,
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: Math.random() * 0.8 + 0.2,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{
                        width: '1.5px',
                        height: '1.5px',
                    }}
                />
            ))}
        </div>
    );
}

function PillarCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.06)' }}
            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all duration-300 group"
        >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-white/10 transition-all">
                {icon}
            </div>
            <h3 className="text-lg font-black mb-3 italic uppercase tracking-tight">{title}</h3>
            <p className="text-white/40 text-sm font-medium leading-relaxed group-hover:text-white/60 transition-colors">{desc}</p>
        </motion.div>
    );
}
