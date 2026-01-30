<script lang="ts">
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { Task } from '$lib/api';

    export let task: Task;
    export let allTasks: Task[];
    export let depth = 0;

    const dispatch = createEventDispatcher();

    let isOpen = false; 

    // Find children
    $: children = allTasks.filter(t => t.tree?.parent_id === task.id);
    
    // Logic: Roots (Depth 0) are always Logs. Children with children are Branches.
    $: isLog = depth === 0 || children.length > 0;
    
    function toggle() {
        isOpen = !isOpen;
    }

    function forwardEvent(e: CustomEvent) {
        dispatch('openTask', e.detail);
    }
</script>

<div class="tree-node-wrapper">
    <div 
        class="node-content" 
        class:root-item={depth === 0}
        class:pruned={task.tree?.is_pruned}
        style="margin-left: {depth * 28}px"
    >
        {#if depth > 0}
            <div class="connector-line"></div>
        {/if}

        <button 
            class="expander" 
            class:invisible={children.length === 0}
            class:open={isOpen}
            on:click|stopPropagation={toggle}
        >
            ▶
        </button>

        <span class="node-icon">
            {#if task.tree?.is_pruned}
                🍂
            {:else if isLog}
                🪵
            {:else}
                🍃
            {/if}
        </span>

        <span 
            class="node-title" 
            on:click={() => dispatch('openTask', task)}
            role="button" tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && dispatch('openTask', task)}
        >
            {task.title}
        </span>

        {#if !task.tree?.is_pruned}
            <button class="add-btn" on:click|stopPropagation={() => dispatch('requestChild', task)} title="Grow Branch">
                +
            </button>
        {/if}
    </div>

    {#if isOpen && children.length > 0}
        <div class="children-container" transition:slide|local>
            {#each children as child (child.id)}
                <svelte:self 
                    task={child} 
                    {allTasks} 
                    depth={depth + 1} 
                    on:openTask={forwardEvent}
                    on:requestChild
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .tree-node-wrapper {
        display: flex; flex-direction: column;
    }

    .node-content {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        position: relative;
        transition: background 0.1s;
    }
    
    .node-content:hover { background: rgba(255,255,255,0.05); }

    /* Root Items look heavier */
    .node-content.root-item {
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--glass-border);
        margin-bottom: 4px;
        padding: 12px;
    }
    .node-content.root-item .node-title { font-weight: 600; color: #4ade80; }

    .node-content.pruned { opacity: 0.5; text-decoration: line-through; }

    /* Connector visual for depth */
    .connector-line {
        position: absolute; left: -18px; top: 50%;
        width: 14px; height: 1px;
        background: rgba(255,255,255,0.2);
    }
    /* Vertical line extension handled by parent padding in many tree implementations, 
       but here we keep it simple to avoid complex CSS grid issues */

    .expander {
        background: none; border: none; color: var(--text-tertiary);
        font-size: 0.6rem; cursor: pointer; width: 16px; height: 16px;
        display: grid; place-items: center;
        transition: transform 0.2s;
    }
    .expander.open { transform: rotate(90deg); }
    .expander.invisible { opacity: 0; pointer-events: none; }

    .node-icon { font-size: 1.1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
    .node-title { color: var(--text-secondary); font-size: 0.95rem; flex: 1; }

    .add-btn {
        opacity: 0; background: rgba(255,255,255,0.1); 
        border: none; color: var(--text-primary);
        width: 20px; height: 20px; border-radius: 4px;
        cursor: pointer; transition: 0.2s;
    }
    .node-content:hover .add-btn { opacity: 1; }
    .add-btn:hover { background: var(--orb-1-color); color: black; }
</style>