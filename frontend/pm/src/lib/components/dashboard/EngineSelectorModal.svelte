<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { api } from '$lib/api';

    export let isOpen = false;
    export let projectId: string;
    export let activeEngines: string[] = [];

    const dispatch = createEventDispatcher();

    // THE ENTERPRISE ENGINE SUITE
    const ENGINES = [
        {
            id: 'classic',
            name: 'Classic Board',
            icon: '▣',
            desc: 'Standard Kanban project management. Columns, drag-and-drop, and priorities.',
            color: '#cbd5e1'
        },
        {
            id: 'venture',
            name: 'Venture Engine',
            icon: '🚀',
            desc: 'Innovation Portfolio. Manage R&D bets, track capital allocation, and risk confidence intervals.',
            color: '#10b981'
        },
        {
            id: 'stream',
            name: 'Stream Engine',
            icon: '⚡',
            desc: 'High-Velocity Operations. Optimize throughput, cycle time, and detect stalling workflows.',
            color: '#3b82f6'
        },
        {
            id: 'structure',
            name: 'Structure Engine',
            icon: '🏛️',
            desc: 'Strategic Hierarchy. Map OKRs, WBS, and dependency chains with recursive health rollups.',
            color: '#f59e0b'
        },
        {
            id: 'hive',
            name: 'Hive Engine',
            icon: '🐝',
            desc: 'Swarm Intelligence. Distributed work with heatmaps. Great for high-volume ticket processing.',
            color: '#eab308'
        },
        {
            id: 'shell',
            name: 'Shell Engine',
            icon: '🛡️',
            desc: 'Security & Integrity. Concentric defense layers for hardening systems and compliance.',
            color: '#38bdf8'
        },
        {
            id: 'wave',
            name: 'Wave Engine',
            icon: '📡',
            desc: 'Launch Pulse. Oscilloscope view for managing release cycles, amplitude, and phasing.',
            color: '#ec4899'
        },
        {
            id: 'nest',
            name: 'Nest Engine',
            icon: '🪺',
            desc: 'Resource Inventory. Staging area for gathering assets, materials, or backlog items.',
            color: '#a8896f'
        },
        {
            id: 'cocoon',
            name: 'Cocoon Engine',
            icon: '🐛',
            desc: 'Transformation Pod. Manage major pivots or refactors with dissolve/reform mechanics.',
            color: '#94a3b8'
        }
    ];

    async function toggleEngine(engineId: string) {
        const isActive = activeEngines.includes(engineId);
        
        // Optimistic UI update
        if (isActive) {
            activeEngines = activeEngines.filter(e => e !== engineId);
        } else {
            activeEngines = [...activeEngines, engineId];
        }

        try {
            await api.projects.toggleEngine(projectId, engineId, !isActive);
            dispatch('change'); // Notify parent to reload board
        } catch (e) {
            console.error(e);
            // Revert on fail
            if (isActive) activeEngines = [...activeEngines, engineId];
            else activeEngines = activeEngines.filter(e => e !== engineId);
        }
    }

    function close() {
        dispatch('close');
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" transition:fade on:click={close}>
        <div class="modal-content" transition:scale on:click|stopPropagation>
            <header>
                <h2>Install Engines</h2>
                <button class="close-btn" on:click={close}>&times;</button>
            </header>
            
            <div class="engine-grid">
                {#each ENGINES as engine}
                    <button 
                        class="engine-card" 
                        class:active={activeEngines.includes(engine.id)}
                        on:click={() => toggleEngine(engine.id)}
                        style="--engine-color: {engine.color}"
                    >
                        <div class="card-icon">{engine.icon}</div>
                        <div class="card-info">
                            <h4>{engine.name}</h4>
                            <p>{engine.desc}</p>
                        </div>
                        <div class="status-indicator">
                            {activeEngines.includes(engine.id) ? 'INSTALLED' : 'INSTALL'}
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
        display: grid; place-items: center; z-index: 1000;
    }

    .modal-content {
        background: #0f172a; width: 90%; max-width: 900px; height: 80vh;
        border-radius: 16px; border: 1px solid #334155;
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    header {
        padding: 24px; border-bottom: 1px solid #334155;
        display: flex; justify-content: space-between; align-items: center;
        background: #1e293b;
    }
    h2 { margin: 0; color: #fff; font-family: 'Space Grotesk'; }

    .close-btn {
        background: none; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer;
    }
    .close-btn:hover { color: #fff; }

    .engine-grid {
        padding: 24px; overflow-y: auto;
        display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
    }

    .engine-card {
        background: #1e293b; border: 1px solid #334155; border-radius: 12px;
        padding: 20px; text-align: left; cursor: pointer;
        display: flex; flex-direction: column; gap: 12px;
        transition: 0.2s; position: relative; overflow: hidden;
    }

    .engine-card:hover {
        transform: translateY(-4px); background: #334155; border-color: var(--engine-color);
    }

    /* Active State (Installed) */
    .engine-card.active {
        background: rgba(16, 185, 129, 0.05); /* Very subtle green tint */
        border-color: #10b981;
    }
    
    .card-icon { font-size: 2.5rem; margin-bottom: 8px; }

    h4 { margin: 0; color: #f1f5f9; font-size: 1.1rem; }
    p { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.4; flex: 1; }

    .status-indicator {
        font-size: 0.7rem; font-weight: bold; letter-spacing: 1px;
        color: #64748b; align-self: flex-start;
        padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.2);
    }

    .engine-card.active .status-indicator {
        background: #10b981; color: #000;
    }
</style>