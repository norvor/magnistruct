<script lang="ts">
    import GlassCard from '$lib/components/ui/GlassCard.svelte';
    
    // Type definition ensures "Production Grade" safety
    export let project: {
        id: string;
        name: string;
        description: string;
        created_at: string;
    };
</script>

<a href="/projects/{project.id}" class="card-link">
    <GlassCard hoverable={true} interactable={true}>
        <div class="card-content">
            <div class="card-top">
                <div class="status-indicator">
                    <div class="pulse-dot"></div>
                    <span class="status-text">Active</span>
                </div>
                <span class="date">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>

            <div class="card-body">
                <h3>{project.name}</h3>
                <p>{project.description || "No description provided."}</p>
            </div>

            <div class="card-footer">
                <div class="avatar-stack">
                    <div class="avatar">N</div>
                </div>
                <div class="action-icon">→</div>
            </div>
        </div>
    </GlassCard>
</a>

<style>
    .card-link { text-decoration: none; color: inherit; display: block; height: 100%; }
    .card-content { padding: 24px; display: flex; flex-direction: column; height: 280px; justify-content: space-between; }
    
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .status-indicator { display: flex; align-items: center; gap: 8px; }
    .pulse-dot { width: 6px; height: 6px; background: #2dd4bf; border-radius: 50%; box-shadow: 0 0 8px #2dd4bf; }
    .status-text { font-size: 0.75rem; color: #2dd4bf; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .date { font-family: 'Space Grotesk', monospace; font-size: 0.8rem; color: #64748b; }

    .card-body h3 { font-size: 1.5rem; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px; }
    .card-body p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
    .avatar { width: 28px; height: 28px; background: #6366f1; border-radius: 50%; display: grid; place-items: center; font-size: 0.7rem; font-weight: 700; border: 2px solid rgba(30, 41, 59, 0.8); }
    .action-icon { color: #fff; opacity: 0.4; transition: 0.2s; font-size: 1.2rem; }
    
    :global(.card-link:hover) .action-icon { opacity: 1; transform: translateX(4px); color: #2dd4bf; }
</style>