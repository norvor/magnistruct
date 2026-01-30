<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
    import { api, type BoardData, type Task } from '$lib/api';
    
    import EngineSelectorModal from '$lib/components/dashboard/EngineSelectorModal.svelte';
    import TaskDetailDrawer from '$lib/components/drawers/TaskDetailDrawer.svelte';

    import ClassicView from '$lib/components/views/ClassicView.svelte';
    import VentureView from '$lib/components/views/VentureView.svelte';
    import StreamView from '$lib/components/views/StreamView.svelte';

    const projectId = $page.params.id;
    let board: BoardData | null = null;
    let loading = true;
    let activeEngine = 'classic';
    let showEngineModal = false;
    let isDrawerOpen = false;
    let selectedTask: Task | null = null;

    onMount(async () => { await loadBoard(); });

    async function loadBoard() {
        try {
            board = await api.projects.getBoard(projectId);
            if (board && board.project.active_engines.length > 0 && !board.project.active_engines.includes('classic')) {
                activeEngine = board.project.active_engines[0];
            }
        } catch (e) { console.error(e); } finally { loading = false; }
    }

    function handleEngineChange(newEngine: string) { activeEngine = newEngine; }
    function handleOpenTask(e: CustomEvent<Task>) { selectedTask = e.detail; isDrawerOpen = true; }
    
    function handleTaskUpdate(e: CustomEvent<Task>) {
        if (!board) return;
        const updatedTask = e.detail;
        board.columns = board.columns.map(col => ({ ...col, tasks: col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) }));
        board.orphaned_tasks = board.orphaned_tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        board = { ...board };
    }

    function handleTaskMove(e: CustomEvent) {
        if (!board) return;
        const { task, newColumnId, newPosition } = e.detail;
        const taskId = task.id;
        board.columns = board.columns.map(col => ({ ...col, tasks: col.tasks.filter(t => t.id !== taskId) }));
        board.orphaned_tasks = board.orphaned_tasks.filter(t => t.id !== taskId);
        const updatedTask = { ...task };
        if (updatedTask.classic) { updatedTask.classic.column_id = newColumnId; updatedTask.classic.position = newPosition; }
        const targetCol = board.columns.find(c => c.id === newColumnId);
        if (targetCol) {
            targetCol.tasks = [...targetCol.tasks, updatedTask];
            targetCol.tasks.sort((a,b) => (a.classic?.position||0) - (b.classic?.position||0));
        }
        board = { ...board };
    }

    // --- NEW: CREATE TASK HANDLER ---
    async function handleRequestCreate(e: CustomEvent) {
        if (!board) return;

        let { title, columnId } = e.detail;

        // Validation (No more Prompt!)
        if (!title) return; // Silent fail if empty

        // 1. API CREATE
        try {
            console.log((projectId, {
                title: title,
                engine_type: 'classic',
                description: '',
                column_id: columnId || (board.columns[0]?.id) // Send Column ID to backend!
            }))
            const newTask = await api.tasks.create(projectId, {
                title: title,
                engine_type: 'classic',
                description: '',
                column_id: columnId || (board.columns[0]?.id) // Send Column ID to backend!
            });

            // 2. UPDATE BOARD STATE (Optimistic-ish)
            // If backend ignored column_id, we might need to fix it here, 
            // but the new Go handler should respect it.
            
            const targetColId = newTask.classic?.column_id || columnId || board.columns[0].id;
            const targetCol = board.columns.find(c => c.id === targetColId);
            
            if (targetCol) {
                targetCol.tasks = [...targetCol.tasks, newTask];
                // Sort by position just in case
                targetCol.tasks.sort((a,b) => (a.classic?.position||0) - (b.classic?.position||0));
            } else {
                board.orphaned_tasks = [...board.orphaned_tasks, newTask];
            }
            
            board = { ...board }; // Trigger update

        } catch (error) {
            console.error("Failed to create task", error);
            // Optional: Toast notification here
        }
    }
    
    
    function handleTaskDelete(e: CustomEvent<string>) {
        if (!board) return;
        const taskId = e.detail;
        board.columns = board.columns.map(col => ({ ...col, tasks: col.tasks.filter(t => t.id !== taskId) }));
        board.orphaned_tasks = board.orphaned_tasks.filter(t => t.id !== taskId);
        board = { ...board };
    }
