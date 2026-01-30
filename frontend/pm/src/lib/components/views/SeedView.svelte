<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import { fly, scale } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';

    export let allTasks: Task[] = [];
    
    const dispatch = createEventDispatcher();

    // --- LOGIC: Filter & Group ---
    $: seedTasks = allTasks.filter(t => t.seed !== undefined);

    // Defining the 3 Stages of Life
    $: stages = {
        dormant: {
            title: "Incubation Zone (0-30%)",
            desc: "New ideas awaiting resources.",
            tasks: seedTasks.filter(t => (t.seed?.growth_stage || 0) < 30),
            icon: '🌰',
            color: 'var(--text-secondary)'
        },
        seedling: {
            title: "Nursery Zone (30-70%)",
            desc: "Active development and validation.",
            tasks: seedTasks.filter(t => (t.seed?.growth_stage || 0) >= 30 && (t.seed?.growth_stage || 0) < 70),
            icon: '🌱',
            color: '#4ade80' // Green-400
        },
        flowering: {
            title: "Harvest Zone (70%+)",
            desc: "Mature projects ready for launch.",
            tasks: seedTasks.filter(t => (t.seed?.growth_stage || 0) >= 70),
            icon: '🌻',
            color: '#facc15' // Yellow-400
        }
    };

    // --- ACTIONS ---
    async function waterTask(task: Task) {
        if (!task.seed) return;
        
        // Mechanic: Add Water (+20), Convert Water to Growth (+10)
        const currentWater = task.seed.water_level || 0;
        const currentGrowth = task.seed.growth_stage || 0;

        const newWater = Math.min(currentWater + 20, 100); 
        const newGrowth = Math.min(currentGrowth + 10, 100);

        try {
            // Optimistic Update
            const updatedTask = {
                ...task,
                seed: { ...task.seed, water_level: newWater, growth_stage: newGrowth }
            };
            dispatch('update', updatedTask);

            await api.tasks.update(task.id, { 
                water_level: newWater,
                growth_stage: newGrowth
            });
        } catch (e) {
            console.error("Irrigation failed", e);
        }
    }

    // Helper: Dynamic plant size based on progress
    function getPlantScale(growth: number) {
        // Maps 0-100 to 0.8x - 1.5x scale
        return 0.8 + (growth / 150);
    }
</script>

