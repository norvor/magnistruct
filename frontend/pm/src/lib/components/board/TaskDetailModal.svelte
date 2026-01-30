<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { api, type Task, type UserSummary } from '$lib/api';

    export let isOpen = false;
    export let task: Task | null = null;
    export let members: UserSummary[] = [];

    const dispatch = createEventDispatcher();
    
    // Local state
    let title = '';
    let description = '';
    let priority = 'p4';
    let dueDate = '';
    let saveTimer: any;
    let isDeleting = false;

    // Sync local state when task opens
    $: if (task) {
        title = task.title;
        description = task.description || '';
        priority = task.priority;
        // Format Date for Input (YYYY-MM-DD)
        dueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
    }

    function close() {
        dispatch('close');
    }

    // --- AUTO SAVE LOGIC ---
    function handleInput() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
            if (!task) return;
            
            // Convert empty date string to null for backend
            const payload: any = { title, description, priority };
            if (dueDate) payload.due_date = new Date(dueDate).toISOString();

            try {
                await api.tasks.update(task.id, payload);
                
                // Update Parent UI
                dispatch('update', { 
                    ...task, 
                    title, 
                    description, 
                    priority,
                    due_date: dueDate ? new Date(dueDate).toISOString() : undefined 
                });
            } catch (e) {
                console.error("Auto-save failed", e);
            }
        }, 800);
    }

    async function updateAssignee(userId: string) {
        if (!task) return;
        try {
            // If empty string, send null (unassign)
            await api.tasks.update(task.id, { assignee_id: userId || null });
            
            const user = members.find(m => m.id === userId);
            const updatedTask = { ...task, assignee: user };
            
            dispatch('update', updatedTask);
        } catch (e) {
            console.error("Assign failed", e);
        }
    }

    // --- DELETE LOGIC ---
    async function handleDelete() {
        if (!task) return;
        if (!confirm("Are you sure you want to delete this issue? This cannot be undone.")) return;

        isDeleting = true;
        try {
            await api.tasks.delete(task.id);
            dispatch('delete', task.id); // Tell parent to remove from board
            close();
        } catch (e) {
            console.error("Delete failed", e);
            alert("Could not delete task");
        } finally {
            isDeleting = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') close();
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen && task}
    <div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click|self={close}>
        <div class="modal-window" transition:fly={{ y: 20, duration: 200 }}>
            
            <div class="modal-header">
                <div class="breadcrumbs">
                    <span class="id-badge">MAG-{task.short_id}</span>
                </div>
                <div class="actions">
                    <button class="close-btn" on:click={close}>✕</button>
                </div>
            </div>

            <div class="modal-body">
                <div class="main-content">
                    <input 
                        class="title-input" 
                        bind:value={title} 
                        on:input={handleInput} 
                        placeholder="Task Title"
                    />
                    
                    <textarea 
                        class="desc-input" 
                        bind:value={description} 
                        on:input={handleInput} 
                        placeholder="Add a description..."
                    ></textarea>

                    </div>

                <aside class="sidebar">
                    <div class="property-group">
                        <label>Priority</label>
                        <select bind:value={priority} on:change={handleInput} class="clean-select">
                            <option value="p1">High Priority (Red)</option>
                            <option value="p2">Medium (Orange)</option>
                            <option value="p3">Low (Blue)</option>
                            <option value="p4">None (Grey)</option>
                        </select>
                    </div>

                    <div class="property-group">
                        <label>Assignee</label>
                        <select 
                            class="clean-select" 
                            value={task.assignee?.id || ''} 
                            on:change={(e) => updateAssignee(e.currentTarget.value)}
                        >
                            <option value="">Unassigned</option>
                            {#each members as member}
                                <option value={member.id}>{member.full_name}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="property-group">
                        <label>Due Date</label>
                        <input 
                            type="date" 
                            class="clean-select"
                            bind:value={dueDate}
                            on:change={handleInput}
                        />
                    </div>

                    <div class="spacer"></div>

                    <button class="delete-btn" on:click={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete Issue'}
                    </button>
                </aside>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: grid;
        place-items: center;
    }

    .modal-window {
        width: 900px;
        max-width: 90vw;
        height: 80vh;
        background: var(--bg-main);
        border: 1px solid var(--glass-border);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        display: flex; flex-direction: column; overflow: hidden;
    }

    .modal-header {
        padding: 16px 24px; border-bottom: 1px solid var(--glass-border);
        display: flex; justify-content: space-between; align-items: center;
    }

    .id-badge { font-family: 'Space Grotesk', monospace; color: var(--text-tertiary); font-size: 0.8rem; }
    .close-btn { background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; }

    .modal-body { display: grid; grid-template-columns: 1fr 260px; flex: 1; overflow: hidden; }

    .main-content { padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }

    .title-input {
        background: transparent; border: none;
        font-size: 1.5rem; font-weight: 600; color: var(--text-primary);
        font-family: 'Space Grotesk'; width: 100%; outline: none;
    }

    .desc-input {
        background: transparent; border: none;
        font-size: 1rem; color: var(--text-secondary);
        font-family: 'Inter'; resize: none; flex: 1; line-height: 1.6; outline: none;
    }

    /* SIDEBAR */
    .sidebar {
        background: var(--glass-highlight); border-left: 1px solid var(--glass-border);
        padding: 24px; display: flex; flex-direction: column; gap: 24px;
    }

    .property-group { display: flex; flex-direction: column; gap: 8px; }
    .property-group label { font-size: 0.75rem; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; }

    .clean-select {
        background: transparent; border: 1px solid var(--glass-border);
        color: var(--text-primary); padding: 6px 8px; border-radius: 6px;
        font-size: 0.9rem; cursor: pointer; width: 100%;
    }
    .clean-select:focus { border-color: var(--orb-1-color); outline: none; }
    option { background: #0f172a; color: white; }

    .spacer { flex: 1; }

    .delete-btn {
        background: transparent; border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444; padding: 8px; border-radius: 6px;
        font-size: 0.8rem; cursor: pointer; transition: 0.2s;
    }
    .delete-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
</style>