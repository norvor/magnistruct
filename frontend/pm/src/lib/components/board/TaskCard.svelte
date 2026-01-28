<script lang="ts">
    import GlassCard from '$lib/components/ui/GlassCard.svelte';
    export let task: any;
</script>

<div class="task-wrapper">
    <GlassCard hoverable={true} interactable={true}>
        <div class="task-inner">
            <div class="task-header">
                <span class="priority {task.priority}">{task.priority}</span>
                {#if task.due_date}
                    <span class="date">{new Date(task.due_date).toLocaleDateString()}</span>
                {/if}
            </div>
            <h4>{task.title}</h4>
            
            <div class="task-footer">
                <div class="avatar">N</div>
            </div>
        </div>
    </GlassCard>
</div>

<style>
    .task-wrapper { margin-bottom: 12px; }
    .task-inner { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    
    .task-header { display: flex; justify-content: space-between; align-items: center; }
    .priority { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); }
    .priority.p1 { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); } /* High */
    .date { font-size: 0.7rem; color: #94a3b8; font-family: 'Space Grotesk'; }

    h4 { margin: 0; font-size: 0.95rem; font-weight: 500; line-height: 1.4; }

    .avatar { width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; font-size: 0.6rem; display: grid; place-items: center; }
</style>