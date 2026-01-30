<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { api, type Column, type UserSummary } from '$lib/api';

    export let isOpen = false;
    export let projectId: string;
    export let columns: Column[] = [];
    export let members: UserSummary[] = [];
    export let defaultDate: Date | null = null;
    export let activeEngine = 'classic'; // NEW: Context awareness

    const dispatch = createEventDispatcher();

    let title = '';
    let selectedColId = '';
    let selectedAssignee = '';
    let isSubmitting = false;

    // Auto-select first column only in Classic Mode
    $: if (isOpen && activeEngine === 'classic' && columns.length > 0 && !selectedColId) {
        selectedColId = columns[0].id;
    }

    async function handleSubmit() {
        if (!title.trim()) return;
        isSubmitting = true;

        try {
            // Polymorphic Payload construction
            const payload: any = {
                title,
                engine_type: activeEngine, // Tells backend where to route this
                assignee_id: selectedAssignee || null
            };

            // Classic-Specific Fields
            if (activeEngine === 'classic') {
                payload.column_id = selectedColId;
                if (defaultDate) {
                    payload.due_date = defaultDate.toISOString();
                }
            }

            // Seed/River fields could be added here in the future
            
            const newTask = await api.tasks.create(projectId, payload);
            
            dispatch('created', newTask);
            close();
        } catch (e) {
            console.error("Failed to create task", e);
        } finally {
            isSubmitting = false;
        }
    }

    function close() {
        isOpen = false;
        title = '';
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') close();
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
    <div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click|self={close}>
        <div class="modal-window" transition:fly={{ y: 20, duration: 200 }}>
            <div class="modal-header">
                <h2>New {activeEngine.charAt(0).toUpperCase() + activeEngine.slice(1)} Task</h2>
                <button class="close-btn" on:click={close}>✕</button>
            </div>

            <div class="modal-body">
                <input 
                    class="title-input" 
                    bind:value={title} 
                    placeholder="What needs to be done?" 
                    autofocus
                    on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <div class="controls-row">
                    {#if activeEngine === 'classic'}
                        <div class="control-group">
                            <label>Status</label>
                            <select bind:value={selectedColId}>
                                {#each columns as col}
                                    <option value={col.id}>{col.name}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}

                    <div class="control-group">
                        <label>Assignee</label>
                        <select bind:value={selectedAssignee}>
                            <option value="">Unassigned</option>
                            {#each members as member}
                                <option value={member.id}>{member.full_name}</option>
                            {/each}
                        </select>
                    </div>

                    {#if activeEngine === 'classic' && defaultDate}
                        <div class="date-badge">
                            📅 {defaultDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
                <button class="cancel-btn" on:click={close}>Cancel</button>
                <button class="create-btn" on:click={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Issue'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 200;
        display: grid; place-items: center;
    }

    .modal-window {
        width: 600px;
        max-width: 90vw;
        background: var(--bg-main);
        border: 1px solid var(--glass-border);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        border-radius: 12px;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid var(--glass-border);
        display: flex; justify-content: space-between; align-items: center;
        background: var(--glass-highlight);
    }
    h2 { margin: 0; font-size: 1.1rem; color: var(--text-primary); }
    .close-btn { background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; }

    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .title-input {
        background: transparent; border: none;
        font-size: 1.2rem; font-weight: 500; color: var(--text-primary);
        font-family: 'Inter'; width: 100%; outline: none;
        padding-bottom: 8px; border-bottom: 1px solid var(--glass-border);
    }
    .title-input:focus { border-bottom-color: var(--orb-1-color); }

    .controls-row { display: flex; gap: 16px; align-items: flex-end; }

    .control-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .control-group label { font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; }

    select {
        background: var(--card-bg); border: 1px solid var(--glass-border);
        color: var(--text-primary); padding: 8px; border-radius: 6px;
        font-size: 0.9rem; cursor: pointer; width: 100%; outline: none;
    }
    select:focus { border-color: var(--orb-1-color); }

    .date-badge {
        padding: 8px 12px; background: var(--glass-highlight);
        border-radius: 6px; font-size: 0.9rem; color: var(--text-secondary);
        border: 1px solid var(--glass-border);
    }

    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--glass-border);
        display: flex; justify-content: flex-end; gap: 12px;
        background: var(--card-bg);
    }

    .cancel-btn {
        background: transparent; border: none; color: var(--text-secondary);
        padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;
    }
    .cancel-btn:hover { color: var(--text-primary); }

    .create-btn {
        background: var(--text-primary); color: var(--bg-main);
        border: none; padding: 8px 20px; border-radius: 6px;
        font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .create-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>