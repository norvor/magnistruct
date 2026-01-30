<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { api, type BoardData, type Task, type UserSummary } from '$lib/api';
    import { currentUser } from '$lib/stores/user';
    
    // --- COMPONENTS ---
    // Classic Views
    import BoardColumn from '$lib/components/board/BoardColumn.svelte';
    import ListView from '$lib/components/views/ListView.svelte';
    import CalendarView from '$lib/components/views/CalendarView.svelte';
    
    // Nature Views
    import SeedView from '$lib/components/views/SeedView.svelte';

    // Modals
    import TaskDetailModal from '$lib/components/board/TaskDetailModal.svelte';
    import CreateTaskModal from '$lib/components/dashboard/CreateTaskModal.svelte';
    import EngineSelectorModal from '$lib/components/dashboard/EngineSelectorModal.svelte';

    let projectID = $page.params.id;
    
    // --- STATE (Svelte 5 Runes) ---
    let boardData = $state<BoardData | null>(null);
    let loading = $state(true);
    let currentView = $state<'board' | 'list' | 'calendar'>('board');
    let activeEngine = $state('classic'); 

    // Modals
    let showTaskModal = $state(false);
    let showCreateModal = $state(false);
    let showEngineModal = $state(false); 
    
    let selectedTask = $state<Task | null>(null);
    let createDefaultDate = $state<Date | null>(null);
    let projectMembers = $state<UserSummary[]>([]);

    // --- COMPUTED STATE ---
    // Flattens all tasks for views that need the full picture
    let allProjectTasks = $derived(
        boardData 
            ? [...boardData.columns.flatMap(c => c.tasks), ...boardData.orphaned_tasks] 
            : []
    );

    const ENGINE_ICONS: Record<string, string> = {
        classic: '▣', seed: '🌰', river: '🌊', tree: '🌳', 
        hive: '🐝', shell: '🐚', wave: '🌊', nest: '🪺', cocoon: '🐛'
    };

    // --- INITIAL LOAD ---
    async function loadBoard() {
        try {
            const data = await api.projects.getBoard(projectID);
            
            // Default to classic if active_engines is missing/empty
            if (!data.project.active_engines || data.project.active_engines.length === 0) {
                data.project.active_engines = ['classic'];
            }
            
            boardData = data;

            // Extract Unique Members
            const uniqueUsers = new Map<string, UserSummary>();
            if ($currentUser) uniqueUsers.set($currentUser.id, { id: $currentUser.id, full_name: $currentUser.full_name });
            
            // Check Classic Tasks for assignees
            data.columns.forEach(c => c.tasks.forEach(t => {
                if (t.classic?.assignee) uniqueUsers.set(t.classic.assignee.id, t.classic.assignee);
            }));
            // Check Orphan Tasks for assignees
            data.orphaned_tasks.forEach(t => {
                 if (t.classic?.assignee) uniqueUsers.set(t.classic.assignee.id, t.classic.assignee);
            });

            projectMembers = Array.from(uniqueUsers.values());

        } catch (e) {
            console.error("Failed to load board", e);
        } finally {
            loading = false;
        }
    }

    onMount(loadBoard);

    // --- EVENT HANDLERS ---

    // 1. DRAG & DROP (Classic Board Only)
    async function handleTaskDropped(event: CustomEvent<{ taskId: string, newColumnId: string }>) {
        const { taskId, newColumnId } = event.detail;
        if (!boardData) return;

        let task: Task | undefined;
        let oldColumnId = "";

        // Find task in existing columns
        for (const col of boardData.columns) {
            const found = col.tasks.find(t => t.id === taskId);
            if (found) {
                task = found;
                oldColumnId = col.id;
                break;
            }
        }

        if (!task || oldColumnId === newColumnId) return;

        // Optimistic Update
        boardData.columns = boardData.columns.map(col => {
            if (col.id === oldColumnId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            if (col.id === newColumnId) {
                const updatedTask: Task = { 
                    ...task!, 
                    classic: { ...task!.classic!, column_id: newColumnId }
                };
                return { ...col, tasks: [...col.tasks, updatedTask] };
            }
            return col;
        });

        // API Call
        try {
            await api.tasks.move(taskId, { 
                new_column_id: newColumnId, 
                new_position: 999999 
            });
        } catch (e) {
            console.error("Move failed", e);
            loadBoard(); // Revert
        }
    }

    // 2. CREATE TASK (Polymorphic)
    function handleTaskCreated(event: CustomEvent<Task>) {
        const newTask = event.detail;
        if (!boardData) return;
        
        // Scenario A: Classic Task (Has Column)
        if (newTask.classic && newTask.classic.column_id) {
            boardData.columns = boardData.columns.map(col => {
                if (col.id === newTask.classic!.column_id) {
                    return { ...col, tasks: [...col.tasks, newTask] };
                }
                return col;
            });
        } 
        // Scenario B: Nature Task (No Column)
        else {
            boardData.orphaned_tasks = [newTask, ...boardData.orphaned_tasks];
        }
    }

    // 3. UPDATE TASK
    function handleTaskUpdated(event: CustomEvent<Task>) {
        const updatedTask = event.detail;
        if (!boardData) return;

        let foundInColumns = false;

        // Update in Columns
        boardData.columns = boardData.columns.map(col => {
            const idx = col.tasks.findIndex(t => t.id === updatedTask.id);
            if (idx !== -1) {
                foundInColumns = true;
                const newTasks = [...col.tasks];
                newTasks[idx] = updatedTask;
                return { ...col, tasks: newTasks };
            }
            return col;
        });

        // Update in Orphans
        if (!foundInColumns) {
            const idx = boardData.orphaned_tasks.findIndex(t => t.id === updatedTask.id);
            if (idx !== -1) {
                const newOrphans = [...boardData.orphaned_tasks];
                newOrphans[idx] = updatedTask;
                boardData.orphaned_tasks = newOrphans;
            }
        }
        
        if (selectedTask?.id === updatedTask.id) {
            selectedTask = updatedTask;
        }
    }

    // 4. DELETE TASK
    function handleTaskDeleted(event: CustomEvent<string>) {
        const deletedTaskId = event.detail;
        if (!boardData) return;

        boardData.columns = boardData.columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => t.id !== deletedTaskId)
        }));

        boardData.orphaned_tasks = boardData.orphaned_tasks.filter(t => t.id !== deletedTaskId);
        selectedTask = null;
    }

    function handleOpenTask(event: CustomEvent<Task>) {
        selectedTask = event.detail;
        showTaskModal = true;
    }

    function openCreateModal(date: Date | null = null) {
        createDefaultDate = date;
        showCreateModal = true;
    }

    async function handleEnginesChanged() {
        await loadBoard();
        // Auto-switch to new engine if added
        if (boardData && boardData.project.active_engines.length > 0) {
            const engines = boardData.project.active_engines;
            const newest = engines[engines.length - 1];
            if (newest !== 'classic' && activeEngine === 'classic') {
                activeEngine = newest;
            }
        }
    }
