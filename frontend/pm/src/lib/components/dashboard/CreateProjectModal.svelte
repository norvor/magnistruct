<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api } from '$lib/api';
    import GlassCard from '$lib/components/ui/GlassCard.svelte';

    export let isOpen = false;
    
    let name = "";
    let description = "";
    let isSubmitting = false;

    const dispatch = createEventDispatcher();

    async function handleSubmit() {
        if (!name.trim()) return;
        isSubmitting = true;

        try {
            // Using the centralized API
            const newProject = await api.projects.create(name, description);
            
            dispatch('created', newProject);
            close();
        } catch (e) {
            console.error("Creation failed", e);
        } finally {
            isSubmitting = false;
        }
    }

    function close() {
        isOpen = false;
        // Reset fields
        name = "";
        description = "";
    }
</script>

{#if isOpen}
    <div class="modal-backdrop" on:click|self={close} role="dialog">
        <div class="modal-content">
            <GlassCard>
                <div class="inner">
                    <h2>Initialize Project</h2>
                    
                    <div class="input-group">
                        <label>Codename</label>
                        <input type="text" bind:value={name} placeholder="e.g. Project Manhattan" autofocus>
                    </div>

                    <div class="input-group">
                        <label>Brief</label>
                        <textarea bind:value={description} placeholder="Protocol description..."></textarea>
                    </div>

                    <div class="actions">
                        <button class="cancel" on:click={close}>Abort</button>
                        <button class="confirm" on:click={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Initializing...' : 'Initialize Sequence'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    </div>
{/if}

<style>
    /* Styles identical to previous version */
    .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
        z-index: 100; display: flex; align-items: center; justify-content: center;
    }
    .modal-content { width: 100%; max-width: 500px; padding: 20px; animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    
    .inner { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    h2 { margin: 0; font-size: 1.5rem; }

    .input-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; }
    
    input, textarea {
        background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
        padding: 12px; border-radius: 8px; color: white; font-family: 'Inter'; font-size: 1rem;
        outline: none; transition: 0.2s; resize: none;
    }
    input:focus, textarea:focus { border-color: #2dd4bf; background: rgba(45, 212, 191, 0.05); }
    textarea { height: 100px; }

    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
    
    button { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
    .cancel { background: transparent; color: #94a3b8; }
    .cancel:hover { color: white; }
    .confirm { background: #fff; color: black; }
    .confirm:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.2); }

    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>