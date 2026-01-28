<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { api } from '$lib/api';
    import { currentUser } from '$lib/stores/user';

    let isAuthCheckComplete = false; // BLOCKING FLAG

    // Dynamic check for public pages
    $: isPublicPage = ['/login', '/register'].some(route => $page.url.pathname.startsWith(route));

    onMount(async () => {
        try {
            // 1. Ask Backend "Who is this?"
            const user = await api.auth.me();

            if (user) {
                // LOGGED IN
                currentUser.set(user);
                // If on login page, move to app
                if (isPublicPage) goto('/'); 
            } else {
                // GUEST
                currentUser.set(null);
                // If on app page, kick to login
                if (!isPublicPage) goto('/login');
            }
        } catch (e) {
            // NETWORK ERROR / FALLBACK
            currentUser.set(null);
            if (!isPublicPage) goto('/login');
        } finally {
            // 2. RELEASE THE BLOCK
            isAuthCheckComplete = true;
        }
    });
</script>

{#if !isAuthCheckComplete}
    <div class="loading-screen">
        <div class="logo-loader">M</div>
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

        <nav class="glass-sidebar">
            <div class="brand">
                <div class="logo-mark">M</div>
                <span class="logo-type">MAGNISTRUCT</span>
            </div>
            <div class="nav-group">
                <a href="/" class="nav-item" class:active={$page.url.pathname === '/'}>
                    <span class="icon">▣</span> Projects
                </a>
            </div>
            <div class="nav-footer">
                <div class="user-pill">
                    <div class="avatar">{$currentUser.full_name[0]}</div>
                    <div class="user-meta">
                        <span class="username">{$currentUser.full_name}</span>
                        <span class="role">{$currentUser.job_title || 'Member'}</span>
                    </div>
                </div>
            </div>
        </nav>

        <main class="main-stage">
            <slot />
        </main>
    </div>
{/if}

<style>
    /* UTILS */
    .loading-screen { height: 100vh; width: 100vw; background: #020617; display: grid; place-items: center; }
    .logo-loader { width: 40px; height: 40px; background: white; color: black; font-weight: 700; display: grid; place-items: center; border-radius: 8px; animation: spin 1s infinite; }
    @keyframes spin { 0% { opacity: 0.5; } 100% { opacity: 1; } }

    /* LAYOUT */
    .magnistruct-shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    
    /* AURORA */
    .aurora-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: #020617; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
    .orb-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: #2dd4bf; }
    .orb-2 { bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: #a855f7; }
    .noise-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E"); }

    /* SIDEBAR */
    .glass-sidebar { background: rgba(2, 6, 23, 0.4); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.05); padding: 32px 24px; display: flex; flex-direction: column; gap: 40px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-mark { width: 32px; height: 32px; background: white; color: black; font-weight: 700; display: grid; place-items: center; border-radius: 8px; font-family: 'Space Grotesk'; }
    .logo-type { font-weight: 700; letter-spacing: 1px; font-size: 0.9rem; opacity: 0.9; font-family: 'Space Grotesk'; }
    .nav-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; border-radius: 8px; transition: 0.2s; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
    .nav-item.active { background: rgba(255, 255, 255, 0.1); color: white; }
    .nav-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
    .user-pill { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 50%; display: grid; place-items: center; font-weight: bold; font-size: 0.8rem; }
    .user-meta { display: flex; flex-direction: column; }
    .username { font-size: 0.85rem; font-weight: 600; }
    .role { font-size: 0.7rem; color: #64748b; }
    .main-stage { padding: 40px 60px; overflow-y: auto; }
</style>