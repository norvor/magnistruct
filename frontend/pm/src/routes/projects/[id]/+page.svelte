<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { api, type BoardData, type Task, type UserSummary } from '$lib/api';
    import { currentUser } from '$lib/stores/user';
    
    // Components
    import BoardColumn from '$lib/components/board/BoardColumn.svelte';
    import ListView from '$lib/components/views/ListView.svelte';
    import CalendarView from '$lib/components/views/CalendarView.svelte';
    import TaskDetailModal from '$lib/components/board/TaskDetailModal.svelte';
    import CreateTaskModal from '$lib/components/dashboard/CreateTaskModal.svelte';

    let projectID = $page.params.id;
    
    // Svelte 5 State Runes
    let boardData = $state<BoardData | null>(null);
    let loading = $state(true);
    let currentView = $state<'board' | 'list' | 'calendar'>('board');

    // Modals
    let showTaskModal = $state(false);
    let showCreateModal = $state(false);
    let selectedTask = $state<Task | null>(null);
    let createDefaultDate = $state<Date | null>(null);
    let projectMembers = $state<UserSummary[]>([]);

    // DRAG AND DROP HANDLER
    async function handleTaskDropped(event: CustomEvent<{ taskId: string, newColumnId: string }>) {
        const { taskId, newColumnId } = event.detail;
        if (!boardData) return;

        // 1. Find the task in the old column
        let task: Task | undefined;
        let oldColumnId = "";

        // Loop to find task
        for (const col of boardData.columns) {
            const found = col.tasks.find(t => t.id === taskId);
            if (found) {
                task = found;
                oldColumnId = col.id;
                break;
            }
        }

        if (!task || oldColumnId === newColumnId) return; // No change needed

        console.log(`Moving task ${task.short_id} from ${oldColumnId} to ${newColumnId}`);

        // 2. Optimistically Update UI
        // Remove from old column
        boardData.columns = boardData.columns.map(col => {
            if (col.id === oldColumnId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            // Add to new column (at the end)
            if (col.id === newColumnId) {
                // Update local task object
                const updatedTask = { ...task!, column_id: newColumnId };
                return { ...col, tasks: [...col.tasks, updatedTask] };
            }
            return col;
        });

        // 3. Send to API
        try {
            // We append to the end, so position is high number
            const newPosition = 999999; 
            await api.tasks.move(taskId, { 
                new_column_id: newColumnId, 
                new_position: newPosition 
            });
        } catch (e) {
            console.error("Move failed", e);
            // Revert UI here if you want robust error handling
            loadBoard(); // Reload to fix state
        }
    }

    function handleTaskDeleted(event: CustomEvent<string>) {
        const deletedTaskId = event.detail;
        if (!boardData) return;

        console.log("🗑 Removing Task ID:", deletedTaskId);

        // Filter out the deleted task from all columns
        boardData.columns = boardData.columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => t.id !== deletedTaskId)
        }));
        
        // Clear selection
        selectedTask = null;
    }

    async function loadBoard() {
        try {
            const data = await api.projects.getBoard(projectID);
            boardData = data;

            // Populate Members for Dropdowns
            const uniqueUsers = new Map<string, UserSummary>();
            if ($currentUser) uniqueUsers.set($currentUser.id, { id: $currentUser.id, full_name: $currentUser.full_name });
            
            data.columns.forEach(c => {
                c.tasks.forEach(t => {
                    if (t.assignee) uniqueUsers.set(t.assignee.id, t.assignee);
                });
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

    function handleOpenTask(event: CustomEvent<Task>) {
        selectedTask = event.detail;
        showTaskModal = true;
    }

    function openCreateModal(date: Date | null = null) {
        createDefaultDate = date;
        showCreateModal = true;
    }

    // FIX: This updates the UI immediately without a refresh
    function handleTaskCreated(event: CustomEvent<Task>) {
        const newTask = event.detail;
        if (!boardData) return;

        console.log("⚡ UI Update: Adding Task", newTask.short_id);

        // Map over columns to find the right one and append the task
        boardData.columns = boardData.columns.map(col => {
            if (col.id === newTask.column_id) {
                // Return new object to trigger reactivity
                return { ...col, tasks: [...col.tasks, newTask] };
            }
            return col;
        });
    }

    function handleTaskUpdated(event: CustomEvent<Task>) {
        const updatedTask = event.detail;
        if (!boardData) return;

        boardData.columns = boardData.columns.map(col => {
            const idx = col.tasks.findIndex(t => t.id === updatedTask.id);
            if (idx !== -1) {
                const newTasks = [...col.tasks];
                newTasks[idx] = updatedTask;
                return { ...col, tasks: newTasks };
            }
            return col;
        });
        
        selectedTask = updatedTask;
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

                        <button class="primary-create-btn" on:click={() => openCreateModal()}>
                            New Issue
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div class="view-stage">
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
        on:created={handleTaskCreated}
    />
</div>

<style>
    .board-view { height: 100vh; display: flex; flex-direction: column; padding: 0 40px; }
    
    header { padding: 40px 0 20px 0; }
    
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .breadcrumbs { font-size: 0.8rem; color: var(--text-secondary); font-family: 'Space Grotesk'; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 2.5rem; color: var(--text-primary); margin: 0; }
    
    .controls-right { display: flex; gap: 12px; align-items: center; }

    .view-switcher { display: flex; gap: 4px; background: var(--glass-highlight); padding: 4px; border-radius: 8px; border: 1px solid var(--glass-border); }
    .view-switcher button { background: transparent; border: none; color: var(--text-secondary); padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .view-switcher button:hover { color: var(--text-primary); }
    .view-switcher button.active { background: var(--card-bg); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

    .primary-create-btn {
        background: var(--text-primary); color: var(--bg-main);
        border: none; padding: 8px 16px; border-radius: 8px;
        font-weight: 600; font-family: 'Space Grotesk';
        cursor: pointer; transition: 0.2s;
    }
    .primary-create-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    .view-stage { flex: 1; overflow: hidden; padding-bottom: 20px; display: flex; flex-direction: column; }
    .kanban-scroll { display: flex; gap: 24px; overflow-x: auto; flex: 1; padding-bottom: 10px; }
    
    .loader-container { height: 100%; display: grid; place-items: center; }
    .logo-loader { width: 48px; height: 48px; background: white; border-radius: 12px; color: black; display: grid; place-items: center; font-weight: bold; animation: spin 1s infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .error-state { height: 100%; display: grid; place-items: center; color: var(--text-secondary); }
</style>