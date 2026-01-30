<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import { slide, fly } from 'svelte/transition';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    // 1. FILTER & SORT
    // We sort by flow_rate so faster tasks float to the top of their section
    $: riverTasks = allTasks
        .filter(t => t.river !== undefined)
        .sort((a, b) => (b.river?.flow_rate || 0) - (a.river?.flow_rate || 0));

    // 2. STAGE MAPPING (Backend 'source' -> UI 'Headwaters')
    $: currents = {
        source: riverTasks.filter(t => !t.river?.stage_id || t.river?.stage_id === 'source'),
        tributary: riverTasks.filter(t => t.river?.stage_id === 'tributary'),
        estuary: riverTasks.filter(t => t.river?.stage_id === 'estuary')
    };

    // 3. ACTIONS
    async function toggleBlockage(task: Task) {
        if (!task.river) return;
        const newStatus = !task.river.is_blocked;
        
        // Visual Update
        dispatch('update', { 
            ...task, 
            river: { ...task.river, is_blocked: newStatus } 
        });

        await api.tasks.update(task.id, { is_blocked: newStatus });
    }

    async function accelerate(task: Task) {
        if (!task.river) return;
        // Increase flow by 10, max 100
        const newFlow = Math.min((task.river.flow_rate || 50) + 10, 100);
        
        dispatch('update', { 
            ...task, 
            river: { ...task.river, flow_rate: newFlow } 
        });
        await api.tasks.update(task.id, { flow_rate: newFlow });
    }

    async function advanceStage(task: Task, currentStage: string) {
        if (!task.river) return;
        
        const map: Record<string, string> = { 'source': 'tributary', 'tributary': 'estuary' };
        const nextStage = map[currentStage] || 'estuary';

        dispatch('update', { 
            ...task, 
            river: { ...task.river, stage_id: nextStage } 
        });
        await api.tasks.update(task.id, { stage_id: nextStage });
    }
</script>

