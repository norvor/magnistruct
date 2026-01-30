<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    $: nestTasks = allTasks.filter(t => t.nest !== undefined);
    $: occupied = nestTasks.filter(t => t.nest?.is_occupied);
    $: abandoned = nestTasks.filter(t => !t.nest?.is_occupied);

    async function gather(task: Task) {
        if (!task.nest) return;
        const newMat = (task.nest.materials_gathered || 0) + 1;
        dispatch('update', { ...task, nest: { ...task.nest, materials_gathered: newMat } });
        await api.tasks.update(task.id, { materials_gathered: newMat });
    }
</script>

<div class="nest-container">
    <div class="nest-header">
        <h3>🪺 The Nest</h3>
        <p>Resource Gathering</p>
    </div>

    <div class="nest-grid">
        {#each occupied as task}
            <div class="twig-card" on:click={() => dispatch('openTask', task)}>
                <div class="twig-count">
                    {task.nest?.materials_gathered} 🪵
                </div>
                <h4>{task.title}</h4>
                <button class="gather-btn" on:click|stopPropagation={() => gather(task)}>Gather</button>
            </div>
        {/each}
        
        {#if occupied.length === 0}
            <div class="empty-nest">The nest is empty.</div>
        {/if}
    </div>

    {#if abandoned.length > 0}
        <div class="abandoned-section">
            <h4>Abandoned Twigs</h4>
            <div class="abandoned-list">
                {#each abandoned as task}
                    <span class="dead-twig">{task.title}</span>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .nest-container { padding: 40px; height: 100%; overflow-y: auto; background: #2f2219; color: #d6bda4; }
    .nest-header { text-align: center; margin-bottom: 30px; }
    h3 { margin: 0; font-family: 'Space Grotesk'; }
    
    .nest-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;
    }

    .twig-card {
        background: #463325; border: 1px dashed #8b6e56; padding: 16px; border-radius: 50% 50% 5px 5px;
        text-align: center; cursor: pointer; transition: 0.2s; aspect-ratio: 1;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .twig-card:hover { transform: translateY(-4px); background: #553e2d; }

    .twig-count { font-size: 1.5rem; margin-bottom: 8px; }
    h4 { margin: 0; font-size: 0.9rem; margin-bottom: 8px; }

    .gather-btn {
        background: #8b6e56; color: #1a120e; border: none; padding: 4px 12px; border-radius: 12px; cursor: pointer; font-weight: bold;
    }
    .gather-btn:hover { background: #a8896f; }

    .abandoned-section { margin-top: 40px; opacity: 0.5; text-align: center; }
    .dead-twig { display: inline-block; background: rgba(0,0,0,0.2); padding: 4px 8px; margin: 4px; border-radius: 4px; text-decoration: line-through; }
    
    .empty-nest { grid-column: 1 / -1; text-align: center; font-style: italic; opacity: 0.5; }
</style>