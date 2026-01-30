<script lang="ts">
    import { page } from '$app/stores';

    const LINKS = [
        { name: 'Dashboard', icon: '▣', path: '/projects' },
        { name: 'Activity', icon: '⚡', path: '/activity' },
        { name: 'Calendar', icon: '📅', path: '/calendar' },
        { name: 'Reports', icon: '📊', path: '/reports' }
    ];

    const SYSTEM = [
        { name: 'Settings', icon: '⚙', path: '/settings' },
        { name: 'Logout', icon: '⏻', path: '/logout' }
    ];

    $: currentPath = $page.url.pathname;
</script>

<aside class="sidebar">
    <div class="brand">
        <div class="logo">M</div>
    </div>

    <nav class="nav-group">
        {#each LINKS as link}
            <a 
                href={link.path} 
                class="nav-item" 
                class:active={currentPath.startsWith(link.path)}
            >
                <span class="icon">{link.icon}</span>
                <span class="tooltip">{link.name}</span>
            </a>
        {/each}
    </nav>

    <div class="spacer"></div>

    <nav class="nav-group system">
        {#each SYSTEM as link}
            <a href={link.path} class="nav-item">
                <span class="icon">{link.icon}</span>
                <span class="tooltip">{link.name}</span>
            </a>
        {/each}
    </nav>
</aside>

<style>
    .sidebar {
        width: 60px; height: 100vh; background: #050505; border-right: 1px solid #222;
        display: flex; flex-direction: column; align-items: center; padding: 20px 0;
        z-index: 100;
    }

    .brand { margin-bottom: 40px; }
    .logo {
        width: 32px; height: 32px; background: #fff; color: #000;
        font-family: 'Space Grotesk', sans-serif; font-weight: bold;
        display: grid; place-items: center; border-radius: 8px; font-size: 1.2rem;
    }

    .nav-group { display: flex; flex-direction: column; gap: 16px; width: 100%; align-items: center; }

    .nav-item {
        width: 40px; height: 40px; display: grid; place-items: center;
        color: #666; text-decoration: none; border-radius: 10px;
        transition: 0.2s; position: relative;
    }

    .nav-item:hover { background: #1c1c1e; color: #fff; }
    .nav-item.active { background: #222; color: #fff; box-shadow: inset 2px 0 0 #fff; }

    .icon { font-size: 1.2rem; }

    /* Tooltip on Hover */
    .tooltip {
        position: absolute; left: 50px; background: #222; color: #fff;
        padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;
        opacity: 0; pointer-events: none; transition: 0.1s;
        white-space: nowrap; font-family: 'Inter', sans-serif;
    }
    .nav-item:hover .tooltip { opacity: 1; left: 55px; }

    .spacer { flex: 1; }
</style>