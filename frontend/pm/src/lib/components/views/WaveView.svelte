<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { api, type Task } from '$lib/api';
    import { slide } from 'svelte/transition';

    export let allTasks: Task[] = [];
    const dispatch = createEventDispatcher();

    $: waveTasks = allTasks.filter(t => t.wave !== undefined);
    
    // Phases
    $: phases = {
        formation: waveTasks.filter(t => t.wave?.phase === 'formation'),
        rise: waveTasks.filter(t => t.wave?.phase === 'rise'),
        crest: waveTasks.filter(t => t.wave?.phase === 'crest')
    };

    async function amplify(task: Task) {
        if (!task.wave) return;
        const newAmp = Math.min((task.wave.amplitude || 10) + 10, 100);
        dispatch('update', { ...task, wave: { ...task.wave, amplitude: newAmp } });
        await api.tasks.update(task.id, { amplitude: newAmp });
    }
</script>

<div class="wave-container">
    <div class="wave-header">
        <h3>🌊 The Wave</h3>
        <p>Amplitude & Phase</p>
    </div>

    <div class="oscilloscope">
        <div class="phase-col">
            <h4>Formation</h4>
            {#each phases.formation as task}
                <div class="freq-bar" style="height: {task.wave?.amplitude}px" on:click={() => dispatch('openTask', task)}>
                    <div class="bar-fill"></div>
                    <span class="bar-label">{task.title}</span>
                </div>
            {/each}
        </div>

        <div class="phase-col active">
            <h4>Rise</h4>
            {#each phases.rise as task}
                <div class="freq-bar" style="height: {task.wave?.amplitude}px" on:click={() => dispatch('openTask', task)}>
                    <div class="bar-fill rising"></div>
                    <span class="bar-label">{task.title}</span>
                    <button class="amp-btn" on:click|stopPropagation={() => amplify(task)}>↑</button>
                </div>
            {/each}
        </div>

        <div class="phase-col">
            <h4>Crest</h4>
            {#each phases.crest as task}
                <div class="freq-bar" style="height: {task.wave?.amplitude}px" on:click={() => dispatch('openTask', task)}>
                    <div class="bar-fill cresting"></div>
                    <span class="bar-label">{task.title}</span>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .wave-container { padding: 40px; height: 100%; overflow-y: auto; background: #000; color: #ec4899; }
    .wave-header { text-align: center; margin-bottom: 40px; }
    h3 { font-family: 'Space Grotesk'; color: #ec4899; margin: 0; }
    
    .oscilloscope { display: flex; height: 400px; align-items: flex-end; justify-content: space-around; padding-bottom: 20px; border-bottom: 2px solid #ec4899; }

    .phase-col { display: flex; align-items: flex-end; gap: 8px; height: 100%; border-right: 1px dashed rgba(236, 72, 153, 0.3); padding: 0 20px; min-width: 200px; position: relative; }
    .phase-col h4 { position: absolute; bottom: -30px; width: 100%; text-align: center; color: #ec4899; font-size: 0.8rem; text-transform: uppercase; }

    .freq-bar {
        width: 40px; min-height: 20px; background: rgba(236, 72, 153, 0.1);
        border: 1px solid #ec4899;
        display: flex; align-items: flex-end; justify-content: center;
        position: relative; cursor: pointer; transition: height 0.3s cubic-bezier(0.4, 2, 0.5, 1);
    }
    .bar-fill { width: 100%; height: 100%; background: #ec4899; opacity: 0.2; }
    .rising { opacity: 0.5; }
    .cresting { opacity: 0.8; background: #fff; }

    .bar-label {
        position: absolute; top: -20px; font-size: 0.6rem; color: #fff; white-space: nowrap;
        transform: rotate(-45deg); transform-origin: left bottom;
    }
    .amp-btn {
        position: absolute; bottom: 0; left: 0; width: 100%; background: transparent; border: none; color: white; cursor: pointer; opacity: 0;
    }
    .freq-bar:hover .amp-btn { opacity: 1; }
</style>