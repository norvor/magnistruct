<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Task } from '$lib/api';

    export let task: Task;

    const dispatch = createEventDispatcher();

    function handleDragStart(e: DragEvent) {
        if (!e.dataTransfer) return;
        // Attach the task ID so the drop zone knows what we are moving
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        
        // Optional: Make the drag image semi-transparent immediately
        e.dataTransfer.dropEffect = 'move';
    }
</script>

<div 
    class="task-card {task.priority}" 
    draggable={true}
    on:dragstart={handleDragStart}
    on:click={() => dispatch('click', task)}
    role="button"
    tabindex="0"
>
    <div class="card-top">
        <span class="id-badge">#{task.short_id}</span>
        {#if task.assignee}
            <div class="avatar" title={task.assignee.full_name}>
                {task.assignee.full_name[0].toUpperCase()}
            </div>
        {/if}
    </div>
    
    <div class="card-title">{task.title}</div>

    <div class="card-footer">
        <div class="tag priority-tag">{task.priority.replace('p', 'P')}</div>
        {#if task.due_date}
            <div class="tag date-tag">
                📅 {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
        {/if}
    </div>
</div>

<style>
    /* ... Styles stay exactly the same ... */
    .task-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        padding: 12px;
        cursor: grab; /* Shows the hand cursor */
        position: relative;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: all 0.2s;
        display: flex; flex-direction: column; gap: 8px;
        border-left: 3px solid transparent; 
    }
    
    .task-card:active { cursor: grabbing; } /* Clenched hand when dragging */

    /* ... Keep all other existing styles ... */
    .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-color: var(--text-secondary); }
    .task-card.p1 { border-left-color: #ef4444; }
    .task-card.p2 { border-left-color: #f59e0b; }
    .task-card.p3 { border-left-color: #3b82f6; }
    .task-card.p4 { border-left-color: var(--glass-border); }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .id-badge { font-family: 'Space Grotesk', monospace; font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
    .card-title { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); line-height: 1.4; word-break: break-word; }
    .card-footer { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
    .tag { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: var(--glass-highlight); color: var(--text-secondary); border: 1px solid transparent; font-weight: 500; }
    .priority-tag { text-transform: uppercase; letter-spacing: 0.5px; }
    .avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--accent-gradient); color: white; font-size: 0.65rem; font-weight: 700; display: grid; place-items: center; box-shadow: 0 0 0 2px var(--card-bg); }
</style>