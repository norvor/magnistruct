<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import { fade, scale } from 'svelte/transition';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    $: shellTasks = allTasks.filter(t => t.shell !== undefined)
        .sort((a, b) => (a.shell?.layer_depth || 0) - (b.shell?.layer_depth || 0));

    $: layers = {
        core: shellTasks.filter(t => t.shell?.layer_depth === 1),
        inner: shellTasks.filter(t => t.shell?.layer_depth === 2),
        outer: shellTasks.filter(t => t.shell?.layer_depth === 3)
    };

    async function toggleHarden(task: Task) {
        if (!task.shell) return;
        const newState = !task.shell.is_hardened;
        dispatch('update', { ...task, shell: { ...task.shell, is_hardened: newState } });
        await api.tasks.update(task.id, { is_hardened: newState });
    }

    async function reinforce(task: Task) {
        if (!task.shell) return;
        const newInt = Math.min((task.shell.integrity || 0) + 20, 100);
        dispatch('update', { ...task, shell: { ...task.shell, integrity: newInt } });
        await api.tasks.update(task.id, { integrity: newInt });
    }
</script>

<div class="shell-container">
    <div class="shell-header">
        <h3>🛡️ The Shell</h3>
        <p>Integrity & Depth</p>
    </div>

    <div class="layer-stack">
        <div class="layer core">
            <div class="layer-title">Layer 1: The Core</div>
            <div class="layer-grid">
                {#each layers.core as task (task.id)}
                    <div 
                        class="shield-card" class:hardened={task.shell?.is_hardened}
                        on:click={() => dispatch('openTask', task)}
                    >
                        <div class="integrity-bar" style="height: {task.shell?.integrity}%"></div>
                        <span>{task.title}</span>
                        <div class="shield-controls">
                            <button on:click|stopPropagation={() => toggleHarden(task)}>
                                {task.shell?.is_hardened ? '🔒' : '🔓'}
                            </button>
                            <button on:click|stopPropagation={() => reinforce(task)}>+</button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="layer inner">
            <div class="layer-title">Layer 2: Inner Shield</div>
            <div class="layer-grid">
                {#each layers.inner as task (task.id)}
                    <div 
                        class="shield-card" class:hardened={task.shell?.is_hardened}
                        on:click={() => dispatch('openTask', task)}
                    >
                        <div class="integrity-bar" style="height: {task.shell?.integrity}%"></div>
                        <span>{task.title}</span>
                    </div>
                {/each}
            </div>
        </div>
        
        <div class="layer outer">
            <div class="layer-title">Layer 3: Perimeter</div>
            <div class="layer-grid">
                {#each layers.outer as task (task.id)}
                    <div 
                        class="shield-card" class:hardened={task.shell?.is_hardened}
                        on:click={() => dispatch('openTask', task)}
                    >
                        <div class="integrity-bar" style="height: {task.shell?.integrity}%"></div>
                        <span>{task.title}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .shell-container { padding: 40px; height: 100%; overflow-y: auto; background: #0f172a; }
    .shell-header { text-align: center; margin-bottom: 30px; }
    h3 { margin: 0; color: #38bdf8; font-family: 'Space Grotesk'; }
    p { color: var(--text-tertiary); margin: 0; }

    .layer-stack { display: flex; flex-direction: column; gap: 20px; align-items: center; }

    .layer {
        width: 100%; max-width: 800px;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 12px; padding: 16px;
        background: rgba(56, 189, 248, 0.05);
    }
    .layer.core { border-color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
    
    .layer-title { text-transform: uppercase; font-size: 0.7rem; color: #38bdf8; margin-bottom: 12px; letter-spacing: 1px; }

    .layer-grid { display: flex; flex-wrap: wrap; gap: 12px; }

    .shield-card {
        background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
        padding: 12px; border-radius: 6px;
        width: 140px; height: 100px;
        position: relative; overflow: hidden;
        display: flex; flex-direction: column; justify-content: space-between;
        cursor: pointer; transition: 0.2s;
    }
    .shield-card.hardened { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.2); }
    
    .integrity-bar {
        position: absolute; bottom: 0; left: 0; width: 4px; background: #38bdf8; opacity: 0.5; transition: height 0.5s;
    }

    .shield-controls { display: flex; gap: 4px; justify-content: flex-end; }
    button { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 4px; cursor: pointer; }
</style>