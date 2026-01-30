<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';
    import { flip } from 'svelte/animate';
    import ClassicCard from '../ClassicCard.svelte';
    import { api, type Task, type BoardColumn } from '$lib/api';

    export let allTasks: Task[];
    export let columns: BoardColumn[];
    
    const dispatch = createEventDispatcher();
    
    // DRAG STATE
    let hoveringColId: string | null = null;
    
    // CREATION STATE
    let creatingInColId: string | null = null;
    let newTitle = '';
    let inputRef: HTMLInputElement;

    function getTasks(colId: string) {
        return allTasks
            .filter(t => t.classic?.column_id === colId)
            .sort((a,b) => (a.classic?.position||0) - (b.classic?.position||0));
    }

    // --- CREATE LOGIC ---
    async function startCreate(colId: string) {
        creatingInColId = colId;
        newTitle = '';
        await tick();
        if (inputRef) inputRef.focus();
    }

    function cancelCreate() {
        creatingInColId = null;
        newTitle = '';
    }

    function submitCreate(colId: string) {
        if (!newTitle.trim()) {
            cancelCreate();
            return;
        }
        dispatch('requestCreate', { title: newTitle, columnId: colId });
        // Don't close immediately if you want "Enter to add another" flow
        // For now, let's close:
        cancelCreate();
    }

    function handleKeyDown(e: KeyboardEvent, colId: string) {
        if (e.key === 'Enter') submitCreate(colId);
        if (e.key === 'Escape') cancelCreate();
    }

    // --- DRAG HANDLERS (Same as before) ---
    function handleDragStart(e: DragEvent, task: Task) {
        if(e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); }
    }
    function handleDragOver(e: DragEvent, colId: string) { e.preventDefault(); hoveringColId = colId; if(e.dataTransfer) e.dataTransfer.dropEffect = 'move'; }
    function handleDragLeave() { hoveringColId = null; }
    async function handleDrop(e: DragEvent, newColId: string) {
        e.preventDefault(); hoveringColId = null;
        const taskId = e.dataTransfer?.getData('text/plain');
        if (!taskId) return;
        const task = allTasks.find(t => t.id === taskId);
        if (!task || !task.classic || task.classic.column_id === newColId) return;
        
        const tasksInCol = getTasks(newColId);
        const lastTask = tasksInCol[tasksInCol.length - 1];
        const newPos = lastTask ? Number(lastTask.classic?.position || 0) + 10000 : 10000;
        
        dispatch('taskMove', { task, newColumnId: newColId, newPosition: newPos });
        try { await api.tasks.move(taskId, newColId, newPos); } catch (e) { console.error(e); }
    }
</script>

<div class="board-canvas scroll-hide">
    {#each columns as col (col.id)}
        <div 
            class="lane-track" 
            class:active={hoveringColId === col.id}
            on:dragover={(e) => handleDragOver(e, col.id)}
            on:dragleave={handleDragLeave}
            on:drop={(e) => handleDrop(e, col.id)}
        >
            <div class="lane-head">
                <span class="lane-title">{col.name}</span>
                <span class="lane-count">{getTasks(col.id).length}</span>
            </div>
            
            <div class="lane-body scroll-hide">
                {#each getTasks(col.id) as task (task.id)}
                    <div 
                        animate:flip={{duration: 250}}
                        class="card-wrapper"
                        draggable="true"
                        on:dragstart={(e) => handleDragStart(e, task)}
                    >
                        <ClassicCard task={task} on:click={() => dispatch('openTask', task)} />
                    </div>
                {/each}
                
                {#if creatingInColId === col.id}
                    <div class="inline-creator">
                        <input 
                            bind:this={inputRef}
                            bind:value={newTitle}
                            on:keydown={(e) => handleKeyDown(e, col.id)}
                            on:blur={() => submitCreate(col.id)}
                            placeholder="Type a name..."
                        />
                    </div>
                {:else}
                    <div class="drop-target" on:click={() => startCreate(col.id)}>
                        <span class="plus">+</span>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>

<style>
    .board-canvas { display: flex; height: 100%; overflow-x: auto; gap: 24px; padding: 24px 40px; align-items: flex-start; }
    
    .lane-track {
        min-width: 300px; width: 300px; height: 100%;
        background: var(--column-bg); border-radius: 16px; 
        padding: 8px; display: flex; flex-direction: column;
        transition: background 0.2s, box-shadow 0.2s;
        border: 1px solid transparent;
    }
    .lane-track.active { background: var(--glass-highlight); border-color: var(--glass-border); box-shadow: inset 0 0 20px rgba(0,0,0,0.05); }

    .lane-head { display: flex; justify-content: space-between; padding: 12px 16px; margin-bottom: 8px; align-items: center; }
    .lane-title { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .lane-count { background: var(--glass-highlight); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: var(--text-primary); }

    .lane-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-bottom: 80px; }
    
    .card-wrapper { cursor: grab; user-select: none; }
    .card-wrapper:active { cursor: grabbing; }

    /* INLINE CREATOR */
    .inline-creator {
        background: var(--card-bg); border: 1px solid var(--swiss-accent); border-radius: 12px;
        padding: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .inline-creator input {
        width: 100%; background: transparent; border: none; outline: none;
        color: var(--text-primary); font-size: 0.95rem; font-weight: 500;
        font-family: var(--font-swiss);
    }

    .drop-target {
        height: 40px; border: 2px dashed var(--glass-border); border-radius: 12px;
        display: grid; place-items: center; color: var(--text-tertiary); font-size: 1.5rem;
        opacity: 0.5; transition: all 0.2s; cursor: pointer;
    }
    .lane-track:hover .drop-target { opacity: 0.8; }
    .drop-target:hover { opacity: 1; border-color: var(--swiss-accent); color: var(--swiss-accent); background: var(--glass-highlight); }
</style>