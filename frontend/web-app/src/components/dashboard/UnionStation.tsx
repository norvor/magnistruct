"use client";

import { useJourneys, useGoals, useWorkItems } from "@/lib/hooks/usePM";
import { Goal } from "@/lib/types/pm";
import { usePurposes, useLoves, usePins } from "@/lib/hooks/useLife";
import { UnionUnifiedView } from "./UnionUnifiedView";
import { Loader2, TrainFront } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function UnionStation() {
    // 1. Fetch all PM data
    const { data: journeys, isLoading: loadingJourneys } = useJourneys();
    const { data: goals, isLoading: loadingGoals } = useGoals();
    const { data: actions, isLoading: loadingActions } = useWorkItems();

    // 2. Fetch all Life data
    const { data: purposes, isLoading: loadingPurposes } = usePurposes();
    const { data: loves, isLoading: loadingLoves } = useLoves();
    const { data: pins, isLoading: loadingPins } = usePins();

    const isLoading = loadingJourneys || loadingGoals || loadingActions || loadingPurposes || loadingLoves || loadingPins;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Reality Union...</p>
            </div>
        );
    }

    // --- THE GRAND UNION (RELATION-BASED) ---

    // --- THE HYPER-ROBUST UNION (RELATION-BASED) ---

    // 1. Current Journeys (The Anchor)
    const currentJourneys = journeys?.filter(j => {
        const s = (j.status || '').toLowerCase();
        const isCurrent = ['active', 'current', 'planned', 'upcoming'].includes(s);

        // Secondary check: Are we currently inside the dates?
        if (j.start_date && j.end_date) {
            const now = new Date();
            const start = new Date(j.start_date);
            const end = new Date(j.end_date);
            if (start <= now && end >= now) return true;
        }
        return isCurrent;
    }) || [];

    // 2. DISCOVERY: The Triple-Redundant Collector
    const goalsMap = new Map<string, Goal>();
    const activeJourneyIds = new Set(currentJourneys.map(j => j.id));

    // A. Direct & Compartment Discovery (From Journey side)
    currentJourneys.forEach(j => {
        // Direct link
        const dId = j.goal_id || (j as any).goalId || (j as any).goalID;
        if (dId && !goalsMap.has(dId)) {
            goalsMap.set(dId, { id: dId, name: j.goal_name || 'Strategic Objective', status: 'active' } as any);
        }

        // Compartment links
        j.compartments?.forEach(c => {
            if (c && (c.id || (c as any).ID)) {
                const cid = c.id || (c as any).ID;
                if (!goalsMap.has(cid)) goalsMap.set(cid, c);
            }
        });
    });

    // B. Reverse Discovery (From Global Goals side)
    goals?.forEach(g => {
        const gId = g.id;
        const gJourneyId = g.journey_id || (g as any).journeyId || (g as any).journeyID;

        // If this goal specifically mentions an active journey, or we found a skeleton for it
        if ((gJourneyId && activeJourneyIds.has(gJourneyId)) || goalsMap.has(gId)) {
            const existing = goalsMap.get(gId) || {};
            goalsMap.set(gId, { ...existing, ...g });
        }
    });

    const linkedGoals = Array.from(goalsMap.values());
    const finalGoalIds = new Set(linkedGoals.map(g => g.id));

    // 3. Actions (Achievement Plan - Linked to discovered goals)
    // 3. Actions (Achievement Plan - Linked to discovered goals OR active journeys)
    const activeActions = actions?.filter(a => {
        const gId = a.goal_id || (a as any).goalId || (a as any).goalID;
        const jId = a.journey_id || (a as any).journeyId || (a as any).journeyID;
        const status = (a.status || '').toLowerCase();
        const isCurrent = !['done', 'completed', 'archived'].includes(status);

        const isLinkedToGoal = gId && finalGoalIds.has(gId);
        const isLinkedToJourney = jId && activeJourneyIds.has(jId);

        return isCurrent && (isLinkedToGoal || isLinkedToJourney);
    }) || [];

    // LOUD DEBUG LOGS
    console.log("🚨 [UnionStation] CRITICAL DISCOVERY LOG 🚨");
    console.log("- Active Journeys:", currentJourneys.length, currentJourneys.map(j => j.name));
    console.log("- Discovered Goals:", linkedGoals.length, linkedGoals.map(g => g.name));
    console.log("- Active Actions:", activeActions.length);
    if (currentJourneys.length > 0 && linkedGoals.length === 0) {
        console.warn("⚠️ WARNING: We have active journeys but NO goals were discovered. Check 'goal_id' and 'compartments' in the log below.");
        console.dir(currentJourneys);
    }

    // 4. Purposes Linked to these Goals
    const linkedPurposeIds = new Set(linkedGoals.map(g => (g as any).purpose_id || (g as any).purposeId).filter(Boolean));
    const linkedPurposes = purposes?.filter(p => linkedPurposeIds.has(p.id)) || [];

    // 5. Loves Linked to these Purposes
    const linkedLoves = loves?.filter(l =>
        linkedPurposes.some(p => {
            const pLoves = (p as any).loves || [];
            return pLoves.some((pl: any) => pl.id === l.id);
        })
    ) || [];

    // 6. Pins Linked to these Loves
    const linkedPins = pins?.filter(p =>
        linkedLoves.some(l => {
            const lPins = (l as any).pins || [];
            return lPins.some((lp: any) => lp.id === p.id);
        })
    ) || [];

    const hasAnyData = currentJourneys.length > 0;

    if (!hasAnyData) {
        return (
            <GlassCard intensity="low" className="p-12 text-center flex flex-col items-center gap-4">
                <TrainFront className="w-12 h-12 text-muted-foreground/20" />
                <div>
                    <h3 className="text-xl font-bold">Station Quiet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                        You don't have any active Journeys. Start a new season to see your life converge here.
                    </p>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-12">
            <UnionUnifiedView
                activeJourneys={currentJourneys}
                goals={linkedGoals}
                actions={activeActions}
                purposes={linkedPurposes}
                loves={linkedLoves}
                pins={linkedPins}
            />
        </div>
    );
}