</script>

<div class="board-view">
    {#if loading}
        <div class="loader-container"><div class="logo-loader">M</div></div>
    {:else if boardData}
        <header>
            <div class="header-content">
                <div class="breadcrumbs">Projects / {boardData.project.name}</div>
                
                <div class="title-row">
                    <h1>{boardData.project.name}</h1>
                    
                    <div class="controls-right">
                        <div class="engine-tabs">
                            {#each boardData.project.active_engines as engine}
                                <button 
                                    class="engine-tab" 
                                    class:active={activeEngine === engine}
                                    on:click={() => activeEngine = engine}
                                >
                                    <span class="e-icon">{ENGINE_ICONS[engine] || '🔧'}</span>
                                    <span class="e-name">{engine.charAt(0).toUpperCase() + engine.slice(1)}</span>
                                </button>
                            {/each}
                            <button class="add-engine-btn" on:click={() => showEngineModal = true}>+</button>
                        </div>
                    
                        <div class="v-sep"></div>

                        {#if activeEngine === 'classic'}
                            <div class="view-switcher">
                                <button class:active={currentView === 'board'} on:click={() => currentView = 'board'}>
                                    <span class="icon">▣</span>
                                </button>
                                <button class:active={currentView === 'list'} on:click={() => currentView = 'list'}>
                                    <span class="icon">☰</span>
                                </button>
                                <button class:active={currentView === 'calendar'} on:click={() => currentView = 'calendar'}>
                                    <span class="icon">📅</span>
                                </button>
                            </div>
                        {/if}

                        <button class="primary-create-btn" on:click={() => openCreateModal()}>
                            New {activeEngine === 'classic' ? 'Issue' : activeEngine.charAt(0).toUpperCase() + activeEngine.slice(1)}
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="view-stage">
            
            {#if activeEngine === 'classic'}
                {#if currentView === 'board'}
                    <div class="kanban-scroll">
                        {#each boardData.columns as column (column.id)}
                            <BoardColumn 
                                {column} 
                                projectId={projectID}
                                on:openTask={handleOpenTask}
                                on:taskCreated={handleTaskCreated}
                                on:taskDropped={handleTaskDropped}
                            />
                        {/each}
                    </div>
                {:else if currentView === 'list'}
                    <ListView 
                        columns={boardData.columns}
                        projectId={projectID} 
                        on:openTask={handleOpenTask} 
                        on:taskCreated={handleTaskCreated}
                    />
                {:else if currentView === 'calendar'}
                    <CalendarView 
                        columns={boardData.columns} 
                        on:openTask={handleOpenTask} 
                        on:requestCreate={(e) => openCreateModal(e.detail)}
                    />
                {/if}

            {:else if activeEngine === 'seed'}
                <SeedView 
                    allTasks={allProjectTasks}
                    on:openTask={handleOpenTask}
                    on:update={handleTaskUpdated}
                />

            {:else}
                <div class="engine-placeholder">
                    <div class="ph-icon">{ENGINE_ICONS[activeEngine]}</div>
                    <h2>{activeEngine.charAt(0).toUpperCase() + activeEngine.slice(1)} Engine Active</h2>
                    <p>This engine view is under construction.</p>
                </div>
            {/if}
        </div>

    {:else}
        <div class="error-state"><h2>Project Not Found</h2></div>
    {/if}

    <TaskDetailModal 
        bind:isOpen={showTaskModal}
        bind:task={selectedTask}
        members={projectMembers}
        on:close={() => showTaskModal = false}
        on:update={handleTaskUpdated}
        on:delete={handleTaskDeleted}
    />

    <CreateTaskModal
        bind:isOpen={showCreateModal}
        projectId={projectID}
        columns={boardData?.columns || []}
        members={projectMembers}
        defaultDate={createDefaultDate}
        activeEngine={activeEngine}
        on:created={handleTaskCreated}
    />

    <EngineSelectorModal
        bind:isOpen={showEngineModal}
        projectId={projectID}
        activeEngines={boardData?.project.active_engines || []}
        on:close={() => showEngineModal = false}
        on:change={handleEnginesChanged}
    />
</div>

<style>
    .board-view { height: 100vh; display: flex; flex-direction: column; padding: 0 40px; }
    header { padding: 40px 0 20px 0; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .breadcrumbs { font-size: 0.8rem; color: var(--text-secondary); font-family: 'Space Grotesk'; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 2.5rem; color: var(--text-primary); margin: 0; }
    
    .controls-right { display: flex; gap: 16px; align-items: center; }

    .engine-tabs { 
        display: flex; background: var(--glass-highlight); 
        padding: 4px; border-radius: 10px; border: 1px solid var(--glass-border);
        gap: 2px;
    }
    .engine-tab {
        background: transparent; border: none; color: var(--text-secondary);
        padding: 6px 12px; border-radius: 8px; cursor: pointer;
        display: flex; align-items: center; gap: 6px;
        transition: 0.2s; font-size: 0.85rem; font-weight: 500;
        font-family: 'Inter';
    }
    .engine-tab:hover { color: var(--text-primary); }
    .engine-tab.active { background: var(--card-bg); color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    
    .add-engine-btn {
        background: transparent; border: none; color: var(--text-secondary);
        width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
        display: grid; place-items: center; font-size: 1.1rem;
    }
    .add-engine-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }

    .v-sep { width: 1px; height: 24px; background: var(--glass-border); }

    .view-switcher { display: flex; gap: 4px; background: var(--glass-highlight); padding: 4px; border-radius: 8px; border: 1px solid var(--glass-border); }
    .view-switcher button { background: transparent; border: none; color: var(--text-secondary); padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .view-switcher button:hover { color: var(--text-primary); }
    .view-switcher button.active { background: var(--card-bg); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

    .primary-create-btn { background: var(--text-primary); color: var(--bg-main); border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-family: 'Space Grotesk'; cursor: pointer; transition: 0.2s; }
    .primary-create-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    .view-stage { flex: 1; overflow: hidden; padding-bottom: 20px; display: flex; flex-direction: column; }
    .kanban-scroll { display: flex; gap: 24px; overflow-x: auto; flex: 1; padding-bottom: 10px; }

    .engine-placeholder {
        flex: 1; display: flex; flex-direction: column; 
        align-items: center; justify-content: center;
        background: var(--card-bg); border: 1px dashed var(--glass-border);
        border-radius: 12px; color: var(--text-secondary);
        text-align: center;
    }
    .ph-icon { font-size: 4rem; margin-bottom: 16px; opacity: 0.5; }

    .loader-container { height: 100%; display: grid; place-items: center; }
    .logo-loader { width: 48px; height: 48px; background: white; border-radius: 12px; color: black; display: grid; place-items: center; font-weight: bold; animation: spin 1s infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error-state { height: 100%; display: grid; place-items: center; color: var(--text-secondary); }
</style>