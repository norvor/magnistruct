<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    $: cocoonTasks = allTasks.filter(t => t.cocoon !== undefined);

    async function advance(task: Task) {
        if (!task.cocoon) return;
        const newProg = Math.min((task.cocoon.dissolve_progress || 0) + 20, 100);
        dispatch('update', { ...task, cocoon: { ...task.cocoon, dissolve_progress: newProg } });
        await api.tasks.update(task.id, { dissolve_progress: newProg });
    }
</script>

<div class="cocoon-container">
    <div class="cocoon-header">
        <h3>🐛 The Cocoon</h3>
        <p>Pivot & Transformation</p>
    </div>

    <div class="pod-forest">
        {#each cocoonTasks as task}
            <div class="silk-thread"></div>
            <div 
                class="cocoon-pod" 
                style="opacity: {1 - (task.cocoon?.dissolve_progress || 0)/200}"
                on:click={() => dispatch('openTask', task)}
            >
                <h4>{task.title}</h4>
                <div class="progress-ring">
                    {task.cocoon?.dissolve_progress}%
                </div>
                <button on:click|stopPropagation={() => advance(task)}>
                    { (task.cocoon?.dissolve_progress || 0) < 50 ? 'Dissolve' : 'Reform' }
                </button>
            </div>
        {/each}
        
        {#if cocoonTasks.length === 0}
            <div class="empty-branch">No cocoons hanging.</div>
        {/if}
    </div>
</div>

<style>
    .cocoon-container { padding: 40px; height: 100%; overflow-y: auto; background: #e2e8f0; color: #475569; }
    .cocoon-header { text-align: center; margin-bottom: 20px; }
    h3 { margin: 0; font-family: 'Space Grotesk'; }

    .pod-forest { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
    
    .cocoon-pod {
        background: #fff; width: 120px; height: 180px;
        border-radius: 60px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 12px; cursor: pointer; transition: 0.3s; position: relative;
    }
    .cocoon-pod:hover { transform: scale(1.05); }

    .silk-thread {
        position: absolute; top: -100px; width: 2px; height: 100px; background: #cbd5e1;
    }

    h4 { margin: 0; font-size: 0.8rem; text-align: center; padding: 0 8px; }

    .progress-ring {
        font-size: 1.2rem; font-weight: bold; color: #94a3b8;
    }

    button {
        background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 12px; cursor: pointer; color: #64748b;
    }
    button:hover { background: #e2e8f0; color: #334155; }
    
    .empty-branch { width: 100%; text-align: center; opacity: 0.5; margin-top: 40px; }
</style>