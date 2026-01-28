<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { api, type BoardData } from '$lib/api';
    import BoardColumn from '$lib/components/board/BoardColumn.svelte';

    let projectID = $page.params.id;
    let boardData = $state<BoardData | null>(null);
    let loading = $state(true);

    onMount(async () => {
        try {
            boardData = await api.projects.getBoard(projectID);
        } catch (e) {
            console.error("Failed to load board", e);
        } finally {
            loading = false;
        }
    });
</script>

<div class="board-view">
    {#if loading}
        <div class="loader">Loading Neural Interface...</div>
    {:else if boardData}
        <header>
            <div class="breadcrumbs">Projects / {boardData.project.name}</div>
            <h1>{boardData.project.name}</h1>
        </header>

        <div class="kanban-scroll">
            {#each boardData.columns as column}
                <BoardColumn {column} />
            {/each}
        </div>
    {:else}
        <div class="loader">Project Not Found</div>
    {/if}
</div>

<style>
    .board-view { height: 100vh; display: flex; flex-direction: column; padding: 0 40px; }
    
    header { padding: 40px 0 20px 0; }
    .breadcrumbs { font-size: 0.8rem; color: #64748b; font-family: 'Space Grotesk'; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    h1 { font-size: 2.5rem; }

    .kanban-scroll {
        display: flex; gap: 24px; overflow-x: auto; flex: 1;
        padding-bottom: 40px;
    }
    .loader { color: #64748b; font-family: 'Space Grotesk'; padding-top: 100px; text-align: center; }
</style>