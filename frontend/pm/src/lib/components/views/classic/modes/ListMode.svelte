<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Task } from '$lib/api';
    
    export let allTasks: Task[];
    const dispatch = createEventDispatcher();
    
    let newTaskTitle = '';

    // Helper: Check if date is in past
    function isOverdue(dateStr?: string) {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date() && new Date().toDateString() !== new Date(dateStr).toDateString();
    }

    // Helper: Progress width
    function getProgress(t: Task) {
        const total = t.classic?.subtasks?.length || 0;
        const done = t.classic?.subtasks?.filter(s => s.is_complete).length || 0;
        return total === 0 ? 0 : (done / total) * 100;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && newTaskTitle.trim()) {
            // Dispatch event to parent to create task
            dispatch('requestCreate', { title: newTaskTitle });
            newTaskTitle = ''; // Clear input
        }
    }
</script>

<div class="list-canvas scroll-hide">
    <div class="grid-row header">
        <div class="cell id">ID</div>
        <div class="cell title">Task Name</div>
        <div class="cell prio">Priority</div>
        <div class="cell assignee">Assignee</div>
        <div class="cell due">Due Date</div>
        <div class="cell progress">Progress</div>
        <div class="cell hours">Effort</div>
    </div>
    
    <div class="grid-row create-row">
        <div class="cell id"><span class="plus-icon">+</span></div>
        <div class="cell title">
            <input 
                type="text" 
                placeholder="Type to add new task..." 
                bind:value={newTaskTitle}
                on:keydown={handleKeyDown}
            />
        </div>
        <div class="cell prio"><span class="ghost-text">Default</span></div>
        <div class="cell assignee"><span class="ghost-text">--</span></div>
        <div class="cell due"><span class="ghost-text">--</span></div>
        <div class="cell progress"></div>
        <div class="cell hours"></div>
    </div>

    <div class="grid-body">
        {#each allTasks as task}
            <div class="grid-row body" on:click={() => dispatch('openTask', task)}>
                
                <div class="cell id"><span class="mono">#{task.classic?.short_id}</span></div>

                <div class="cell title">
                    <div class="status-dot" class:done={task.classic?.is_complete}></div>
                    <span class="text" class:done={task.classic?.is_complete}>{task.title}</span>
                    {#if task.classic?.tags}<div class="mini-tag">{task.classic.tags.split(',')[0]}</div>{/if}
                </div>

                <div class="cell prio">
                    <span class="prio-badge {task.classic?.priority}">{task.classic?.priority?.toUpperCase()}</span>
                </div>

                <div class="cell assignee">
                    {#if task.classic?.assignee}
                        <div class="avatar-pill">
                            <div class="av-circle">{task.classic.assignee.full_name[0]}</div>
                            <span class="av-name">{task.classic.assignee.full_name.split(' ')[0]}</span>
                        </div>
                    {:else}<span class="empty-dash">—</span>{/if}
                </div>

                <div class="cell due">
                    {#if task.classic?.due_date}
                        <span class="date-pill" class:overdue={isOverdue(task.classic.due_date)}>
                            {new Date(task.classic.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                    {:else}<span class="empty-dash">—</span>{/if}
                </div>

                <div class="cell progress">
                    <div class="prog-track"><div class="prog-fill" style="width: {getProgress(task)}%"></div></div>
                </div>

                <div class="cell hours">
                    {#if task.classic?.estimated_hours}
                        <span class="hours-text">{task.classic.logged_hours || 0} / {task.classic.estimated_hours}h</span>
                    {/if}
                </div>

            </div>
        {/each}
    </div>
</div>

<style>
    .list-canvas { display: flex; flex-direction: column; height: 100%; overflow-y: auto; padding: 0 32px 40px 32px; }

    /* GRID DEFINITION */
    .grid-row {
        display: grid; 
        grid-template-columns: 60px 3fr 100px 140px 120px 100px 80px; 
        gap: 16px; align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--glass-border);
    }

    /* HEADER */
    .grid-row.header {
        position: sticky; top: 0; background: rgba(0,0,0,0.01); backdrop-filter: blur(12px); z-index: 10;
        font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;
        padding-top: 20px; padding-bottom: 12px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border);
    }

    /* QUICK CREATE ROW */
    .grid-row.create-row {
        background: rgba(255,255,255,0.03); border: 1px dashed var(--glass-border); border-radius: 8px; margin-bottom: 8px;
    }
    .create-row input {
        width: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); font-weight: 500; font-size: 0.9rem;
    }
    .create-row input::placeholder { color: var(--text-secondary); opacity: 0.7; }
    .plus-icon { color: var(--swiss-accent); font-weight: bold; font-size: 1.2rem; }
    .ghost-text { color: var(--text-tertiary); font-size: 0.8rem; font-style: italic; }

    /* BODY ROWS */
    .grid-row.body {
        cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: var(--text-primary);
        border-bottom: 1px solid rgba(255,255,255,0.03); border-radius: 8px;
    }
    .grid-row.body:hover { background: var(--glass-highlight); transform: translateX(4px); }

    /* CELLS */
    .cell { display: flex; align-items: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .id .mono { font-family: 'Space Grotesk', monospace; color: var(--text-tertiary); font-size: 0.8rem; }
    .title { gap: 12px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--text-secondary); }
    .status-dot.done { background: var(--text-secondary); border-color: transparent; }
    .text { font-weight: 500; }
    .text.done { text-decoration: line-through; color: var(--text-tertiary); }
    .mini-tag { font-size: 0.65rem; background: var(--glass-highlight); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); margin-left: auto; }
    .prio-badge { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; width: 100%; text-align: center; }
    .prio-badge.p1 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .prio-badge.p2 { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .prio-badge.p3 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .prio-badge.p4 { background: var(--glass-highlight); color: var(--text-secondary); }
    .avatar-pill { display: flex; align-items: center; gap: 8px; background: var(--glass-highlight); padding: 2px 8px 2px 2px; border-radius: 20px; }
    .av-circle { width: 20px; height: 20px; border-radius: 50%; background: var(--orb-1-color); color: var(--bg-main); font-size: 0.6rem; font-weight: 700; display: grid; place-items: center; }
    .av-name { font-size: 0.75rem; font-weight: 500; }
    .date-pill { font-size: 0.8rem; color: var(--text-secondary); }
    .date-pill.overdue { color: var(--swiss-danger); font-weight: 600; }
    .prog-track { width: 100%; height: 4px; background: var(--glass-border); border-radius: 3px; overflow: hidden; }
    .prog-fill { height: 100%; background: var(--swiss-success); }
    .hours-text { font-family: 'Space Grotesk', monospace; font-size: 0.8rem; color: var(--text-tertiary); }
    .empty-dash { color: var(--text-tertiary); opacity: 0.3; }
</style>