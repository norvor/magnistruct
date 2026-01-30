<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';
    import { api, type Task, type Column } from '$lib/api';
    import TaskCard from './TaskCard.svelte';

    export let column: Column;
    export let projectId: string;

    const dispatch = createEventDispatcher();
    let isCreating = false;
    let newTaskTitle = '';
    let createInput: HTMLInputElement;
    let isDragOver = false;

    async function toggleCreate() {
        isCreating = !isCreating;
        if (isCreating) {
            await tick();
            createInput?.focus();
        }
    }

    async function handleQuickCreate() {
        if (!newTaskTitle.trim()) {
            isCreating = false;
            return;
        }
        try {
            const newTask = await api.tasks.create(projectId, { 
                column_id: column.id, 
                title: newTaskTitle 
            });
            dispatch('taskCreated', newTask);
            newTaskTitle = '';
        } catch (e) {
            console.error(e);
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') handleQuickCreate();
        if (e.key === 'Escape') {
            isCreating = false;
            newTaskTitle = '';
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        isDragOver = true;
    }

    function handleDragLeave() {
        isDragOver = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragOver = false;
        const taskId = e.dataTransfer?.getData('text/plain');
        if (!taskId) return;
        
        dispatch('taskDropped', {
            taskId,
            newColumnId: column.id
        });
    }
</script>

<div 
    class="column-track" 
    class:hovered={isDragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="list"
>
    <div class="column-header">
        <div class="header-left">
            <h3>{column.name}</h3>
            <span class="count-badge">{column.tasks.length}</span>
        </div>
        <div class="header-actions">
            <button class="menu-btn">•••</button>
        </div>
    </div>

    <div class="task-scroll-area">
        <div class="task-list">
            {#each column.tasks as task (task.id)}
                <TaskCard 
                    {task} 
                    on:click={() => dispatch('openTask', task)} 
                />
            {/each}
        </div>

        {#if isCreating}
            <div class="creator-shell">
                <input 
                    bind:this={createInput} 
                    bind:value={newTaskTitle} 
                    on:keydown={handleKeydown} 
                    on:blur={() => !newTaskTitle && (isCreating = false)} 
                    placeholder="New task name..." 
                    class="ghost-input" 
                />
            </div>
        {:else}
            <button class="add-task-ghost" on:click={toggleCreate}>
                <span class="plus">+</span> New Task
            </button>
        {/if}
    </div>
</div>

<style>
    .column-track { 
        min-width: 320px; max-width: 320px; 
        display: flex; flex-direction: column; 
        height: 100%;
        background: var(--column-bg); 
        border: 1px solid var(--glass-border); 
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        transition: border-color 0.2s, background-color 0.2s;
    }

    .column-track.hovered {
        border-color: var(--orb-1-color);
        background: var(--glass-highlight);
    }
    
    .column-header { 
        display: flex; justify-content: space-between; align-items: center; 
        padding: 14px 16px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .header-left { display: flex; align-items: center; gap: 10px; }

    h3 { 
        font-size: 0.9rem; font-weight: 700; 
        color: var(--text-primary); 
        margin: 0;
        letter-spacing: 0.5px;
    }

    .count-badge { 
        background: var(--glass-highlight); 
        padding: 2px 8px; border-radius: 12px; 
        font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;
        border: 1px solid var(--glass-border);
    }

    .menu-btn {
        background: transparent; border: none; color: var(--text-secondary);
        font-size: 1rem; cursor: pointer; padding: 4px;
        line-height: 0.5;
    }
    .menu-btn:hover { color: var(--text-primary); }

    .task-scroll-area {
        flex: 1; overflow-y: auto; 
        padding: 12px;
        display: flex; flex-direction: column; gap: 10px;
    }

    .task-list { display: flex; flex-direction: column; gap: 10px; }
    
    .add-task-ghost {
        width: 100%;
        background: transparent; 
        border: none;
        padding: 10px 12px; 
        border-radius: 8px; 
        color: var(--text-secondary); 
        cursor: pointer;
        transition: 0.2s; 
        font-family: 'Inter'; font-size: 0.9rem; font-weight: 500;
        display: flex; align-items: center; gap: 8px;
        text-align: left;
    }
    .add-task-ghost:hover { 
        background: var(--glass-highlight);
        color: var(--text-primary); 
    }
    .plus { font-size: 1.2rem; line-height: 0.8; font-weight: 300; }

    .creator-shell {
        background: var(--card-bg); 
        border: 1px solid var(--orb-1-color); 
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: fadeIn 0.1s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .ghost-input {
        width: 100%;
        background: transparent; border: none;
        color: var(--text-primary);
        font-size: 0.9rem; font-family: 'Inter';
        outline: none;
    }
</style>