<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Task } from '$lib/api';
    export let task: Task;
    const dispatch = createEventDispatcher();

    $: c = task.classic;
    $: subTotal = c?.subtasks?.length || 0;
    $: subDone = c?.subtasks?.filter(s => s.is_complete).length || 0;
    $: progress = subTotal > 0 ? (subDone / subTotal) * 100 : 0;
</script>

<div class="classic-card" on:click={() => dispatch('click', task)}>
    <div class="card-header">
        <div class="prio-tag {c?.priority}"></div>
        <span class="id-text">#{c?.short_id}</span>
    </div>

    <h4 class:done={c?.is_complete}>{task.title}</h4>

    <div class="card-footer">
        <div class="assignee">
            {#if c?.assignee}
                <div class="avatar">{c.assignee.full_name[0]}</div>
            {/if}
        </div>
        
        <div class="meta-stats">
            {#if c?.story_points}
                <span class="badge">{c.story_points} pts</span>
            {/if}
            {#if subTotal > 0}
                <div class="micro-chart">
                    <svg viewBox="0 0 36 36">
                        <path class="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="fill" stroke-dasharray="{progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .classic-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 12px; display: flex; flex-direction: column; gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        backdrop-filter: blur(8px);
    }
    .classic-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.05); border-color: var(--text-secondary); }

    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .id-text { font-family: 'Space Grotesk', monospace; font-size: 0.7rem; color: var(--text-tertiary); }
    
    .prio-tag { width: 8px; height: 8px; border-radius: 50%; }
    .prio-tag.p1 { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.4); }
    .prio-tag.p2 { background: #f59e0b; }
    .prio-tag.p3 { background: #3b82f6; }
    .prio-tag.p4 { background: var(--text-tertiary); }

    h4 { margin: 0; font-size: 0.9rem; color: var(--text-primary); font-weight: 500; line-height: 1.4; }
    h4.done { text-decoration: line-through; color: var(--text-tertiary); }

    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
    
    .avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--text-secondary); color: var(--bg-main); font-size: 0.6rem; display: grid; place-items: center; font-weight: bold; }
    
    .meta-stats { display: flex; gap: 8px; align-items: center; }
    .badge { font-size: 0.7rem; color: var(--text-secondary); background: var(--glass-highlight); padding: 2px 6px; border-radius: 4px; }

    .micro-chart { width: 16px; height: 16px; }
    .micro-chart svg { display: block; width: 100%; }
    .bg { fill: none; stroke: var(--text-tertiary); stroke-width: 4; opacity: 0.2; }
    .fill { fill: none; stroke: var(--orb-1-color); stroke-width: 4; stroke-linecap: round; }
</style>