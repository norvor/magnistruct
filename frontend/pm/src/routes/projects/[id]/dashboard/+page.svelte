<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { api, type BoardData, type Task } from '$lib/api';
    import { fade } from 'svelte/transition';

    let projectId = $page.params.id;
    let board: BoardData | null = null;
    let loading = true;

    // METRICS STATE
    let totalTasks = 0;
    let completedTasks = 0;
    let totalPoints = 0;
    let burntPoints = 0;
    let totalHours = 0;
    let loggedHours = 0;
    
    let upcomingTasks: Task[] = [];
    let riskyBets: Task[] = [];

    onMount(async () => {
        try {
            board = await api.projects.getBoard(projectId);
            calculateMetrics();
        } catch (e) { console.error(e); } finally { loading = false; }
    });

    function calculateMetrics() {
        if (!board) return;
        const all = [...board.columns.flatMap(c => c.tasks), ...board.orphaned_tasks];
        
        // Classic Metrics
        const classic = all.filter(t => t.classic);
        totalTasks = classic.length;
        completedTasks = classic.filter(t => t.classic?.is_complete).length;
        
        totalPoints = classic.reduce((sum, t) => sum + (t.classic?.story_points || 0), 0);
        burntPoints = classic.filter(t => t.classic?.is_complete).reduce((sum, t) => sum + (t.classic?.story_points || 0), 0);

        totalHours = classic.reduce((sum, t) => sum + (t.classic?.estimated_hours || 0), 0);
        loggedHours = classic.reduce((sum, t) => sum + (t.classic?.logged_hours || 0), 0);

        upcomingTasks = classic
            .filter(t => t.classic?.due_date && !t.classic.is_complete)
            .sort((a, b) => new Date(a.classic!.due_date!).getTime() - new Date(b.classic!.due_date!).getTime())
            .slice(0, 5);

        riskyBets = all.filter(t => t.venture?.risk_level === 'critical');
    }
</script>

