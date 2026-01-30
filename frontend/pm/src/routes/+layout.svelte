<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { api } from '$lib/api';
    import { currentUser, type Theme } from '$lib/stores/user';
    
    // Using favicon as the logo since it is guaranteed to exist
    import logoSrc from '$lib/assets/magnistruct-logo.svg'; 

    let isAuthCheckComplete = $state(false);
    let userMenuOpen = $state(false);
    let sidebarOpen = $state(false);

    // Derived state for public routes
    let isPublicPage = $derived(['/login', '/register'].some(route => $page.url.pathname.startsWith(route)));

    // Theme Sync Effect
    $effect(() => {
        if ($currentUser?.theme === 'cloudy') {
            document.body.setAttribute('data-theme', 'cloudy');
        } else {
            document.body.removeAttribute('data-theme');
        }
    });

    onMount(async () => {
        try {
            const user = await api.auth.me();
            if (user) {
                currentUser.set(user);
                // Only redirect if we are mistakenly on a public page while logged in
                if (isPublicPage) goto('/'); 
            } else {
                currentUser.set(null);
                // Only kick to login if we are on a private page
                if (!isPublicPage) goto('/login');
            }
        } catch (e) {
            currentUser.set(null);
            if (!isPublicPage) goto('/login');
        } finally {
            isAuthCheckComplete = true;
        }
    });

    function toggleUserMenu() { userMenuOpen = !userMenuOpen; }
    function toggleSidebar() { sidebarOpen = !sidebarOpen; }

    function handleOutsideClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (userMenuOpen && !target.closest('.user-profile-container')) {
            userMenuOpen = false;
        }
    }

    async function handleLogout() {
        try {
            await api.auth.logout();
            currentUser.set(null);
            goto('/login');
        } catch (e) { console.error("Logout failed", e); }
    }

    async function toggleTheme() {
        if (!$currentUser) return;
        const newTheme: Theme = $currentUser.theme === 'aurora' ? 'cloudy' : 'aurora';
        currentUser.update(u => u ? ({...u, theme: newTheme}) : null);
        try { await api.auth.updateProfile({ theme: newTheme }); } catch (e) {}
    }
</script>

<svelte:window on:click={handleOutsideClick} />

