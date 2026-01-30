<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { api, type Task, type Subtask } from '$lib/api';

    export let isOpen = false;
    export let task: Task | null = null;
    
    const dispatch = createEventDispatcher();
    let newSubtaskTitle = '';
    let activeTab = 'overview';

    // --- SYNC ACTIONS ---

    // 1. GENERIC FIELD UPDATE
    async function updateField(field: string, value: any) {
        if (!task || !task.classic) return;
        
        // Optimistic Update
        (task.classic as any)[field] = value;
        task = { ...task }; 
        dispatch('update', task); // INSTANT SYNC

        // API Call
        const payload: any = {};
        payload[field] = value;
        
        // Special casting for numbers
        if (field === 'estimated_hours' || field === 'logged_hours') payload[field] = parseFloat(value);
        if (field === 'story_points') payload[field] = parseInt(value);

        await api.tasks.update(task.id, payload);
    }

    // 2. TOGGLE COMPLETE (The missing link)
    async function toggleComplete() {
        if (!task || !task.classic) return;
        
        const newStatus = !task.classic.is_complete;
        task.classic.is_complete = newStatus;
        task = { ...task };
        dispatch('update', task); // INSTANT SYNC

        await api.tasks.update(task.id, { is_complete: newStatus });
    }

    // 3. SUBTASKS
    async function addSubtask() {
        if (!task || !newSubtaskTitle.trim()) return;
        const sub = await api.tasks.createSubtask(task.id, newSubtaskTitle);
        if (task.classic) {
            task.classic.subtasks = [...(task.classic.subtasks || []), sub];
            dispatch('update', task); // SYNC
        }
        newSubtaskTitle = '';
    }

    async function toggleSubtask(sub: Subtask) {
        if (!task || !task.classic) return;
        sub.is_complete = !sub.is_complete;
        task.classic.subtasks = task.classic.subtasks; 
        dispatch('update', task); // SYNC
        await api.tasks.toggleSubtask(sub.id);
    }

    async function deleteSubtask(subId: string) {
        if (!task || !task.classic) return;
        task.classic.subtasks = task.classic.subtasks.filter(s => s.id !== subId);
        dispatch('update', task); // SYNC
        await api.tasks.deleteSubtask(subId);
    }

    // 4. DELETE TASK
    async function handleDeleteTask() {
        if (!task || !confirm("Permanently delete this task?")) return;
        await api.tasks.delete(task.id);
        dispatch('delete', task.id);
        close();
    }

    function close() { dispatch('close'); }
</script>

