<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import StructureItem from './structure/StructureItem.svelte'; // We will create this sub-component next

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    // Roots have no parent
    $: roots = allTasks.filter(t => t.structure !== undefined && !t.structure.parent_id);

    async function createRoot() {
        // Just a signal to open modal, ideally we pre-fill "structure"
        dispatch('requestCreate');
    }
</script>

<div class="structure-view">
    <div class="header">
        <h3>🏛️ Strategy Map</h3>
        <p>OKRs, WBS & Dependency Chains</p>
    </div>

    <div class="org-chart">
        {#each roots as root (root.id)}
            <StructureItem 
                task={root} 
                {allTasks} 
                on:openTask 
            />
        {/each}

        {#if roots.length === 0}
            <div class="empty-state">
                <button class="primary-btn" on:click={createRoot}>+ Add Strategic Objective</button>
            </div>
        {/if}
    </div>
</div>

<style>
    .structure-view { padding: 40px; height: 100%; overflow-y: auto; background: #fff; color: #000; }
    .header { margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    h3 { font-family: 'Space Grotesk'; font-size: 2rem; margin: 0; }
    
    .org-chart { display: flex; flex-direction: column; gap: 16px; }
    .primary-btn { background: #000; color: #fff; padding: 10px 20px; border: none; cursor: pointer; }
</style>