{#if !isAuthCheckComplete && !isPublicPage}
    <div class="loading-screen">
        <img src={logoSrc} alt="Loading..." class="spinner" />
    </div>
{:else if isPublicPage}
    <slot />
{:else if $currentUser}
    <div class="magnistruct-shell">
        
        <div class="aurora-layer">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="noise-overlay"></div>
        </div>

        <aside class="glass-sidebar" class:open={sidebarOpen}>
            <div class="sidebar-header">
                 <div class="brand">
                    <img src={logoSrc} alt="Logo" style="width: 32px; height: 32px;" />
                    <span class="brand-text">MAGNISTRUCT</span>
                 </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="/" class="nav-item" class:active={$page.url.pathname === '/'}>
                    <span class="icon">▣</span> Dashboard
                </a>
                <a href="/projects" class="nav-item" class:active={$page.url.pathname.startsWith('/projects')}>
                    <span class="icon">◈</span> Projects
                </a>
                <a href="/team" class="nav-item" class:active={$page.url.pathname.startsWith('/team')}>
                    <span class="icon">☺</span> Team
                </a>
            </nav>

            <div class="user-profile-container">
                {#if userMenuOpen}
                    <div class="dropdown-menu glass-panel">
                        <button class="dropdown-item" on:click={toggleTheme}>
                            <span class="icon">{$currentUser.theme === 'aurora' ? '☁️' : '🌑'}</span>
                            <span>Switch to {$currentUser.theme === 'aurora' ? 'Cloudy' : 'Aurora'}</span>
                        </button>
                        <div class="divider"></div>
                        <button class="dropdown-item logout" on:click={handleLogout}>
                            <span class="icon">➔</span> Log Out
                        </button>
                    </div>
                {/if}

                <button class="user-profile-btn" on:click={toggleUserMenu}>
                    <div class="user-avatar">
                        {$currentUser.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-meta">
                        <span class="user-name">{$currentUser.full_name}</span>
                        <span class="user-role">{$currentUser.job_title || 'Member'}</span>
                    </div>
                    <span class="dropdown-arrow" class:rotated={userMenuOpen}>▼</span>
                </button>
            </div>
        </aside>

        <main class="main-stage">
            <slot />
        </main>
    </div>
{/if}

<style>
    /* UTILS */
    .loading-screen { 
        height: 100vh; 
        width: 100vw; 
        background: var(--bg-main); 
        display: grid; 
        place-items: center; 
    }
    
    .spinner {
        width: 60px; 
        height: 60px;
        animation: spin 2s infinite ease-in-out;
    }

    @keyframes spin { 0% { transform: rotate(0deg); opacity: 0.5; } 100% { transform: rotate(360deg); opacity: 1; } }

    /* LAYOUT */
    .magnistruct-shell {
        position: relative;
        overflow: hidden;
        display: flex;
        height: 100vh;
        width: 100vw;
    }

    .glass-sidebar {
        width: 260px;
        background: var(--sidebar-bg); 
        border-right: 1px solid var(--glass-border);
        display: flex; 
        flex-direction: column;
        z-index: 50; 
        transition: transform 0.3s ease, background-color 0.3s;
        flex-shrink: 0;
    }

    .sidebar-header { padding: 32px 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-text { font-weight: 700; letter-spacing: 1px; font-size: 0.9rem; color: var(--text-primary); }

    .sidebar-nav { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
    
    .nav-item {
        display: flex; align-items: center; gap: 12px; padding: 12px;
        color: var(--text-secondary);
        text-decoration: none; font-size: 0.9rem; font-weight: 500;
        border-radius: 8px; transition: all 0.2s;
    }
    .nav-item:hover { background: var(--glass-highlight); color: var(--text-primary); }
    .nav-item.active { background: var(--glass-highlight); color: var(--text-primary); font-weight: 600; }
    .icon { width: 20px; text-align: center; opacity: 0.8; }

    /* PROFILE FOOTER */
    .user-profile-container { padding: 20px; position: relative; border-top: 1px solid var(--glass-border); }
    
    .user-profile-btn {
        display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px;
        background: transparent; border: none; cursor: pointer; text-align: left;
        border-radius: 12px; transition: background 0.2s;
    }
    .user-profile-btn:hover { background: var(--glass-highlight); }

    .user-avatar {
        width: 36px; height: 36px; 
        background: var(--accent-gradient);
        border-radius: 50%; display: grid; place-items: center;
        font-weight: 700; color: white; font-size: 0.9rem;
        box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
        flex-shrink: 0;
    }

    .user-meta { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.7rem; color: var(--text-secondary); }
    
    .dropdown-arrow { font-size: 0.6rem; color: var(--text-secondary); transition: transform 0.2s; }
    .dropdown-arrow.rotated { transform: rotate(180deg); }

    /* DROPDOWN */
    .dropdown-menu {
        position: absolute; bottom: 100%; left: 16px; right: 16px; margin-bottom: 12px; padding: 6px;
        background: var(--glass-bg); 
        backdrop-filter: blur(24px);
        border: 1px solid var(--glass-border);
        border-radius: 12px; display: flex; flex-direction: column; gap: 2px;
        transform-origin: bottom center; animation: scaleIn 0.2s ease-out;
        z-index: 100;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .dropdown-item {
        padding: 10px 12px; background: transparent; border: none;
        color: var(--text-primary);
        font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;
        text-align: left; cursor: pointer; border-radius: 8px;
        display: flex; align-items: center; gap: 10px; transition: background 0.2s;
    }
    .dropdown-item:hover { background: var(--glass-highlight); }
    .dropdown-item.logout { color: #fca5a5; }
    
    .divider { height: 1px; background: var(--glass-border); margin: 4px 8px; }
    
    .main-stage { flex: 1; overflow-y: auto; padding: 0; }
</style>