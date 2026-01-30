<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { api } from '$lib/api';
    import { currentUser } from '$lib/stores/user';
    import GlassCard from '$lib/components/ui/GlassCard.svelte';
    import '../../app.css';

    // Form State
    let email = "";
    let password = "";
    let fullName = "";
    let error = "";
    let loading = false;
    let authCheckDone = false;

    // Derived State
    const publicRoutes = ['/login', '/register'];
    
    // Auth Check on Mount
    onMount(async () => {
        const isPublic = publicRoutes.some(r => $page.url.pathname.startsWith(r));

        try {
            // Only check auth if we aren't sure yet
            const user = await api.auth.me();
            if (user) {
                currentUser.set(user);
                // If logged in, go to dashboard
                if (isPublic) goto('/'); 
            }
        } catch (e) {
            // Not logged in - totally fine for register page
            currentUser.set(null);
        } finally {
            authCheckDone = true;
        }
    });

    async function handleRegister() {
        if (!email || !password || !fullName) {
            error = "All fields are required.";
            return;
        }
        
        loading = true;
        error = "";

        try {
            // 1. Register
            await api.auth.register({ 
                email, 
                password, 
                full_name: fullName 
            });

            // 2. Auto-Login (Optional, but nice UX)
            await api.auth.login(email, password);
            const user = await api.auth.me();
            currentUser.set(user);
            
            // 3. Redirect
            goto('/');
            
        } catch (e: any) {
            console.error(e);
            if (e.message.includes("409") || e.message.includes("Conflict")) {
                error = "Email is already registered.";
            } else {
                error = "Registration failed. Please try again.";
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="auth-box">
        <GlassCard>
            <div class="inner">
                <div class="header">
                    <div class="logo">M</div>
                    <h1>Initialize Identity</h1>
                    <p>Join the Magnistruct network.</p>
                </div>

                <div class="form">
                    {#if error}
                        <div class="error-banner">{error}</div>
                    {/if}

                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" bind:value={fullName} placeholder="Jane Doe" />
                    </div>

                    <div class="input-group">
                        <label>Email Identifier</label>
                        <input type="email" bind:value={email} placeholder="name@magnistruct.com" />
                    </div>

                    <div class="input-group">
                        <label>Passcode</label>
                        <input type="password" bind:value={password} placeholder="••••••••" />
                    </div>

                    <button on:click={handleRegister} disabled={loading}>
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </div>
                
                <div class="footer">
                    <a href="/login">Already have an identity? Connect →</a>
                </div>
            </div>
        </GlassCard>
    </div>
</div>

<style>
    /* Reuse the exact styles from Login for consistency */
    .auth-container {
        height: 100vh; width: 100vw;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 10%, #1e293b 0%, #020617 100%);
    }

    .auth-box { width: 100%; max-width: 420px; padding: 20px; }
    
    .inner { padding: 40px; display: flex; flex-direction: column; gap: 32px; }

    .header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .logo { width: 48px; height: 48px; background: white; color: black; font-weight: 700; border-radius: 12px; display: grid; place-items: center; font-size: 1.5rem; font-family: 'Space Grotesk'; }
    h1 { margin: 0; font-size: 1.8rem; letter-spacing: -0.5px; }
    p { margin: 0; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }

    .form { display: flex; flex-direction: column; gap: 20px; }
    
    .input-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }
    
    input {
        background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
        padding: 14px; border-radius: 8px; color: white; font-family: 'Inter'; font-size: 1rem; outline: none; transition: 0.2s;
    }
    input:focus { border-color: #2dd4bf; background: rgba(45, 212, 191, 0.05); }

    button {
        background: white; color: black; border: none;
        padding: 14px; border-radius: 8px;
        font-weight: 600; cursor: pointer; font-size: 1rem; transition: 0.2s; margin-top: 10px;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(255,255,255,0.2); }
    button:disabled { opacity: 0.7; cursor: not-allowed; }

    .error-banner { background: rgba(239, 68, 68, 0.1); color: #fca5a5; padding: 10px; border-radius: 6px; font-size: 0.85rem; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2); }

    .footer { text-align: center; }
    a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s; }
    a:hover { color: white; }
</style>