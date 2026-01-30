<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import RadarChart from '$lib/components/charts/RadarChart.svelte';
    import VentureHelpModal from '$lib/components/dashboard/VentureHelpModal.svelte';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    let selectedTask: Task | null = null;
    let showHelp = false;

    $: bets = allTasks.filter(t => t.venture !== undefined);
    // Auto-select first if none selected
    $: if (!selectedTask && bets.length > 0) selectedTask = bets[0];

    const STAGES = ['discovery', 'validation', 'prototype', 'scale'];
    const VECTORS = ['Market', 'Tech', 'Team', 'Moat', 'Timing'];

    function getMetrics(task: Task) {
        const defaultMetrics = { Market: 20, Tech: 20, Team: 20, Moat: 20, Timing: 20 };
        try {
            if (!task.venture?.validation_evidence) return defaultMetrics;
            const parsed = JSON.parse(task.venture.validation_evidence);
            return { ...defaultMetrics, ...parsed };
        } catch (e) { return defaultMetrics; }
    }

    async function updateVector(vector: string, value: number) {
        if (!selectedTask || !selectedTask.venture) return;
        const metrics = getMetrics(selectedTask);
        metrics[vector] = value;
        const values = Object.values(metrics) as number[];
        const newScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        const updatedData = { confidence_score: newScore, validation_evidence: JSON.stringify(metrics) };
        const updatedTask = { ...selectedTask, venture: { ...selectedTask.venture, ...updatedData } };
        
        // Update List & Selected
        const idx = allTasks.findIndex(t => t.id === selectedTask?.id);
        if (idx !== -1) allTasks[idx] = updatedTask;
        selectedTask = updatedTask;
        
        await api.tasks.update(selectedTask.id, updatedData);
    }

    async function changeStage(newStage: string) {
        if (!selectedTask || !selectedTask.venture) return;
        const updatedTask = { ...selectedTask, venture: { ...selectedTask.venture, stage: newStage } };
        const idx = allTasks.findIndex(t => t.id === selectedTask?.id);
        if (idx !== -1) allTasks[idx] = updatedTask;
        selectedTask = updatedTask;
        await api.tasks.update(selectedTask.id, { stage: newStage });
    }

    async function handleDelete() {
        if (!selectedTask) return;
        if (!confirm(`Permanently delete "${selectedTask.title}"?`)) return;

        const idToDelete = selectedTask.id;
        
        // 1. Optimistic Delete from List
        allTasks = allTasks.filter(t => t.id !== idToDelete);
        
        // 2. Select next available or null
        if (bets.length > 0) selectedTask = bets[0];
        else selectedTask = null;

        // 3. API Call
        await api.tasks.delete(idToDelete);
    }

    function select(task: Task) { selectedTask = task; }
    
    function getRiskColor(score: number) {
        if (score >= 80) return '#34c759'; // Apple Green
        if (score >= 60) return '#ffcc00'; // Apple Yellow
        if (score >= 40) return '#ff9500'; // Apple Orange
        return '#ff3b30'; // Apple Red
    }
</script>

<VentureHelpModal isOpen={showHelp} on:close={() => showHelp = false} />

