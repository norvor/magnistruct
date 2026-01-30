<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Column, Task } from '$lib/api';
    import { fade } from 'svelte/transition';

    export let columns: Column[] = [];
    export let projectId: string;

    const dispatch = createEventDispatcher();

    // Flatten tasks for the list
    $: tasks = columns.flatMap(col => col.tasks);

    // Helper to get column name
    function getStatusName(colId: string | undefined) {
        if (!colId) return 'Unknown';
        const col = columns.find(c => c.id === colId);
        return col ? col.name : 'Unknown';
    }

    function handleKeydown(e: KeyboardEvent, task: Task) {
        if (e.key === 'Enter') dispatch('openTask', task);
    }
</script>

<div class="list-view-container" transition:fade={{ duration: 200 }}>
    <table class="task-table">
        <thead>
            <tr>
                <th class="w-id">ID</th>
                <th class="w-title">Title</th>
                <th class="w-status">Status</th>
                <th class="w-priority">Priority</th>
                <th class="w-assignee">Assignee</th>
                <th class="w-date">Due Date</th>
            </tr>
        </thead>
        <tbody>
            {#each tasks as task (task.id)}
                <tr 
                    on:click={() => dispatch('openTask', task)}
                    role="button"
                    tabindex="0"
                    on:keydown={(e) => handleKeydown(e, task)}
                >
                    <td class="id-cell">
                        #{task.classic?.short_id ?? '...'}
                    </td>
                    <td class="title-cell">
                        <span class="task-title">{task.title}</span>
                    </td>
                    <td>
                        <div class="status-badge">
                            {getStatusName(task.classic?.column_id)}
                        </div>
                    </td>
                    <td>
                        <div class="priority-badge {task.classic?.priority || 'p4'}">
                            {(task.classic?.priority || 'p4').replace('p', 'P')}
                        </div>
                    </td>
                    <td>
                        {#if task.classic?.assignee}
                            <div class="assignee-pill">
                                <div class="avatar-mini">
                                    {task.classic.assignee.full_name[0]}
                                </div>
                                <span>{task.classic.assignee.full_name}</span>
                            </div>
                        {:else}
                            <span class="text-muted">-</span>
                        {/if}
                    </td>
                    <td class="date-cell">
                        {#if task.classic?.due_date}
                            {new Date(task.classic.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {:else}
                            <span class="text-muted">-</span>
                        {/if}
                    </td>
                </tr>
            {/each}
            
            {#if tasks.length === 0}
                <tr>
                    <td colspan="6" class="empty-state">
                        No tasks found in this project.
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<style>
    .list-view-container {
        flex: 1;
        background: var(--card-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        overflow: hidden;
        display: flex; flex-direction: column;
    }

    .task-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    thead {
        background: var(--glass-highlight);
        border-bottom: 1px solid var(--glass-border);
    }

    th {
        padding: 12px 16px;
        font-size: 0.75rem;
        color: var(--text-tertiary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Column Widths */
    .w-id { width: 80px; }
    .w-title { width: 40%; }
    .w-status { width: 15%; }
    .w-priority { width: 100px; }
    .w-assignee { width: 15%; }
    .w-date { width: 100px; }

    tbody tr {
        border-bottom: 1px solid var(--glass-border);
        cursor: pointer;
        transition: background 0.1s;
    }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: rgba(255,255,255,0.02); }

    td {
        padding: 12px 16px;
        font-size: 0.9rem;
        color: var(--text-secondary);
        vertical-align: middle;
    }

    .id-cell { font-family: 'Space Grotesk', monospace; color: var(--text-tertiary); font-size: 0.8rem; }
    .title-cell { color: var(--text-primary); font-weight: 500; }
    .text-muted { color: rgba(255,255,255,0.2); }

    /* Badges */
    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
        font-size: 0.8rem;
    }

    .priority-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        background: rgba(255,255,255,0.05);
    }
    .priority-badge.p1 { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .priority-badge.p2 { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .priority-badge.p3 { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }

    .assignee-pill {
        display: flex; align-items: center; gap: 8px;
    }
    .avatar-mini {
        width: 20px; height: 20px;
        border-radius: 50%;
        background: var(--accent-gradient);
        color: white; font-size: 0.6rem;
        display: grid; place-items: center;
        font-weight: bold;
    }

    .empty-state {
        text-align: center; padding: 40px; color: var(--text-tertiary);
    }
</style>