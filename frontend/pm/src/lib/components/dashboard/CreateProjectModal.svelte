<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { api } from '$lib/api';

    export let isOpen = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let description = '';
    let isSubmitting = false;

    async function handleSubmit() {
        if (!name.trim()) return;
        isSubmitting = true;

        try {
            const newProject = await api.projects.create({ name, description });
            dispatch('created', newProject);
            close();
        } catch (e) {
            console.error("Failed to create project", e);
        } finally {
            isSubmitting = false;
        }
    }

    function close() {
        isOpen = false;
        name = '';
        description = '';
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click|self={close}>
        <div class="modal-window" transition:fly={{ y: 20, duration: 200 }}>
            <div class="modal-header">
                <h2>Create New Project</h2>
                <button class="close-btn" on:click={close}>✕</button>
            </div>
            
            <form class="modal-body" on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="p-name">Project Name</label>
                    <input 
                        id="p-name"
                        type="text" 
                        bind:value={name} 
                        placeholder="e.g. Apollo Launch, Q3 Roadmap..." 
                        autofocus
                    />
                </div>
                
                <div class="form-group">
                    <label for="p-desc">Description</label>
                    <textarea 
                        id="p-desc"
                        bind:value={description} 
                        placeholder="What is this project about?"
                        rows="3"
                    ></textarea>
                </div>

                <div class="modal-footer">
                    <button type="button" class="cancel-btn" on:click={close}>Cancel</button>
                    <button type="submit" class="create-btn" disabled={isSubmitting || !name}>
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
        z-index: 100; display: grid; place-items: center;
    }

    .modal-window {
        width: 500px; max-width: 90vw;
        background: var(--bg-main); border: 1px solid var(--glass-border);
        border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        overflow: hidden;
    }

    .modal-header {
        padding: 16px 24px; border-bottom: 1px solid var(--glass-border);
        display: flex; justify-content: space-between; align-items: center;
        background: var(--glass-highlight);
    }
    h2 { margin: 0; font-size: 1.1rem; color: var(--text-primary); }
    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; }

    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; }
    
    input, textarea {
        background: var(--card-bg); border: 1px solid var(--glass-border);
        padding: 10px; border-radius: 6px; color: var(--text-primary);
        font-family: 'Inter'; font-size: 0.95rem; outline: none;
        transition: border-color 0.2s;
    }
    input:focus, textarea:focus { border-color: var(--orb-1-color); }

    .modal-footer {
        display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;
    }

    .cancel-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 8px 16px; }
    .create-btn {
        background: var(--text-primary); color: var(--bg-main); border: none;
        padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;
    }
    .create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>