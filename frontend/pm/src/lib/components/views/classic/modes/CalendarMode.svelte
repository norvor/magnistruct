<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Task } from '$lib/api';
    
    export let allTasks: Task[];
    const dispatch = createEventDispatcher();

    // Get tasks with due dates
    $: datedTasks = allTasks.filter(t => t.classic?.due_date).sort((a,b) => new Date(a.classic!.due_date!).getTime() - new Date(b.classic!.due_date!).getTime());
</script>

<div class="calendar-wrapper">
    <div class="notice">
        📅 Full Calendar Month View requires complex date math. 
        <br>Here is a generic <strong>Timeline Agenda</strong> for now.
    </div>

    <div class="agenda-list">
        {#each datedTasks as task}
            <div class="agenda-item" on:click={() => dispatch('openTask', task)}>
                <div class="date-col">
                    <span class="day">{new Date(task.classic!.due_date!).getDate()}</span>
                    <span class="month">{new Date(task.classic!.due_date!).toLocaleDateString(undefined, {month:'short'})}</span>
                </div>
                <div class="info-col">
                    <div class="time-slot">09:00 AM</div>
                    <div class="task-card">
                        {task.title}
                        <span class="pill">{task.classic?.priority}</span>
                    </div>
                </div>
            </div>
        {/each}
        {#if datedTasks.length === 0}
            <div class="empty">No tasks with due dates found.</div>
        {/if}
    </div>
</div>

<style>
    .calendar-wrapper { padding: 40px; overflow-y: auto; height: 100%; color: #fff; }
    .notice { padding: 20px; background: #111; border: 1px solid #333; border-radius: 8px; margin-bottom: 30px; color: #888; font-size: 0.9rem; text-align: center; }
    
    .agenda-item { display: flex; gap: 20px; margin-bottom: 20px; cursor: pointer; }
    .date-col { display: flex; flex-direction: column; align-items: center; width: 60px; }
    .day { font-size: 1.5rem; font-weight: bold; color: #fff; }
    .month { font-size: 0.8rem; color: #ff3b30; text-transform: uppercase; font-weight: bold; }

    .info-col { flex: 1; border-left: 2px solid #333; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
    .time-slot { font-size: 0.75rem; color: #666; font-family: monospace; }
    
    .task-card { 
        background: #1c1c1e; padding: 12px; border-radius: 8px; border: 1px solid #333; 
        display: flex; justify-content: space-between; align-items: center;
    }
    .task-card:hover { border-color: #666; }
    .pill { font-size: 0.6rem; background: #333; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    
    .empty { text-align: center; color: #444; margin-top: 40px; }
</style>