<div class="magnistruct-shell">
    <div class="aurora-layer">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="noise-overlay"></div>
    </div>

    <div class="dashboard-scroll">
        {#if loading}
            <div class="loading-state">
                <div class="spinner"></div>
                <span>Syncing Command Data...</span>
            </div>
        {:else if board}
            <header class="cmd-header glass-panel">
                <div class="header-left">
                    <a href="/projects/{projectId}" class="back-btn">← Back to Board</a>
                    <h1>Command Center</h1>
                </div>
                <div class="header-right">
                    <span class="project-tag">{board.project.name}</span>
                </div>
            </header>

            <div class="cmd-grid" in:fade>
                
                <div class="kpi-card glass-panel">
                    <div class="kpi-label">Sprint Velocity</div>
                    <div class="kpi-val">{burntPoints} <span class="sub">/ {totalPoints} pts</span></div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: {(burntPoints/totalPoints)*100}%"></div>
                    </div>
                </div>

                <div class="kpi-card glass-panel">
                    <div class="kpi-label">Completion Rate</div>
                    <div class="kpi-val">{Math.round((completedTasks/totalTasks)*100 || 0)}%</div>
                    <div class="progress-track">
                        <div class="progress-fill success" style="width: {(completedTasks/totalTasks)*100}%"></div>
                    </div>
                </div>

                <div class="kpi-card glass-panel">
                    <div class="kpi-label">Time Budget</div>
                    <div class="kpi-val">{loggedHours}h <span class="sub">/ {totalHours}h</span></div>
                    <div class="kpi-meta" class:danger={loggedHours > totalHours}>
                        {loggedHours > totalHours ? 'OVER BUDGET' : 'ON TRACK'}
                    </div>
                </div>

                <div class="kpi-card glass-panel alert">
                    <div class="kpi-label">Critical Risks</div>
                    <div class="kpi-val danger">{riskyBets.length}</div>
                    <div class="kpi-meta">Requires Attention</div>
                </div>

                <div class="section-panel glass-panel large">
                    <h3>Upcoming Deadlines</h3>
                    <div class="list-view">
                        {#each upcomingTasks as task}
                            <div class="list-row">
                                <span class="row-title">{task.title}</span>
                                <span class="row-date">{new Date(task.classic?.due_date || '').toLocaleDateString()}</span>
                                <span class="row-badge {task.classic?.priority}">{task.classic?.priority}</span>
                            </div>
                        {/each}
                        {#if upcomingTasks.length === 0}
                            <div class="empty">No deadlines approaching.</div>
                        {/if}
                    </div>
                </div>

                <div class="section-panel glass-panel large">
                    <h3>Active Engines</h3>
                    <div class="engine-grid">
                        {#each board.project.active_engines as engine}
                            <div class="engine-pill">
                                <div class="dot"></div>
                                {engine.toUpperCase()}
                            </div>
                        {/each}
                    </div>
                </div>

            </div>
        {/if}
    </div>
</div>

<style>
    .magnistruct-shell { position: relative; width: 100vw; height: 100vh; background: var(--bg-main); overflow: hidden; }
    
    .dashboard-scroll { 
        position: relative; z-index: 10; height: 100%; overflow-y: auto; 
        padding: 40px; display: flex; flex-direction: column; gap: 32px;
    }

    /* HEADER */
    .cmd-header {
        padding: 24px 32px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center;
    }
    .header-left { display: flex; flex-direction: column; gap: 8px; }
    .back-btn { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: 0.2s; }
    .back-btn:hover { color: var(--text-primary); transform: translateX(-4px); }
    h1 { margin: 0; font-size: 2rem; color: var(--text-primary); }
    
    .project-tag { 
        background: var(--glass-highlight); padding: 8px 16px; border-radius: 12px; 
        color: var(--text-secondary); font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    }

    /* GRID */
    .cmd-grid { 
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; 
        /* Main panels span 2 cols each */
    }
    .section-panel.large { grid-column: span 2; min-height: 300px; }

    /* KPI CARDS */
    .kpi-card { padding: 24px; border-radius: 20px; display: flex; flex-direction: column; gap: 12px; }
    .kpi-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
    .kpi-val { font-size: 2.5rem; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk'; }
    .sub { font-size: 1rem; color: var(--text-tertiary); font-weight: 400; }
    
    .progress-track { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-top: auto; }
    .progress-fill { height: 100%; background: var(--swiss-accent); }
    .progress-fill.success { background: var(--swiss-success); }
    
    .danger { color: var(--swiss-danger); }
    .kpi-meta { font-size: 0.8rem; color: var(--swiss-success); font-weight: 600; margin-top: auto; }
    .kpi-meta.danger { color: var(--swiss-danger); }

    /* LISTS */
    .section-panel { padding: 32px; border-radius: 24px; }
    h3 { margin: 0 0 24px 0; font-size: 1.2rem; color: var(--text-primary); }

    .list-view { display: flex; flex-direction: column; gap: 12px; }
    .list-row { 
        display: flex; align-items: center; justify-content: space-between; 
        padding: 12px; border-bottom: 1px solid var(--glass-border); 
    }
    .row-title { font-weight: 600; color: var(--text-primary); }
    .row-date { color: var(--text-secondary); font-size: 0.9rem; }
    .row-badge { 
        font-size: 0.7rem; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 700; 
        background: var(--glass-highlight); color: var(--text-tertiary);
    }
    .row-badge.p1 { background: rgba(255, 69, 58, 0.2); color: #ff453a; }

    .engine-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .engine-pill { 
        background: var(--glass-highlight); padding: 8px 16px; border-radius: 50px; 
        display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-primary);
    }
    .dot { width: 8px; height: 8px; background: var(--swiss-success); border-radius: 50%; box-shadow: 0 0 8px var(--swiss-success); }

    .loading-state { height: 100%; display: grid; place-items: center; color: var(--text-secondary); }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--glass-border); border-top-color: var(--swiss-accent); border-radius: 50%; animation: spin 1s infinite; margin-bottom: 16px; }
</style>