<div class="terrarium-container">
    {#each Object.entries(stages) as [key, stage]}
        <div class="bio-dome {key}">
            <div class="dome-header">
                <div class="dome-title">
                    <span class="stage-icon">{stage.icon}</span>
                    <h3>{stage.title}</h3>
                </div>
                <p class="dome-desc">{stage.desc}</p>
            </div>

            <div class="specimen-grid">
                {#each stage.tasks as task (task.id)}
                    <div 
                        class="specimen-pod" 
                        on:click={() => dispatch('openTask', task)} 
                        transition:scale={{ duration: 300, start: 0.95 }}
                        role="button"
                        tabindex="0"
                        on:keydown={(e) => e.key === 'Enter' && dispatch('openTask', task)}
                    >
                        <div class="glass-chamber">
                            <div 
                                class="living-plant" 
                                style="transform: scale({getPlantScale(task.seed?.growth_stage || 0)})"
                            >
                                {stage.icon}
                            </div>
                            
                            <div class="bio-glow" style="background: {stage.color}"></div>
                        </div>

                        <div class="pod-hud">
                            <div class="pod-header">
                                <span class="pod-id">#{task.classic?.short_id || 'SEED'}</span>
                                <span class="pod-growth">{(task.seed?.growth_stage || 0)}% MATURITY</span>
                            </div>
                            
                            <h4 class="pod-title">{task.title}</h4>

                            <div class="pod-controls">
                                <div class="moisture-gauge">
                                    <div class="gauge-label">
                                        <span>H₂O</span>
                                        <span>{(task.seed?.water_level || 0)}%</span>
                                    </div>
                                    <div class="gauge-track">
                                        <div 
                                            class="gauge-fill" 
                                            style="width: {task.seed?.water_level || 0}%"
                                            class:critical={(task.seed?.water_level || 0) < 30}
                                        ></div>
                                    </div>
                                </div>

                                <button 
                                    class="inject-btn" 
                                    on:click|stopPropagation={() => waterTask(task)}
                                    title="Inject Nutrients"
                                >
                                    💧
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if stage.tasks.length === 0}
                    <div class="empty-dome">
                        <span class="ghost-icon">{stage.icon}</span>
                        <span>Sector Empty</span>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>

<style>
    .terrarium-container {
        height: 100%;
        overflow-y: auto;
        padding: 20px 0 60px 0;
        display: flex;
        flex-direction: column;
        gap: 40px;
    }

    /* --- DOME SECTIONS --- */
    .bio-dome {
        border-left: 2px solid var(--glass-border);
        padding-left: 24px;
        position: relative;
    }

    /* Different accent colors for stages */
    .bio-dome.dormant { border-color: var(--text-tertiary); }
    .bio-dome.seedling { border-color: #4ade80; }
    .bio-dome.flowering { border-color: #facc15; }

    .dome-header { margin-bottom: 20px; }
    .dome-title { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .stage-icon { font-size: 1.5rem; }
    h3 { 
        font-family: 'Space Grotesk'; font-size: 1.1rem; color: var(--text-primary); 
        margin: 0; text-transform: uppercase; letter-spacing: 1px; 
    }
    .dome-desc { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }

    /* --- GRID --- */
    .specimen-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    /* --- THE SPECIMEN POD (CARD) --- */
    .specimen-pod {
        background: rgba(15, 23, 42, 0.6); /* Dark Slate */
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        display: flex;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        height: 140px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .specimen-pod:hover {
        transform: translateY(-4px);
        border-color: var(--orb-1-color);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }
    .specimen-pod:hover .bio-glow { opacity: 0.4; transform: translate(-50%, -50%) scale(1.2); }

    /* LEFT: GLASS CHAMBER */
    .glass-chamber {
        width: 100px;
        background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%);
        border-right: 1px solid var(--glass-border);
        display: grid; place-items: center;
        position: relative;
        overflow: hidden;
    }

    .living-plant {
        font-size: 2.5rem;
        z-index: 2;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    .bio-glow {
        position: absolute;
        top: 50%; left: 50%;
        width: 60px; height: 60px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        filter: blur(20px);
        opacity: 0.15;
        transition: 0.4s ease;
        z-index: 1;
    }

    /* RIGHT: HUD */
    .pod-hud {
        flex: 1;
        padding: 16px;
        display: flex; flex-direction: column;
        justify-content: space-between;
    }

    .pod-header {
        display: flex; justify-content: space-between; 
        font-family: 'Space Grotesk'; font-size: 0.7rem; color: var(--text-tertiary);
        letter-spacing: 0.5px;
    }
    .pod-growth { color: var(--orb-1-color); font-weight: 700; }

    .pod-title {
        margin: 4px 0 0 0;
        font-size: 1rem; color: var(--text-primary);
        font-weight: 500;
        line-height: 1.3;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* CONTROLS */
    .pod-controls {
        display: flex; align-items: flex-end; gap: 12px;
        margin-top: auto;
    }

    .moisture-gauge { flex: 1; }
    .gauge-label {
        display: flex; justify-content: space-between;
        font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px;
        font-weight: 600;
    }
    .gauge-track {
        height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;
    }
    .gauge-fill {
        height: 100%; background: #3b82f6; border-radius: 3px;
        transition: width 0.4s ease;
    }
    .gauge-fill.critical { background: #ef4444; }

    .inject-btn {
        width: 36px; height: 36px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        color: #3b82f6;
        cursor: pointer;
        display: grid; place-items: center;
        transition: 0.1s;
    }
    .inject-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        transform: scale(1.05);
    }
    .inject-btn:active { transform: scale(0.95); }

    .empty-dome {
        border: 1px dashed var(--glass-border);
        border-radius: 12px;
        height: 100px;
        display: flex; align-items: center; justify-content: center; gap: 12px;
        color: var(--text-tertiary); font-size: 0.9rem;
    }
    .ghost-icon { opacity: 0.3; font-size: 1.5rem; }
</style>