<div class="river-viewport">
    
    <div class="river-segment source-segment">
        <div class="segment-header">
            <div class="header-icon">🏔️</div>
            <div class="header-text">
                <h3>The Source</h3>
                <span class="subtitle">Potential Energy • Ideation</span>
            </div>
            <div class="count-badge">{currents.source.length}</div>
        </div>

        <div class="water-channel">
            {#each currents.source as task (task.id)}
                <div 
                    class="droplet-card" 
                    class:blocked={task.river?.is_blocked}
                    on:click={() => dispatch('openTask', task)}
                    transition:slide={{ duration: 300 }}
                >
                    <div class="flow-meter">
                        <div class="meter-bar">
                            <div class="meter-fill" style="height: {task.river?.flow_rate}%"></div>
                        </div>
                        <span class="flow-num">{task.river?.flow_rate}</span>
                    </div>

                    <div class="droplet-body">
                        <h4>{task.title}</h4>
                        {#if task.river?.is_blocked}
                            <div class="status-alert">🛑 DAMMED</div>
                        {:else}
                            <div class="status-normal">Flowing</div>
                        {/if}
                    </div>

                    <div class="droplet-controls">
                        <button class="ctrl-btn dam" on:click|stopPropagation={() => toggleBlockage(task)} title="Block/Unblock">
                            {task.river?.is_blocked ? '🔨 Break Dam' : '🧱 Build Dam'}
                        </button>
                        {#if !task.river?.is_blocked}
                            <button class="ctrl-btn push" on:click|stopPropagation={() => accelerate(task)} title="Increase Velocity">
                                🌊 +Flow
                            </button>
                            <button class="ctrl-btn next" on:click|stopPropagation={() => advanceStage(task, 'source')}>
                                ↓
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
            {#if currents.source.length === 0}
                <div class="empty-bed">The source is dry.</div>
            {/if}
        </div>
    </div>

    <div class="waterfall-connector">
        <div class="cascade"></div>
        <div class="cascade"></div>
        <div class="cascade"></div>
    </div>

    <div class="river-segment tributary-segment">
        <div class="segment-header">
            <div class="header-icon">🛶</div>
            <div class="header-text">
                <h3>The Tributary</h3>
                <span class="subtitle">Kinetic Energy • Execution</span>
            </div>
            <div class="count-badge">{currents.tributary.length}</div>
        </div>

        <div class="water-channel">
            {#each currents.tributary as task (task.id)}
                <div 
                    class="droplet-card active-stream" 
                    class:blocked={task.river?.is_blocked}
                    on:click={() => dispatch('openTask', task)}
                    transition:slide
                >
                    <div class="flow-meter horizontal">
                         <div class="meter-fill" style="width: {task.river?.flow_rate}%"></div>
                    </div>

                    <div class="droplet-body">
                        <h4>{task.title}</h4>
                    </div>

                    <div class="droplet-controls">
                        <button class="ctrl-btn dam" on:click|stopPropagation={() => toggleBlockage(task)}>
                            {task.river?.is_blocked ? '🧨' : '🧱'}
                        </button>
                        {#if !task.river?.is_blocked}
                            <button class="ctrl-btn push" on:click|stopPropagation={() => accelerate(task)}>
                                ⚡ {task.river?.flow_rate}
                            </button>
                            <button class="ctrl-btn next" on:click|stopPropagation={() => advanceStage(task, 'tributary')}>
                                ↓
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="delta-connector">
        <div class="spread-line"></div>
    </div>

    <div class="river-segment estuary-segment">
        <div class="segment-header">
            <div class="header-icon">🌅</div>
            <div class="header-text">
                <h3>The Estuary</h3>
                <span class="subtitle">Oceanic • Complete</span>
            </div>
            <div class="count-badge">{currents.estuary.length}</div>
        </div>

        <div class="delta-grid">
            {#each currents.estuary as task (task.id)}
                <div class="sediment-card" on:click={() => dispatch('openTask', task)}>
                    <h4>{task.title}</h4>
                    <span class="settled-tag">Settled</span>
                </div>
            {/each}
        </div>
    </div>

</div>

<style>
    .river-viewport {
        height: 100%; overflow-y: auto;
        padding: 40px 20px 100px 20px;
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); /* Deep River Blue */
        display: flex; flex-direction: column; align-items: center; gap: 0;
    }

    /* --- SEGMENTS --- */
    .river-segment {
        width: 100%; max-width: 600px;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 24px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 30px rgba(0,0,0,0.2);
        z-index: 2;
    }

    .segment-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header-icon { font-size: 2rem; }
    .header-text h3 { margin: 0; color: var(--text-primary); font-family: 'Space Grotesk'; font-size: 1.2rem; }
    .subtitle { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .count-badge { margin-left: auto; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-weight: bold; }

    /* --- SOURCE STYLING --- */
    .source-segment { border-color: rgba(148, 163, 184, 0.3); }

    .droplet-card {
        background: var(--card-bg); border: 1px solid var(--glass-border);
        border-radius: 12px; padding: 12px;
        display: flex; align-items: center; gap: 16px;
        margin-bottom: 12px; transition: 0.2s;
        cursor: pointer; position: relative; overflow: hidden;
    }
    .droplet-card:hover { transform: scale(1.02); border-color: #3b82f6; }

    .flow-meter {
        width: 40px; height: 40px; border-radius: 50%;
        background: rgba(0,0,0,0.3); border: 2px solid #3b82f6;
        display: grid; place-items: center; position: relative; overflow: hidden;
    }
    .meter-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
    .meter-fill { 
        position: absolute; bottom: 0; width: 100%; background: rgba(59, 130, 246, 0.5); 
        transition: height 0.5s ease;
    }
    .flow-num { z-index: 1; font-size: 0.75rem; font-weight: bold; color: #fff; }

    .droplet-body { flex: 1; }
    h4 { margin: 0 0 4px 0; font-size: 1rem; color: var(--text-primary); }
    .status-alert { font-size: 0.7rem; color: #ef4444; font-weight: 800; animation: flash 2s infinite; }
    .status-normal { font-size: 0.7rem; color: #3b82f6; }

    .droplet-controls { display: flex; gap: 8px; }
    .ctrl-btn {
        background: rgba(255,255,255,0.05); border: 1px solid transparent;
        color: var(--text-secondary); padding: 6px 10px; border-radius: 6px;
        cursor: pointer; font-size: 0.8rem; transition: 0.2s;
    }
    .ctrl-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    
    .dam:hover { color: #ef4444; border-color: #ef4444; }
    .push:hover { color: #facc15; border-color: #facc15; }
    .next:hover { background: #3b82f6; color: white; }

    /* --- CONNECTORS --- */
    .waterfall-connector {
        height: 60px; width: 2px; background: rgba(59, 130, 246, 0.3);
        position: relative; overflow: hidden;
    }
    .cascade {
        width: 4px; height: 10px; background: #3b82f6;
        position: absolute; left: -1px; border-radius: 2px;
        animation: fall 1s infinite linear;
    }
    .cascade:nth-child(2) { animation-delay: 0.3s; }
    .cascade:nth-child(3) { animation-delay: 0.6s; }

    @keyframes fall { 0% { top: -10px; opacity: 1; } 100% { top: 60px; opacity: 0; } }
    @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* --- TRIBUTARY STYLING --- */
    .tributary-segment { border-color: #3b82f6; box-shadow: 0 0 40px rgba(59, 130, 246, 0.1); }
    
    .active-stream { background: rgba(59, 130, 246, 0.05); border-left: 4px solid #3b82f6; }
    
    .flow-meter.horizontal {
        width: 6px; height: 40px; border-radius: 3px; border: none; background: rgba(0,0,0,0.3);
    }
    .horizontal .meter-fill { width: 100%; bottom: 0; top: auto; background: #3b82f6; transition: height 0.5s; }

    /* --- ESTUARY STYLING --- */
    .delta-connector { height: 40px; width: 2px; background: rgba(59, 130, 246, 0.3); }
    
    .estuary-segment { 
        max-width: 800px; /* Wider at the bottom */
        border-color: rgba(255,255,255,0.1); 
    }

    .delta-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;
    }

    .sediment-card {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
        padding: 12px; border-radius: 8px; cursor: pointer;
    }
    .sediment-card h4 { color: var(--text-secondary); font-size: 0.9rem; text-decoration: line-through; }
    .settled-tag { font-size: 0.65rem; color: var(--text-tertiary); text-transform: uppercase; }

    .blocked { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
    .empty-bed { padding: 20px; text-align: center; color: var(--text-tertiary); font-style: italic; }
</style>