<div class="swiss-container">
    <div class="control-surface">
        
        <div class="flight-deck">
            {#if selectedTask && selectedTask.venture}
                {@const metrics = getMetrics(selectedTask)}
                
                <div class="deck-header">
                    <div>
                        <h2>{selectedTask.title}</h2>
                        <span class="meta-badge">ID: {selectedTask.classic?.short_id}</span>
                    </div>
                    <div class="deck-actions">
                        <button class="round-btn icon" on:click={() => showHelp = true}>i</button>
                        <button class="round-btn" on:click={() => dispatch('openTask', selectedTask)}>Open</button>
                        <button class="round-btn icon danger" on:click={handleDelete} title="Delete Venture">🗑</button>
                    </div>
                </div>

                <div class="main-stage">
                    <div class="radar-viz">
                        <RadarChart data={metrics} size={300} color={getRiskColor(selectedTask.venture.confidence_score)} />
                        
                        <div class="score-block">
                            <span class="big-score" style="color: {getRiskColor(selectedTask.venture.confidence_score)}">
                                {selectedTask.venture.confidence_score}%
                            </span>
                            <span class="label">CONFIDENCE SCORE</span>
                        </div>
                    </div>

                    <div class="controls-col">
                        <div class="control-group">
                            <span class="label">LIFECYCLE STAGE</span>
                            <div class="segmented-control">
                                {#each STAGES as s}
                                    <button class:active={selectedTask.venture.stage === s} on:click={() => changeStage(s)}>
                                        {s}
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <div class="control-group">
                            <span class="label">RISK VECTORS</span>
                            <div class="sliders-list">
                                {#each VECTORS as v}
                                    <div class="slider-row">
                                        <div class="slider-meta">
                                            <span class="v-name">{v}</span>
                                            <span class="v-val">{metrics[v]}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" step="5" value={metrics[v]} 
                                            on:input={(e) => updateVector(v, parseInt(e.currentTarget.value))}
                                            style="--track-color: {getRiskColor(metrics[v])}"
                                        />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

            {:else}
                <div class="empty-state">Select a Venture to analyze.</div>
            {/if}
        </div>

        <div class="ledger-panel">
            <div class="ledger-header">
                <h3>Portfolio Ledger</h3>
                <span class="count-badge">{bets.length} Active</span>
            </div>
            <div class="ledger-list">
                {#each bets as task (task.id)}
                    <div class="ledger-item" class:selected={selectedTask?.id === task.id} on:click={() => select(task)}>
                        <div class="item-main">
                            <span class="item-title">{task.title}</span>
                            <span class="item-stage">{task.venture?.stage}</span>
                        </div>
                        <div class="item-meta">
                            <div class="score-dot" style="background: {getRiskColor(task.venture?.confidence_score || 0)}">
                                {task.venture?.confidence_score}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

    </div>
</div>

<style>
    :root {
        --apple-bg-dark: #1c1c1e;
        --apple-bg-surface: rgba(44, 44, 46, 0.6);
        --apple-text-primary: #ffffff;
        --apple-text-secondary: #8e8e93;
        --radius-xl: 28px;
        --radius-lg: 16px;
        --radius-md: 12px;
    }

    .swiss-container {
        height: 100%; background: #000; padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        color: var(--apple-text-primary);
    }

    .control-surface { display: flex; gap: 20px; height: 100%; }

    /* === LEFT PANEL === */
    .flight-deck {
        flex: 2;
        background: var(--apple-bg-dark); border-radius: var(--radius-xl);
        padding: 32px; display: flex; flex-direction: column; overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .deck-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    h2 { margin: 0; font-size: 2.2rem; font-weight: 700; letter-spacing: -0.5px; }
    .meta-badge { font-size: 0.8rem; color: var(--apple-text-secondary); font-weight: 600; }

    .deck-actions { display: flex; gap: 12px; }
    .round-btn {
        background: rgba(255,255,255,0.1); border: none; color: #fff;
        padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .round-btn:hover { background: #fff; color: #000; }
    .round-btn.icon { width: 40px; padding: 0; font-family: serif; font-style: italic; font-size: 1.2rem; display:grid; place-items: center; }
    .round-btn.danger:hover { background: #ff3b30; color: #fff; }

    .main-stage { display: flex; gap: 40px; align-items: flex-start; height: 100%; }
    
    /* RADAR VIZ (Vertical Stack) */
    .radar-viz { 
        display: flex; flex-direction: column; align-items: center; 
        width: 320px; flex-shrink: 0; gap: 16px; padding-top: 20px;
    }
    
    .score-block { text-align: center; }
    .big-score { font-size: 3.5rem; font-weight: 800; line-height: 1; letter-spacing: -2px; }
    .label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--apple-text-secondary); letter-spacing: 1px; margin-top: 4px; }

    /* CONTROLS */
    .controls-col { flex: 1; display: flex; flex-direction: column; gap: 32px; }
    .control-group .label { margin-bottom: 12px; display: block; }

    /* Segmented Control */
    .segmented-control {
        display: flex; background: rgba(118, 118, 128, 0.24); padding: 4px; border-radius: var(--radius-md);
    }
    .segmented-control button {
        flex: 1; border: none; background: none; padding: 8px; color: var(--apple-text-secondary);
        font-weight: 500; font-size: 0.8rem; border-radius: 8px; cursor: pointer; text-transform: capitalize; transition: 0.2s;
    }
    .segmented-control button.active { background: #636366; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

    /* Sliders */
    .sliders-list { display: flex; flex-direction: column; gap: 16px; }
    .slider-row { display: flex; flex-direction: column; gap: 4px; }
    .slider-meta { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; }
    .v-name { color: var(--apple-text-secondary); }

    input[type=range] {
        -webkit-appearance: none; width: 100%; height: 24px; background: transparent; cursor: pointer;
    }
    input[type=range]::-webkit-slider-runnable-track {
        width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; border: none;
    }
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; 
        background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); margin-top: -7px; transition: 0.2s;
    }
    input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.1); }

    /* === RIGHT PANEL: LEDGER === */
    .ledger-panel {
        flex: 0.8;
        background: var(--apple-bg-surface); border-radius: var(--radius-xl);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        padding: 24px; display: flex; flex-direction: column; overflow: hidden;
    }

    .ledger-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .ledger-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .count-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }

    .ledger-list { overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }
    
    .ledger-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px; border-radius: var(--radius-lg);
        background: rgba(255,255,255,0.03); transition: 0.2s; cursor: pointer;
    }
    .ledger-item:hover { background: rgba(255,255,255,0.07); }
    .ledger-item.selected { background: rgba(255,255,255,0.12); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .item-main { display: flex; flex-direction: column; gap: 2px; }
    .item-title { font-weight: 600; font-size: 0.9rem; }
    .item-stage { font-size: 0.75rem; color: var(--apple-text-secondary); text-transform: capitalize; }

    .item-meta { display: flex; align-items: center; gap: 12px; }
    .score-dot { 
        width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
        font-size: 0.75rem; font-weight: 700; color: #000;
    }
    
    .empty-state { height: 100%; display: grid; place-items: center; color: var(--apple-text-secondary); font-weight: 500; }
</style>