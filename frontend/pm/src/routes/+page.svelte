<script lang="ts">
    import { onMount } from 'svelte';
    import { api, type Project } from '$lib/api';
    import ProjectCard from '$lib/components/dashboard/ProjectCard.svelte';
    import GlassCard from '$lib/components/ui/GlassCard.svelte';
    import CreateProjectModal from '$lib/components/dashboard/CreateProjectModal.svelte';

    let projects = $state<Project[]>([]);
    let loading = $state(true);
    let showModal = $state(false);

    onMount(async () => {
        try {
            const data = await api.projects.list();
            projects = data || [];
        } catch (e) {
            console.error("System Offline", e);
            projects = [];
        } finally {
            loading = false;
        }
    });

    function handleProjectCreated(event: CustomEvent) {
        projects = [event.detail, ...projects];
    }
</script>

<CreateProjectModal bind:isOpen={showModal} on:created={handleProjectCreated} />

<div class="view-container">
    <header>
        <div class="title-stack">
            <h1>Workspace</h1>
            <p>Select a frequency to tune into.</p>
        </div>
        <button class="primary-btn" on:click={() => showModal = true}>
            Initialize Project
        </button>
    </header>

    <div class="grid">
        {#if loading}
            {#each Array(3) as _} <div class="skeleton-card"></div> {/each}
        {:else}
            {#each projects as project}
                <ProjectCard {project} />
            {/each}

            <button class="create-trigger" on:click={() => showModal = true}>
                <GlassCard hoverable={true}>
                    <div class="dashed-state">
                        <span class="plus">+</span>
                        <span>New Sequence</span>
                    </div>
                </GlassCard>
            </button>
        {/if}
    </div>
</div>

<style>
    .view-container { max-width: 1400px; margin: 0 auto; padding-bottom: 80px; }
    
    header { 
        display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px;
        padding-bottom: 24px; border-bottom: 1px solid var(--glass-border); /* THEME AWARE */
    }

    h1 { 
        font-size: 4rem; letter-spacing: -2px; margin: 0;
        /* Gradient text that adapts to theme (White->Grey in Dark, Black->Grey in Light) */
        background: linear-gradient(to bottom right, var(--text-primary), var(--text-secondary)); 
        -webkit-background-clip: text; color: transparent; 
    }

    p { color: var(--text-secondary); font-size: 1.1rem; margin-top: 8px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }

    .primary-btn { 
        /* Inverted colors for high contrast */
        background: var(--text-primary); 
        color: var(--bg-main);
        border: none; padding: 16px 32px; border-radius: 100px; font-weight: 600;
        font-family: 'Space Grotesk'; font-size: 1rem; cursor: pointer; transition: 0.2s; 
    }
    .primary-btn:hover { 
        transform: scale(1.05); 
        box-shadow: 0 0 30px var(--glass-highlight);
    }

    .create-trigger { background: none; border: none; padding: 0; cursor: pointer; text-align: left; width: 100%; height: 100%; }
    
    .dashed-state { 
        height: 280px; display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 16px; 
        border: 2px dashed var(--glass-border); /* THEME AWARE */
        border-radius: 24px; 
        color: var(--text-secondary); /* THEME AWARE */
        transition: 0.2s;
    }
    
    .create-trigger:hover .dashed-state { 
        border-color: var(--orb-1-color); 
        color: var(--orb-1-color); 
        background: var(--glass-highlight);
    }

    .plus { font-size: 2.5rem; font-weight: 300; }

    .skeleton-card { 
        height: 280px; 
        background: var(--glass-highlight); /* THEME AWARE */
        border-radius: 24px; animation: pulse 1.5s infinite; 
    }
    
    @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
</style>