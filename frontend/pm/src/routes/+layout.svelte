<script lang="ts">
    import '../app.css'; // Ensure global styles are loaded
    import { page } from '$app/stores';

    const LINKS = [
        { name: 'Dashboard', path: '/projects' },
        { name: 'Activity', path: '/activity' },
        { name: 'Calendar', path: '/calendar' },
        { name: 'Reports', path: '/reports' }
    ];

    const SYSTEM = [
        { name: 'Settings', path: '/settings' },
        { name: 'Logout', path: '/logout' }
    ];

    $: currentPath = $page.url.pathname;
</script>

<div class="app-shell">
    <aside class="global-sidebar">
        <div class="logo-area">
            <div class="logo-mark">M</div>
        </div>

        <nav class="nav-stack">
            {#each LINKS as link}
                <a 
                    href={link.path} 
                    class="nav-link" 
                    class:active={currentPath.startsWith(link.path)}
                >
                    {link.name}
                </a>
            {/each}
        </nav>

        <div class="spacer"></div>

        <nav class="nav-stack system">
            {#each SYSTEM as link}
                <a href={link.path} class="nav-link system">{link.name}</a>
            {/each}
        </nav>
    </aside>

    <main class="main-content">
        <div class="aurora-layer">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="noise-overlay"></div>
        </div>
        
        <div class="content-overlay">
            <slot />
        </div>
    </main>
</div>

<style>
    .app-shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-main); }

    /* SIDEBAR */
    .global-sidebar {
        width: 240px; height: 100%; 
        background: var(--sidebar-bg);
        border-right: 1px solid var(--glass-border);
        display: flex; flex-direction: column; padding: 24px;
        z-index: 50; flex-shrink: 0;
    }

    .logo-area { margin-bottom: 40px; display: flex; align-items: center; gap: 12px; }
    .logo-mark {
        width: 32px; height: 32px; background: var(--text-primary); color: var(--bg-main);
        font-family: 'Space Grotesk', sans-serif; font-weight: 800; border-radius: 8px;
        display: grid; place-items: center;
    }

    .nav-stack { display: flex; flex-direction: column; gap: 4px; }
    
    .nav-link {
        display: block; padding: 10px 12px; border-radius: 8px;
        color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 500;
        transition: 0.2s;
    }
    .nav-link:hover { background: var(--glass-highlight); color: var(--text-primary); }
    .nav-link.active { background: var(--glass-highlight); color: var(--text-primary); font-weight: 600; }
    
    .nav-link.system { font-size: 0.85rem; }

    .spacer { flex: 1; }

    /* MAIN CONTENT */
    .main-content { flex: 1; position: relative; display: flex; flex-direction: column; }
    .content-overlay { position: relative; z-index: 10; height: 100%; overflow: hidden; }
</style>