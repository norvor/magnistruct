<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;
    const dispatch = createEventDispatcher();

    const VECTORS = [
        { name: 'Market', q: 'Is the opportunity big enough?', desc: 'Total Addressable Market (TAM) and growth potential.' },
        { name: 'Tech', q: 'Can we actually build this?', desc: 'Technical feasibility and complexity risk.' },
        { name: 'Team', q: 'Do we have the right people?', desc: 'Skill fit and bandwidth availability.' },
        { name: 'Moat', q: 'Is it defensible?', desc: 'Competitive advantage against copycats.' },
        { name: 'Timing', q: 'Why now?', desc: 'Market readiness and urgency.' }
    ];
</script>

{#if isOpen}
    <div class="backdrop" transition:fade on:click={() => dispatch('close')}>
        <div class="modal" transition:scale on:click|stopPropagation>
            <div class="header">
                <h3>The Pentagon Protocol</h3>
                <button on:click={() => dispatch('close')}>&times;</button>
            </div>
            
            <div class="content">
                <p class="intro">
                    We don't guess "Confidence." We derive it mathematically from these 5 vectors.
                    Tune each vector to visualize the risk profile of your bet.
                </p>

                <div class="vector-list">
                    {#each VECTORS as v}
                        <div class="vector-row">
                            <div class="v-name">{v.name}</div>
                            <div class="v-info">
                                <strong>{v.q}</strong>
                                <span>{v.desc}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; display: grid; place-items: center; backdrop-filter: blur(4px); }
    .modal { background: #1e293b; width: 500px; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    
    .header { padding: 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; background: #0f172a; }
    h3 { margin: 0; color: #fff; font-family: 'Space Grotesk'; }
    button { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
    
    .content { padding: 24px; color: #cbd5e1; }
    .intro { margin-top: 0; margin-bottom: 24px; font-size: 0.95rem; line-height: 1.5; color: #94a3b8; }

    .vector-list { display: flex; flex-direction: column; gap: 16px; }
    .vector-row { display: flex; gap: 16px; align-items: flex-start; }
    .v-name { width: 70px; font-family: 'JetBrains Mono', monospace; font-weight: bold; color: #facc15; text-align: right; padding-top: 2px; }
    .v-info { display: flex; flex-direction: column; gap: 4px; }
    .v-info strong { color: #fff; font-weight: 600; }
    .v-info span { font-size: 0.85rem; color: #94a3b8; }
</style>