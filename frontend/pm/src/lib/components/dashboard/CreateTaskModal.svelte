<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type UserSummary, type Column } from '$lib/api';
    import GlassCard from '$lib/components/ui/GlassCard.svelte';

    export let isOpen = false;
    export let projectId: string;
    export let columns: Column[] = [];
    export let members: UserSummary[] = [];
    
    // Pre-fill data (optional)
    export let defaultDate: Date | null = null;

    let title = "";
    let columnId = "";
    let assigneeId = "";
    let dueDate = "";
    let isSubmitting = false;

    const dispatch = createEventDispatcher();

    // Auto-select first column (usually "To Do")
    $: if (isOpen && columns.length > 0 && !columnId) {
        columnId = columns[0].id;
    }

    // Pre-fill date if provided
    $: if (isOpen && defaultDate) {
        dueDate = defaultDate.toISOString().split('T')[0];
    }

    async function handleSubmit() {
        if (!title.trim() || !columnId) return;
        isSubmitting = true;

        try {
            const payload: any = {
                column_id: columnId,
                title: title,
            };
            if (assigneeId) payload.assignee_id = assigneeId;
            // Add due date support to API if needed, for now we handle basic creation
            // (If your backend supports due_date on create, add it here)
            
            const newTask = await api.tasks.create(projectId, payload);
            
            // If due date was set, we might need a separate update or backend change
            if (dueDate) {
                await api.tasks.update(newTask.id, { due_date: new Date(dueDate).toISOString() });
                newTask.due_date = new Date(dueDate).toISOString();
            }

            dispatch('created', newTask);
            close();
        } catch (e) {
            console.error("Task creation failed", e);
        } finally {
            isSubmitting = false;
        }
    }

    function close() {
        isOpen = false;
        title = "";
        dueDate = "";
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" on:click|self={close}>
        <div class="modal-content">
            <GlassCard>
                <div class="inner">
                    <h3>New Task</h3>
                    
                    <input 
                        class="title-input" 
                        bind:value={title} 
                        placeholder="What needs to be done?" 
                        autofocus
                        on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
                    />

                    <div class="controls">
                        <div class="control-group">
                            <label>Status</label>
                            <select bind:value={columnId}>
                                {#each columns as col}
                                    <option value={col.id}>{col.name}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="control-group">
                            <label>Assignee</label>
                            <select bind:value={assigneeId}>
                                <option value="">Unassigned</option>
                                {#each members as member}
                                    <option value={member.id}>{member.full_name}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="control-group">
                            <label>Due Date</label>
                            <input type="date" bind:value={dueDate} />
                        </div>
                    </div>

                    <div class="actions">
                        <button class="cancel" on:click={close}>Cancel</button>
                        <button class="create" on:click={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Issue'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
        z-index: 200; display: flex; align-items: center; justify-content: center;
    }
    .modal-content { width: 100%; max-width: 600px; padding: 20px; }
    
    .inner { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
    h3 { margin: 0; font-size: 1.1rem; color: var(--text-secondary); }

    .title-input {
        background: transparent; border: none; 
        font-size: 1.5rem; color: var(--text-primary);
        outline: none; font-weight: 600; width: 100%;
    }
    .title-input::placeholder { opacity: 0.4; }

    .controls {
        display: flex; gap: 16px; flex-wrap: wrap;
        padding-top: 16px; border-top: 1px solid var(--glass-border);
    }

    .control-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; }
    label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700; }
    
    select, input[type="date"] {
        background: var(--glass-highlight); border: 1px solid var(--glass-border);
        color: var(--text-primary); padding: 8px; border-radius: 6px;
        outline: none; width: 100%;
    }

    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
    
    button { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
    .cancel { background: transparent; color: var(--text-secondary); }
    .create { background: var(--text-primary); color: var(--bg-main); }
    .create:hover { opacity: 0.9; }
</style>