{#if isOpen && task}
    <div class="drawer-backdrop" transition:fade={{duration: 100}} on:click={close}>
        <div class="drawer-panel" transition:fly={{x: 400, duration: 250}} on:click|stopPropagation>
            
            <header>
                <div class="header-left">
                    <button 
                        class="status-btn" 
                        class:done={task.classic?.is_complete}
                        on:click={toggleComplete}
                        title="Mark Complete"
                    >
                        ✓
                    </button>

                    <span class="id-badge">#{task.classic?.short_id}</span>
                </div>
                
                <div class="header-right">
                    <select 
                        class="prio-select {task.classic?.priority}" 
                        value={task.classic?.priority}
                        on:change={(e) => updateField('priority', e.currentTarget.value)}
                    >
                        <option value="p1">Critical</option>
                        <option value="p2">High</option>
                        <option value="p3">Medium</option>
                        <option value="p4">Low</option>
                    </select>
                    <div class="sep"></div>
                    <button class="icon-btn danger" on:click={handleDeleteTask}>🗑</button>
                    <button class="close-btn" on:click={close}>&times;</button>
                </div>
            </header>

            <div class="title-section">
                <input 
                    type="text" 
                    class="title-input" 
                    class:done={task.classic?.is_complete}
                    value={task.title} 
                    on:change={(e) => api.tasks.update(task.id, { title: e.currentTarget.value })}
                    on:input={(e) => { task.title = e.currentTarget.value; dispatch('update', task); }}
                />
            </div>

            <div class="tabs">
                <button class:active={activeTab==='overview'} on:click={() => activeTab='overview'}>Overview</button>
                <button class:active={activeTab==='activity'} on:click={() => activeTab='activity'}>Activity</button>
            </div>

            <div class="content-scroll scroll-hide">
                {#if activeTab === 'overview'}
                    <div class="meta-grid">
                        <div class="meta-field">
                            <label>Est. Hours</label>
                            <input type="number" value={task.classic?.estimated_hours} on:input={(e) => updateField('estimated_hours', e.currentTarget.value)} />
                        </div>
                        <div class="meta-field">
                            <label>Logged</label>
                            <input type="number" value={task.classic?.logged_hours} on:input={(e) => updateField('logged_hours', e.currentTarget.value)} />
                        </div>
                        <div class="meta-field">
                            <label>Points</label>
                            <input type="number" value={task.classic?.story_points} on:input={(e) => updateField('story_points', e.currentTarget.value)} />
                        </div>
                    </div>

                    <div class="section">
                        <h4>Subtasks</h4>
                        <div class="subtask-list">
                            {#if task.classic?.subtasks}
                                {#each task.classic.subtasks as sub}
                                    <div class="subtask-row">
                                        <input type="checkbox" checked={sub.is_complete} on:change={() => toggleSubtask(sub)} />
                                        <span class:done={sub.is_complete}>{sub.title}</span>
                                        <button class="del-sub-btn" on:click={() => deleteSubtask(sub.id)}>&times;</button>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                        <div class="add-subtask">
                            <input 
                                type="text" 
                                placeholder="+ Add subtask..." 
                                bind:value={newSubtaskTitle}
                                on:keydown={(e) => e.key === 'Enter' && addSubtask()}
                            />
                        </div>
                    </div>

                    <div class="section">
                        <h4>Description</h4>
                        <textarea 
                            class="desc-box" 
                            placeholder="Add details..."
                            value={task.description}
                            on:change={(e) => updateField('description', e.currentTarget.value)}
                        ></textarea>
                    </div>
                {:else}
                    <div class="empty-tab">No activity recorded.</div>
                {/if}
            </div>
            
            <div class="drawer-footer">
                <div class="assignee-row">
                    <div class="avatar">{task.classic?.assignee?.full_name[0] || '?'}</div>
                    <span>{task.classic?.assignee?.full_name || 'Unassigned'}</span>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* BASE DRAWER STYLES */
    .drawer-backdrop { position: fixed; top: 0; right: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: flex-end; }
    .drawer-panel { width: 500px; height: 100%; background: var(--swiss-bg); border-left: 1px solid var(--glass-border); display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.3); }

    /* HEADER */
    header { padding: 20px 24px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
    .header-left, .header-right { display: flex; align-items: center; gap: 16px; }

    /* STATUS CHECKBOX (Big Sync Button) */
    .status-btn {
        width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--text-tertiary);
        background: transparent; color: transparent; cursor: pointer; font-size: 1.2rem; display: grid; place-items: center;
        transition: 0.2s;
    }
    .status-btn:hover { border-color: var(--swiss-success); color: var(--swiss-success); }
    .status-btn.done { background: var(--swiss-success); border-color: var(--swiss-success); color: #fff; }

    .id-badge { font-family: 'Space Grotesk', monospace; color: var(--text-tertiary); font-weight: 700; }
    .prio-select { background: var(--input-bg); border: 1px solid var(--glass-border); color: var(--text-primary); padding: 6px 10px; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; }
    .prio-select.p1 { color: var(--swiss-danger); }

    /* TITLE */
    .title-section { padding: 24px 24px 0 24px; }
    .title-input { width: 100%; background: transparent; border: none; color: var(--text-primary); font-size: 1.5rem; font-weight: 700; outline: none; }
    .title-input.done { text-decoration: line-through; color: var(--text-tertiary); }

    /* TABS */
    .tabs { display: flex; gap: 24px; padding: 0 24px; border-bottom: 1px solid var(--glass-border); margin-top: 16px; }
    .tabs button { background: none; border: none; color: var(--text-secondary); padding: 12px 0; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; }
    .tabs button:hover { color: var(--text-primary); }
    .tabs button.active { color: var(--text-primary); border-bottom-color: var(--swiss-accent); }

    /* CONTENT */
    .content-scroll { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 32px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .meta-field { background: var(--input-bg); border: 1px solid var(--glass-border); padding: 8px 12px; border-radius: 12px; }
    .meta-field label { display: block; font-size: 0.65rem; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; }
    .meta-field input { width: 100%; background: transparent; border: none; color: var(--text-primary); font-size: 1rem; font-family: 'Space Grotesk'; font-weight: 600; outline: none; }

    /* SUBTASKS */
    h4 { margin: 0 0 16px 0; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; }
    .subtask-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .subtask-row { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; transition: 0.2s; }
    .subtask-row:hover { background: var(--glass-highlight); }
    .subtask-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--swiss-accent); }
    .subtask-row span { flex: 1; color: var(--text-primary); }
    .subtask-row span.done { text-decoration: line-through; color: var(--text-tertiary); }
    .del-sub-btn { opacity: 0; background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 1.2rem; }
    .subtask-row:hover .del-sub-btn { opacity: 1; }

    .add-subtask input { width: 100%; background: var(--input-bg); border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px; color: var(--text-primary); outline: none; }
    .desc-box { width: 100%; height: 150px; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; color: var(--text-primary); resize: vertical; outline: none; line-height: 1.6; }

    /* FOOTER */
    .drawer-footer { padding: 20px 24px; border-top: 1px solid var(--glass-border); background: var(--glass-highlight); }
    .assignee-row { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 0.9rem; }
    .avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--orb-1-color); color: var(--bg-main); font-weight: 700; display: grid; place-items: center; font-size: 0.7rem; }
    .close-btn { background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
    .icon-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary); }
    .sep { width: 1px; height: 20px; background: var(--glass-border); }
    .empty-tab { text-align: center; color: var(--text-tertiary); margin-top: 40px; }
</style>