<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import TreeItem from './tree/TreeItem.svelte';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    // 1. Find Roots (Tree tasks with NO parent_id)
    $: roots = allTasks.filter(t => t.tree !== undefined && !t.tree.parent_id);

    async function handleRequestChild(event: CustomEvent<Task>) {
        const parentTask = event.detail;
        
        // Quick Prompt for v1 (Ideally this opens the CreateModal with parent_id pre-filled)
        const title = prompt(`Add a branch to "${parentTask.title}":`);
        if (!title) return;

        try {
            // We need a custom API call because our generic create modal doesn't support parent_id yet
            // NOTE: You will need to handle this properly in the future, but this proves the concept.
            /* For now, we will just emit an event so the parent Page can handle creation 
               OR we add a quick hack to 'api.ts' to support raw payloads.
            */
           alert("Child creation requires CreateModal update! (Coming next)");
        } catch (e) {
            console.error(e);
        }
    }
</script>

<div class="tree-container">
    <div class="tree-header">
        <h3>🌳 Project Ecology</h3>
        <p>Hierarchy & Dependencies</p>
    </div>

    <div class="forest-floor">
        {#each roots as root (root.id)}
            <TreeItem 
                task={root} 
                {allTasks} 
                on:openTask 
                on:requestChild={handleRequestChild}
            />
        {/each}

        {#if roots.length === 0}
            <div class="empty-forest">
                <span class="icon">🌱</span>
                <p>No trees planted yet. Create a root task to begin.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .tree-container {
        padding: 40px;
        height: 100%;
        overflow-y: auto;
        background: linear-gradient(135deg, #1e1e1e 0%, #111 100%);
    }

    .tree-header { margin-bottom: 30px; border-bottom: 1px solid var(--glass-border); padding-bottom: 16px; }
    h3 { margin: 0; color: #4ade80; font-family: 'Space Grotesk'; }
    p { margin: 4px 0 0 0; color: var(--text-tertiary); font-size: 0.9rem; }

    .forest-floor {
        display: flex; flex-direction: column; gap: 8px;
    }

    .empty-forest {
        text-align: center; color: var(--text-tertiary); margin-top: 40px;
    }
    .icon { font-size: 3rem; display: block; margin-bottom: 16px; opacity: 0.5; }
</style>