</script>

<TaskDetailDrawer 
    isOpen={isDrawerOpen} 
    task={selectedTask} 
    on:close={() => isDrawerOpen = false} 
    on:update={handleTaskUpdate}
    on:delete={handleTaskDelete} 
/>

<EngineSelectorModal isOpen={showEngineModal} projectId={projectId} activeEngines={board?.project.active_engines || []} on:close={() => showEngineModal = false} on:change={loadBoard} />

<div class="project-workspace">
    {#if loading}
        <div class="loading-state"><div class="spinner"></div></div>
    {:else if board}
        <header class="project-header glass-panel">
            <div class="header-left">
                <h1>{board.project.name}</h1>
                <div class="v-sep"></div>
                <nav class="engine-tabs">
                    {#each board.project.active_engines as engine}
                        <button class="tab" class:active={activeEngine === engine} on:click={() => handleEngineChange(engine)}>{engine.toUpperCase()}</button>
                    {/each}
                    <button class="add-tab" on:click={() => showEngineModal = true}>+</button>
                </nav>
            </div>
            <div class="header-right"><a href="/projects/{projectId}/dashboard" class="action-link">Command Center</a></div>
        </header>

        <div class="viewport">
            {#key activeEngine}
                <div in:fade={{duration: 200}} class="view-layer">
                    {#if activeEngine === 'classic'}
                        <ClassicView 
                            allTasks={[...board.columns.flatMap(c => c.tasks), ...board.orphaned_tasks]} 
                            columns={board.columns}
                            on:openTask={handleOpenTask}
                            on:taskMove={handleTaskMove}
                            on:requestCreate={handleRequestCreate}
                        />
                    {:else if activeEngine === 'venture'}
                        <VentureView allTasks={[...board.columns.flatMap(c => c.tasks), ...board.orphaned_tasks]} on:openTask={handleOpenTask} />
                    {:else if activeEngine === 'stream'}
                        <StreamView allTasks={[...board.columns.flatMap(c => c.tasks), ...board.orphaned_tasks]} on:openTask={handleOpenTask} />
                    {/if}
                </div>
            {/key}
        </div>
    {/if}
</div>

<style>
    .project-workspace { display: flex; flex-direction: column; height: 100%; }
    .project-header { height: 64px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); background: var(--glass-bg); backdrop-filter: blur(12px); z-index: 20; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    h1 { font-size: 1.1rem; margin: 0; color: var(--text-primary); font-weight: 700; letter-spacing: -0.02em; }
    .v-sep { width: 1px; height: 20px; background: var(--glass-border); }
    .engine-tabs { display: flex; gap: 4px; }
    .tab { background: transparent; border: none; padding: 6px 12px; border-radius: 6px; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .tab:hover { color: var(--text-primary); background: var(--glass-highlight); }
    .tab.active { color: var(--text-primary); background: var(--glass-highlight); font-weight: 700; }
    .add-tab { background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 1.1rem; }
    .add-tab:hover { color: var(--text-primary); }
    .action-link { color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; font-weight: 500; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--glass-border); }
    .action-link:hover { background: var(--glass-highlight); color: var(--text-primary); }
    .viewport { flex: 1; position: relative; overflow: hidden; }
    .view-layer { width: 100%; height: 100%; }
    .loading-state { height: 100%; display: grid; place-items: center; }
    .spinner { width: 24px; height: 24px; border: 2px solid var(--glass-border); border-top-color: var(--text-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>