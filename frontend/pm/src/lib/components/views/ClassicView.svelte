<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Task, BoardColumn } from '$lib/api';
    
    import BoardMode from './classic/modes/BoardMode.svelte';
    import ListMode from './classic/modes/ListMode.svelte';
    import CalendarMode from './classic/modes/CalendarMode.svelte';

    export let allTasks: Task[] = [];
    export let columns: BoardColumn[];

    const dispatch = createEventDispatcher();
    let currentMode = 'board';

    // 1. FILTER: Only show Classic tasks
    $: classicTasks = allTasks.filter(t => t.engine_type === 'classic' || (!t.engine_type && t.classic));

    // EVENT FORWARDING
    function handleOpenTask(e: CustomEvent<Task>) { dispatch('openTask', e.detail); }
    function handleTaskMove(e: CustomEvent) { dispatch('taskMove', e.detail); }
    
    // CRITICAL: Forward the create request
    function handleRequestCreate(e: CustomEvent) { dispatch('requestCreate', e.detail); }
</script>

<div class="classic-wrapper">
    <div class="view-toolbar">
        <div class="view-switcher">
            <button class:active={currentMode === 'board'} on:click={() => currentMode = 'board'}><span class="icon">▣</span> Board</button>
            <button class:active={currentMode === 'list'} on:click={() => currentMode = 'list'}><span class="icon">≡</span> List</button>
            <button class:active={currentMode === 'calendar'} on:click={() => currentMode = 'calendar'}><span class="icon">📅</span> Timeline</button>
        </div>
        
        <div class="toolbar-right">
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Filter tasks..." />
            </div>
            <div class="divider"></div>
            <span class="meta-badge">{classicTasks.length} ITEMS</span>
        </div>
    </div>

    <div class="content-area">
        {#if currentMode === 'board'}
            <BoardMode 
                allTasks={classicTasks} 
                {columns} 
                on:openTask={handleOpenTask}
                on:taskMove={handleTaskMove}
                on:requestCreate={handleRequestCreate}
            />
        {:else if currentMode === 'list'}
            <ListMode 
                allTasks={classicTasks} 
                on:openTask={handleOpenTask}
                on:requestCreate={handleRequestCreate} 
            />
        {:else if currentMode === 'calendar'}
            <CalendarMode allTasks={classicTasks} on:openTask={handleOpenTask} />
        {/if}
    </div>
</div>

<style>
    /* (Styles remain the same as previous response - Swiss/Aurora) */
    .classic-wrapper { height: 100%; display: flex; flex-direction: column; background: transparent; }
    .view-toolbar { padding: 24px 32px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: var(--glass-bg); backdrop-filter: blur(12px); z-index: 10; gap: 20px; }
    .view-switcher { display: flex; gap: 4px; background: var(--input-bg); padding: 4px; border-radius: 12px; border: 1px solid var(--glass-border); box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .view-switcher button { background: transparent; border: none; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: all 0.2s ease; }
    .view-switcher button:hover { color: var(--text-primary); background: var(--glass-highlight); }
    .view-switcher button.active { background: var(--glass-highlight); color: var(--text-primary); box-shadow: 0 1px 4px rgba(0,0,0,0.1); font-weight: 700; }
    .icon { font-size: 0.9rem; }
    .toolbar-right { display: flex; align-items: center; gap: 16px; }
    .search-bar { display: flex; align-items: center; gap: 8px; background: var(--input-bg); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--glass-border); transition: 0.2s; }
    .search-bar:focus-within { border-color: var(--text-tertiary); }
    .search-icon { font-size: 0.9rem; opacity: 0.5; color: var(--text-secondary); }
    .search-bar input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.9rem; width: 140px; }
    .search-bar input::placeholder { color: var(--text-tertiary); }
    .divider { width: 1px; height: 24px; background: var(--glass-border); }
    .meta-badge { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); background: var(--glass-highlight); padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px; }
    .content-area { flex: 1; overflow: hidden; position: relative; }
</style>