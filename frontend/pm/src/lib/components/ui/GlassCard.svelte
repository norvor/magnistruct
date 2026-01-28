<script lang="ts">
    export let hoverable = false;
    export let interactable = false;
</script>

<div 
    class="glass-surface" 
    class:hoverable 
    class:interactable
>
    <div class="glass-highlight"></div>
    <slot />
</div>

<style>
    .glass-surface {
        position: relative;
        background: rgba(30, 41, 59, 0.4); /* Slate-800 @ 40% */
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-radius: 24px;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .glass-highlight {
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        opacity: 0.5;
    }

    /* Interactive States */
    .hoverable:hover {
        transform: translateY(-6px) scale(1.005);
        background: rgba(30, 41, 59, 0.5);
        border-color: rgba(45, 212, 191, 0.3); /* Teal Glow */
        box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.2), 
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            0 0 40px rgba(45, 212, 191, 0.1); /* Ambient Glow */
    }

    .interactable { cursor: pointer; }
</style>