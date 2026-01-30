<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    $: tickets = allTasks.filter(t => t.stream !== undefined)
        .sort((a, b) => (b.stream?.priority_score || 0) - (a.stream?.priority_score || 0));

    const STAGES = ['intake', 'triage', 'active', 'review', 'deployed'];

    async function toggleStall(task: Task) {
        if (!task.stream) return;
        const newState = !task.stream.is_stalled;
        // Prompt for reason if stalling
        let reason = task.stream.stall_reason;
        if (newState) {
             reason = prompt("Reason for stall (e.g., Vendor Dependency):") || "Unknown";
        }

        dispatch('update', { ...task, stream: { ...task.stream, is_stalled: newState, stall_reason: reason } });
        await api.tasks.update(task.id, { is_stalled: newState, stall_reason: reason });
    }
</script>

<div class="stream-board">
    <div class="header">
        <h3>⚡ Stream Ops</h3>
        <p>Throughput, Cycle Time & Stalls</p>
    </div>

    <div class="lanes-container">
        {#each STAGES as stage}
            <div class="swim-lane">
                <div class="lane-header">
                    <h4>{stage.toUpperCase()}</h4>
                </div>
                <div class="lane-body">
                    {#each tickets.filter(t => t.stream?.lifecycle_stage === stage) as task}
                        <div 
                            class="ticket-card"
                            class:stalled={task.stream?.is_stalled}
                            on:click={() => dispatch('openTask', task)}
                        >
                            <div class="ticket-header">
                                <span class="prio-score">WSJF: {task.stream?.priority_score}</span>
                                {#if task.stream?.is_stalled}
                                    <span class="stall-badge">⛔ STALLED</span>
                                {/if}
                            </div>
                            
                            <div class="ticket-title">{task.title}</div>
                            
                            {#if task.stream?.is_stalled}
                                <div class="stall-reason">"{task.stream.stall_reason}"</div>
                            {/if}

                            <div class="ticket-actions">
                                <button class="stall-btn" on:click|stopPropagation={() => toggleStall(task)}>
                                    {task.stream?.is_stalled ? 'Resume' : 'Stall'}
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .stream-board { padding: 32px; height: 100%; overflow-x: auto; background: #f1f5f9; color: #1e293b; }
    .header { margin-bottom: 24px; }
    h3 { margin: 0; font-family: 'Space Grotesk'; font-size: 1.5rem; color: #0f172a; }
    p { color: #64748b; }

    .lanes-container { display: flex; gap: 12px; height: 90%; min-width: 1200px; }
    
    .swim-lane { flex: 1; background: #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; }
    .lane-header { padding: 12px; border-bottom: 2px solid #cbd5e1; background: #cbd5e1; border-radius: 8px 8px 0 0; }
    h4 { margin: 0; font-size: 0.8rem; color: #475569; font-weight: 800; }

    .lane-body { padding: 8px; gap: 8px; display: flex; flex-direction: column; overflow-y: auto; flex: 1; }

    .ticket-card {
        background: #fff; padding: 12px; border-radius: 4px; border-left: 4px solid #3b82f6;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer;
    }
    .ticket-card:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }

    .ticket-card.stalled { border-left-color: #ef4444; background: #fef2f2; }
    
    .ticket-header { display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 6px; color: #64748b; }
    .stall-badge { color: #ef4444; font-weight: bold; }
    .prio-score { font-family: monospace; }

    .ticket-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
    .stall-reason { font-size: 0.75rem; color: #b91c1c; font-style: italic; margin-bottom: 8px; }

    .ticket-actions { display: flex; justify-content: flex-end; }
    .stall-btn {
        background: transparent; border: 1px solid #cbd5e1; color: #64748b; font-size: 0.7rem;
        border-radius: 4px; cursor: pointer; padding: 2px 8px;
    }
    .stall-btn:hover { border-color: #94a3b8; color: #0f172a; }
</style>