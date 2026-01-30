<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { api } from '$lib/api';
    import { currentUser } from '$lib/stores/user';
    import GlassCard from '$lib/components/ui/GlassCard.svelte';
    import '../../app.css';

    let email = "";
    let password = "";
    let isLoading = false;
    let error = "";

    // 1. Check if already logged in (Auto-Redirect)
    onMount(async () => {
        try {
            const user = await api.auth.me();
            if (user) {
                currentUser.set(user);
                goto('/');
            }
        } catch (e) {
            // Not logged in? Stay here.
            currentUser.set(null);
        }
    });

    async function handleLogin() {
        if (!email || !password) { 
            error = "Please enter both email and password."; 
            return; 
        }
        
        isLoading = true;
        error = "";

        try {
            // 2. Perform Login
            await api.auth.login({ email, password });
            
            // 3. Fetch Profile
            const user = await api.auth.me();
            currentUser.set(user);
            
            // 4. Enter App
            goto('/');
        } catch (e) {
            console.error(e);
            error = "Invalid credentials. Access denied.";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="auth-box">
        <GlassCard>
            <div class="inner">
                <div class="header">
                    <div class="logo">M</div>
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your workspace.</p>
                </div>

                <div class="form">
                    {#if error}
                        <div class="error-banner">{error}</div>
                    {/if}

                    <div class="input-group">
                        <label for="email">Email Identifier</label>
                        <input 
                            type="email" 
                            id="email" 
                            bind:value={email} 
                            placeholder="name@magnistruct.com" 
                            disabled={isLoading} 
                        />
                    </div>

                    <div class="input-group">
                        <label for="password">Passcode</label>
                        <input 
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            placeholder="••••••••" 
                            disabled={isLoading} 
                        />
                    </div>

                    <button on:click={handleLogin} disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Connect'}
                    </button>
                </div>
                
                <div class="footer">
                    <a href="/register">Initialize new identity →</a>
                </div>
            </div>
        </GlassCard>
    </div>
</div>

<style>
    /* Consistent Auth Layout */
    .auth-container {
        height: 100vh; width: 100vw;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 10%, #1e293b 0%, #020617 100%);
    }

    .auth-box { width: 100%; max-width: 420px; padding: 20px; }
    
    .inner { padding: 40px; display: flex; flex-direction: column; gap: 32px; }

    .header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .logo { 
        width: 48px; height: 48px; 
        background: white; color: black; 
        font-weight: 700; border-radius: 12px; 
        display: grid; place-items: center; 
        font-size: 1.5rem; font-family: 'Space Grotesk'; 
    }
    h1 { margin: 0; font-size: 1.8rem; letter-spacing: -0.5px; }
    p { margin: 0; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }

    .form { display: flex; flex-direction: column; gap: 20px; }
    
    .input-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }
    
    input {
        background: rgba(0,0,0,0.2); 
        border: 1px solid rgba(255,255,255,0.1);
        padding: 14px; border-radius: 8px; 
        color: white; font-family: 'Inter'; font-size: 1rem; 
        outline: none; transition: 0.2s;
    }
    input:focus { border-color: #2dd4bf; background: rgba(45, 212, 191, 0.05); }

    button {
        background: white; color: black; border: none;
        padding: 14px; border-radius: 8px;
        font-weight: 600; cursor: pointer; font-size: 1rem; 
        transition: 0.2s; margin-top: 10px;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(255,255,255,0.2); }
    button:disabled { opacity: 0.7; cursor: not-allowed; }

    .error-banner { 
        background: rgba(239, 68, 68, 0.1); 
        color: #fca5a5; padding: 10px; border-radius: 6px; 
        font-size: 0.85rem; text-align: center; 
        border: 1px solid rgba(239, 68, 68, 0.2); 
    }

    .footer { text-align: center; }
    a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s; }
    a:hover { color: white; }
</style>