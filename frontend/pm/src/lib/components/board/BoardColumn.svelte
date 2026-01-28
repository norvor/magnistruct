<script lang="ts">
    import TaskCard from './TaskCard.svelte';
    export let column: any;
</script>

<div class="column">
    <div class="column-header">
        <h3>{column.name}</h3>
        <span class="count">{column.tasks.length}</span>
    </div>

    <div class="task-list">
        {#each column.tasks as task}
            <TaskCard {task} />
        {/each}
        
        <button class="add-task-ghost">+ New Task</button>
    </div>
</div>

<style>
    .column { min-width: 300px; max-width: 300px; display: flex; flex-direction: column; height: 100%; }
    
    .column-header { display: flex; justify-content: space-between; align-items: center; padding: 0 4px 16px 4px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; }
    h3 { font-size: 0.9rem; font-weight: 600; letter-spacing: 0.5px; color: #e2e8f0; }
    .count { background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; color: #94a3b8; }

    .task-list { flex: 1; overflow-y: auto; padding-right: 4px; }
    
    .add-task-ghost {
        width: 100%; background: transparent; border: 1px dashed rgba(255,255,255,0.1);
        padding: 12px; border-radius: 16px; color: #64748b; cursor: pointer;
        transition: 0.2s; font-family: 'Inter'; font-size: 0.85rem;
    }
    .add-task-ghost:hover { border-color: #2dd4bf; color: #2dd4bf; background: rgba(45, 212, 191, 0.05); }
</style>