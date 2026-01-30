<script lang="ts">
    import { onMount } from 'svelte';
    import { api, type Project } from '$lib/api';
    import CreateProjectModal from '$lib/components/dashboard/CreateProjectModal.svelte';
    import { fade } from 'svelte/transition';

    let projects: Project[] = [];
    let loading = true;
    let showCreateModal = false;

    // Visual map for engine icons
    const ENGINE_ICONS: Record<string, string> = {
        classic: '▣', seed: '🌰', river: '🌊', tree: '🌳', 
        hive: '🐝', shell: '🐚', wave: '🌊', nest: '🪺', cocoon: '🐛'
    };

    async function loadProjects() {
        try {
            projects = await api.projects.list();
        } catch (e) {
            console.error("Failed to load projects", e);
        } finally {
            loading = false;
        }
    }

    function handleProjectCreated(e: CustomEvent<Project>) {
        // Optimistically add the new project to the top
        projects = [e.detail, ...projects];
    }

    onMount(loadProjects);
</script>

<div class="dashboard-container">
    <header>
        <div class="header-content">
            <h1>Projects</h1>
            <button class="primary-btn" on:click={() => showCreateModal = true}>
                + New Project
            </button>
        </div>
    </header>

    {#if loading}
        <div class="loader-container">
            <div class="logo-loader">M</div>
        </div>
    {:else}
        <div class="projects-grid">
            {#each projects as project (project.id)}
                <a href="/projects/{project.id}" class="project-card" transition:fade={{ duration: 200 }}>
                    <div class="card-header">
                        <div class="project-icon">
                            {project.name[0].toUpperCase()}
                        </div>
                        <div class="project-meta">
                            <h3>{project.name}</h3>
                            <span class="created-at">
                                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    
                    <p class="description">
                        {project.description || "No description provided."}
                    </p>

                    <div class="card-footer">
                        <div class="active-engines">
                            {#if project.active_engines && project.active_engines.length > 0}
                                {#each project.active_engines as engine}
                                    <div class="engine-badge" title="{engine} Engine Active">
                                        {ENGINE_ICONS[engine] || '🔧'}
                                    </div>
                                {/each}
                            {:else}
                                <div class="engine-badge" title="Classic Engine">▣</div>
                            {/if}
                        </div>
                        <span class="arrow">→</span>
                    </div>
                </a>
            {/each}

            <button class="project-card create-card" on:click={() => showCreateModal = true}>
                <div class="plus-icon">+</div>
                <span>Create New Project</span>
            </button>
        </div>
    {/if}

    <CreateProjectModal 
        bind:isOpen={showCreateModal} 
        on:created={handleProjectCreated} 
    />
</div>

<style>
    .dashboard-container {
        padding: 40px;
        max-width: 1200px;
        margin: 0 auto;
    }

    header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 40px;
    }

    h1 { font-size: 2.5rem; color: var(--text-primary); margin: 0; }

    .primary-btn {
        background: var(--text-primary); color: var(--bg-main);
        border: none; padding: 10px 20px; border-radius: 8px;
        font-weight: 600; font-family: 'Space Grotesk'; cursor: pointer;
        transition: transform 0.2s;
    }
    .primary-btn:hover { transform: translateY(-2px); }

    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
    }

    /* CARD STYLES */
    .project-card {
        background: var(--card-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 24px;
        display: flex; flex-direction: column;
        text-decoration: none;
        transition: all 0.2s ease;
        position: relative;
        min-height: 220px;
    }

    .project-card:hover {
        transform: translateY(-4px);
        border-color: var(--text-secondary);
        box-shadow: 0 12px 30px rgba(0,0,0,0.2);
    }

    .card-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }

    .project-icon {
        width: 48px; height: 48px;
        background: linear-gradient(135deg, var(--orb-1-color), #3b82f6);
        border-radius: 12px;
        display: grid; place-items: center;
        color: white; font-size: 1.5rem; font-weight: 700;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .project-meta h3 { margin: 0 0 4px 0; font-size: 1.1rem; color: var(--text-primary); }
    .created-at { font-size: 0.8rem; color: var(--text-tertiary); }

    .description {
        color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;
        flex: 1; margin: 0 0 20px 0;
        display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }

    .card-footer {
        display: flex; justify-content: space-between; align-items: center;
        border-top: 1px solid var(--glass-border);
        padding-top: 16px;
    }

    .active-engines { display: flex; gap: 8px; }
    .engine-badge {
        width: 28px; height: 28px;
        background: var(--glass-highlight);
        border-radius: 50%;
        display: grid; place-items: center;
        font-size: 0.9rem; color: var(--text-secondary);
        border: 1px solid var(--glass-border);
    }

    .arrow { color: var(--text-tertiary); font-size: 1.2rem; transition: 0.2s; }
    .project-card:hover .arrow { transform: translateX(4px); color: var(--text-primary); }

    /* CREATE NEW CARD */
    .create-card {
        background: transparent;
        border: 2px dashed var(--glass-border);
        align-items: center; justify-content: center;
        cursor: pointer; color: var(--text-secondary);
        gap: 16px;
    }
    .create-card:hover {
        border-color: var(--text-primary);
        background: rgba(255,255,255,0.02);
        color: var(--text-primary);
    }
    .plus-icon { font-size: 2rem; }

    .loader-container { height: 60vh; display: grid; place-items: center; }
    .logo-loader { width: 48px; height: 48px; background: white; border-radius: 12px; color: black; display: grid; place-items: center; font-weight: bold; animation: spin 1s infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>