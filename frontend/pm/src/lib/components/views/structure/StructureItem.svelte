<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import type { Task } from '$lib/api';

    export let task: Task;
    export let allTasks: Task[];
    export let depth = 0;

    const dispatch = createEventDispatcher();
    let isOpen = true;

    $: children = allTasks.filter(t => t.structure?.parent_id === task.id);
    
    // Determine Health Color
    $: healthColor = task.structure?.inherited_health === 'at_risk' ? '#ef4444' : 
                     task.structure?.inherited_health === 'off_track' ? '#000' : '#10b981';

    function getIcon(type: string | undefined) {
        if (type === 'objective') return '🎯';
        if (type === 'key_result') return '📈';
        return '📋';
    }
</script>

<div class="node-wrapper" style="margin-left: {depth * 32}px">
    <div class="node-row" on:click={() => dispatch('openTask', task)}>
        
        <button class="toggle-btn" on:click|stopPropagation={() => isOpen = !isOpen} class:hidden={children.length===0}>
            {isOpen ? '▼' : '▶'}
        </button>

        <span class="icon">{getIcon(task.structure?.node_type)}</span>
        
        <div class="node-body">
            <span class="title">{task.title}</span>
            <span class="meta">Weight: {task.structure?.weight}</span>
        </div>

        <div class="health-indicator" style="background: {healthColor}">
            {task.structure?.inherited_health?.replace('_', ' ')}
        </div>
    </div>

    {#if isOpen}
        <div class="children" transition:slide>
            {#each children as child}
                <svelte:self task={child} {allTasks} depth={0} on:openTask />
            {/each}
        </div>
    {/if}
</div>

<style>
    .node-wrapper { border-left: 1px solid #e5e7eb; }
    .node-row {
        display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #f3f4f6;
        cursor: pointer; transition: 0.2s;
    }
    .node-row:hover { background: #f9fafb; }

    .toggle-btn { border: none; background: none; color: #9ca3af; cursor: pointer; width: 20px; }
    .hidden { opacity: 0; pointer-events: none; }
    
    .node-body { flex: 1; display: flex; flex-direction: column; }
    .title { font-weight: 600; font-size: 0.95rem; }
    .meta { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; }

    .health-indicator {
        font-size: 0.65rem; color: #fff; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; font-weight: bold;
    }
</style>