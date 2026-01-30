<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Column, type Task } from '$lib/api'; 
    
    export let columns: Column[] = [];
    export let projectId: string;
    
    const dispatch = createEventDispatcher();
    
    // Flatten columns into a single list
    $: tasks = columns.flatMap(col => 
        col.tasks.map(t => ({ ...t, status: col.name }))
    );

    let newTaskTitle = "";

    async function handleInlineCreate() {
        if (!newTaskTitle.trim()) return;
        try {
            // Default to first column
            const defaultCol = columns[0];
            const newTask = await api.tasks.create(projectId, { 
                column_id: defaultCol.id, 
                title: newTaskTitle 
            });
            dispatch('taskCreated', newTask);
            newTaskTitle = "";
        } catch (e) { console.error(e); }
    }
</script>

<div class="list-wrapper">
    <div class="list-header">
        <div class="cell col-id">ID</div>
        <div class="cell col-title">Task Name</div>
        <div class="cell col-assignee">Assignee</div>
        <div class="cell col-due">Due Date</div>
        <div class="cell col-status">Status</div>
        <div class="cell col-priority">Priority</div>
    </div>

    <div class="list-body">
        {#each tasks as task}
            <div 
                class="list-row" 
                on:click={() => dispatch('openTask', task)}
                role="button" tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && dispatch('openTask', task)}
            >
                <div class="cell col-id">#{task.short_id}</div>
                
                <div class="cell col-title">
                    <span class="title-text">{task.title}</span>
                </div>
                
                <div class="cell col-assignee">
                    {#if task.assignee}
                        <div class="avatar-chip">
                            <div class="mini-avatar">{task.assignee.full_name[0]}</div>
                            <span class="name-truncate">{task.assignee.full_name}</span>
                        </div>
                    {:else}
                        <span class="dash">-</span>
                    {/if}
                </div>

                <div class="cell col-due">
                    {#if task.due_date}
                        <span class="date-text">
                            {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                    {:else}
                        <span class="dash">-</span>
                    {/if}
                </div>

                <div class="cell col-status">
                    <span class="status-pill">{task.status}</span>
                </div>

                <div class="cell col-priority">
                    <div class="priority-indicator {task.priority}"></div>
                    <span class="priority-text">{task.priority.replace('p', 'Priority ')}</span>
                </div>
            </div>
        {/each}

        <div class="list-row input-row">
            <div class="cell col-id icon-plus">+</div>
            <div class="cell col-title input-cell">
                <input 
                    type="text" 
                    placeholder="Add new task..." 
                    bind:value={newTaskTitle}
                    on:keydown={(e) => e.key === 'Enter' && handleInlineCreate()}
                />
            </div>
        </div>
    </div>
</div>

<style>
    .list-wrapper {
        width: 100%; height: 100%;
        background: var(--card-bg); /* Solid/Semi-solid plate */
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    /* GRID LAYOUT - The "Spreadsheet" feel */
    .list-header, .list-row {
        display: grid;
        /* Fixed widths ensures alignment perfectly */
        grid-template-columns: 70px 1fr 180px 120px 140px 130px; 
        align-items: center;
        padding: 0 16px;
        gap: 16px;
    }

    /* HEADER STYLES */
    .list-header {
        height: 44px;
        background: var(--column-bg); /* Distinct track color */
        border-bottom: 1px solid var(--glass-border);
        font-size: 0.75rem; 
        font-weight: 700;
        text-transform: uppercase; 
        letter-spacing: 0.5px;
        color: var(--text-secondary);
    }

    /* ROW STYLES */
    .list-row {
        height: 52px;
        border-bottom: 1px solid var(--glass-border);
        cursor: pointer; 
        transition: background 0.1s ease;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    .list-row:last-child { border-bottom: none; }
    
    /* HOVER EFFECT - Crucial for lists */
    .list-row:hover {
        background: var(--list-hover); 
        color: var(--text-primary);
    }

    /* TYPOGRAPHY & CELLS */
    .col-id { font-family: 'Space Grotesk', monospace; font-size: 0.8rem; opacity: 0.7; }
    .col-title { font-weight: 500; color: var(--text-primary); }
    .title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .dash { opacity: 0.3; }
    
    /* Avatar Chip */
    .avatar-chip { display: flex; align-items: center; gap: 8px; }
    .mini-avatar {
        width: 20px; height: 20px; 
        border-radius: 50%; background: var(--accent-gradient);
        color: white; font-size: 0.65rem; font-weight: 700;
        display: grid; place-items: center;
    }
    .name-truncate { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }

    /* Status Pill */
    .status-pill {
        background: var(--glass-highlight);
        padding: 3px 10px; border-radius: 100px;
        font-size: 0.75rem; border: 1px solid var(--glass-border);
        white-space: nowrap;
    }

    /* Priority */
    .col-priority { display: flex; align-items: center; gap: 8px; }
    .priority-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .priority-indicator.p1 { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.4); }
    .priority-indicator.p2 { background: #f59e0b; }
    .priority-indicator.p3 { background: #3b82f6; }
    .priority-indicator.p4 { background: #94a3b8; }
    .priority-text { font-size: 0.8rem; }

    /* INPUT ROW SPECIAL STYLES */
    .input-row { opacity: 0.7; }
    .input-row:focus-within { opacity: 1; background: var(--list-hover); }
    
    .input-cell input {
        width: 100%; background: transparent; border: none;
        color: var(--text-primary); font-family: 'Inter'; font-size: 0.9rem;
        outline: none;
    }
    .input-cell input::placeholder { color: var(--text-tertiary); font-style: italic; }
    .icon-plus { font-size: 1.2rem; line-height: 0; }
</style>