"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useGoal, useUpdateGoalStep, useCreateWorkItem } from "@/lib/hooks/usePM";
import { usePurposes } from "@/lib/hooks/useLife";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { GoalPlant } from "@/components/pm/GoalPlant";
import { CheckCircle2, Circle, Lightbulb, Target, Sparkles, Pencil, ArrowLeft, Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { EditGoalModal } from "@/components/pm/modals/EditGoalModal";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function GoalOverviewPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: goal, isLoading } = useGoal(id);
    const { data: purposes } = usePurposes();
    const updateStep = useUpdateGoalStep();
    const createWorkItem = useCreateWorkItem();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newStepTitle, setNewStepTitle] = useState("");

    const associatedPurpose = purposes?.find(p => p.id === goal?.purpose_id);

    const handleToggleStep = async (stepId: string, isDone: boolean) => {
        await updateStep.mutateAsync({ stepId, data: { is_done: isDone } });
        if (isDone) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
    };

    const handleAddStep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStepTitle.trim()) return;

        await createWorkItem.mutateAsync({
            title: newStepTitle.trim(),
            goal_id: id,
            status: "todo",
            type: "action",
        });
        setNewStepTitle("");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!goal) return null;

    const totalSteps = goal.stats?.total_count || 0;
    const completedStepsCount = goal.stats?.done_count || 0;

    // Calculate plant stage (0-5) based on percentage
    const plantStage = totalSteps > 0
        ? Math.min(5, Math.floor((completedStepsCount / totalSteps) * 5))
        : 0;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Header / Actions */}


            {/* Desktop View: Side-by-Side */}
            <div className="hidden md:grid grid-cols-12 gap-8 items-start">
                {/* Left: Growth (Plant) */}
                <div className="col-span-12 lg:col-span-5 space-y-6 sticky top-24">
                    <div className="relative p-8 lg:p-12 rounded-[2.5rem] border border-border/20 bg-card/10 backdrop-blur-3xl shadow-2xl overflow-visible">
                        {/* Immersive Nature Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none rounded-[2.5rem]" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none rounded-[2.5rem]" />

                        <div className="flex flex-col items-center justify-center text-center space-y-8 relative z-10">
                            <div className="relative group transition-all duration-1000 hover:scale-105">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                                <div className="relative z-10 p-10 lg:p-12 rounded-full bg-card/20 border border-border/20 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                                    <div className="scale-[2.0] lg:scale-[2.2] origin-center -translate-y-2">
                                        <GoalPlant stage={plantStage} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-4">
                                    <motion.div
                                        key={plantStage}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-md"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Stage {plantStage} of 5
                                    </motion.div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditOpen(true)}
                                        className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Details
                                    </Button>
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter text-foreground">
                                    {plantStage === 5 ? "In Full Bloom" :
                                        plantStage >= 3 ? "Gaining Vitality" :
                                            plantStage >= 1 ? "Taking Hold" : "Awaiting Growth"}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* The Why (Context) - Integrated under plant on desktop */}
                    {associatedPurpose && (
                        <div className="p-8 rounded-[2rem] border border-yellow-500/10 bg-yellow-500/[0.02] relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-yellow-500/10">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-yellow-500/80">The Why</span>
                            </div>
                            <h4 className="font-bold text-foreground text-base mb-2">{associatedPurpose.title}</h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                "{associatedPurpose.description}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Plan (Steps) */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground">Achievement Plan</h3>
                        </div>
                        <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                            {completedStepsCount}/{totalSteps} Done
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <form onSubmit={handleAddStep} className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <Input
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                placeholder="Add a new milestone to your plan..."
                                className="h-16 pl-14 bg-card/10 border-border/20 rounded-2xl focus:bg-card/20 transition-all placeholder:text-muted-foreground/50"
                            />
                            {newStepTitle.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute right-4 inset-y-0 flex items-center"
                                >
                                    <Button type="submit" size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl h-8">
                                        Add Step
                                    </Button>
                                </motion.div>
                            )}
                        </form>

                        <AnimatePresence mode="popLayout">
                            {goal.steps?.map((step) => (
                                <motion.div
                                    key={step.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <GlassCard
                                        variant={step.is_done ? "active" : "hover"}
                                        onClick={() => handleToggleStep(step.id, !step.is_done)}
                                        className={`group flex items-center gap-6 p-6 cursor-pointer border-border/20 transition-all duration-300 ${step.is_done ? 'bg-emerald-500/5' : ''
                                            }`}
                                        intensity="medium"
                                    >
                                        <div className={`shrink-0 transition-all duration-300 ${step.is_done
                                            ? 'text-emerald-500 scale-110'
                                            : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                                            }`}>
                                            {step.is_done ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7 stroke-[1px]" />}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <span className={`text-base font-medium transition-all duration-300 ${step.is_done ? 'text-emerald-500/60 line-through' : 'text-foreground group-hover:text-primary'
                                                }`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile View: Tabs */}
            <div className="md:hidden">
                <Tabs defaultValue="growth" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 bg-card/20 border border-border/20 rounded-2xl h-12 p-1">
                        <TabsTrigger value="growth" className="rounded-xl data-[state=active]:bg-card/20">Growth</TabsTrigger>
                        <TabsTrigger value="plan" className="rounded-xl data-[state=active]:bg-card/20">Plan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="growth" className="space-y-8 outline-none">
                        <div className="relative p-8 lg:p-10 rounded-[2.5rem] border border-border/20 bg-card/10 backdrop-blur-3xl shadow-xl overflow-visible">
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="scale-[1.6] lg:scale-[1.8] py-8">
                                    <GoalPlant stage={plantStage} />
                                </div>
                                <div className="space-y-2 pb-4">
                                    <h2 className="text-2xl font-black tracking-tighter text-foreground">
                                        {plantStage === 5 ? "In Full Bloom" :
                                            plantStage >= 3 ? "Gaining Vitality" :
                                                plantStage >= 1 ? "Taking Hold" : "Awaiting Growth"}
                                    </h2>
                                    <p className="text-muted-foreground text-sm font-medium">{goal.name}</p>
                                </div>
                            </div>
                        </div>

                        {associatedPurpose && (
                            <div className="p-6 rounded-[2rem] border border-yellow-500/10 bg-yellow-500/[0.02]">
                                <h4 className="font-bold text-yellow-500 text-sm mb-1 uppercase tracking-widest">The Why</h4>
                                <p className="text-muted-foreground italic text-sm">"{associatedPurpose.description}"</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="plan" className="space-y-6 outline-none">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">Achievement Plan</h3>
                            <span className="text-xs font-bold text-emerald-400">{completedStepsCount}/{totalSteps}</span>
                        </div>

                        <form onSubmit={handleAddStep} className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                                <Plus className="w-5 h-5" />
                            </div>
                            <Input
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                placeholder="Add step..."
                                className="h-12 pl-12 bg-card/20 border-border/20 rounded-xl"
                            />
                        </form>

                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence mode="popLayout">
                                {goal.steps?.map((step) => (
                                    <motion.div
                                        key={step.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <GlassCard
                                            variant={step.is_done ? "active" : "hover"}
                                            onClick={() => handleToggleStep(step.id, !step.is_done)}
                                            className={`flex items-center gap-4 p-5 cursor-pointer border-border/20 group ${step.is_done ? 'bg-emerald-500/5' : ''}`}
                                            intensity="medium"
                                        >
                                            <div className={step.is_done ? 'text-emerald-500' : 'text-muted-foreground'}>
                                                {step.is_done ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 stroke-[1px]" />}
                                            </div>
                                            <span className={`text-sm font-medium ${step.is_done ? 'text-emerald-400/60 line-through' : 'text-foreground'}`}>
                                                {step.title}
                                            </span>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <EditGoalModal
                goal={goal}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </div>
    );
}
