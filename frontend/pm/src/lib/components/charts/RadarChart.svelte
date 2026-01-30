<script lang="ts">
    export let data: Record<string, number>;
    export let size = 100;
    export let color = '#4ade80';

    const padding = 15; // More padding for the glow
    const center = size / 2;
    const radius = (size - padding * 2) / 2;
    const keys = Object.keys(data);
    const angleSlice = (Math.PI * 2) / keys.length;

    function getPoint(value: number, index: number) {
        const angle = index * angleSlice - Math.PI / 2;
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    }

    $: pathD = keys.map((key, i) => getPoint(data[key], i)).join('L') + 'Z';
    
    $: levels = [25, 50, 75, 100].map(l => 
        keys.map((_, i) => getPoint(l, i)).join('L') + 'Z'
    );

    // Unique ID for the filter
    const filterId = `glow-${color.replace('#', '')}`;
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="radar-chart">
    <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 18 -7
            " result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
    </defs>

    <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
        {#each levels as levelPath} <path d={levelPath} fill="none" /> {/each}
        {#each keys as _, i}
            <line x1={center} y1={center} x2={getPoint(100, i).split(',')[0]} y2={getPoint(100, i).split(',')[1]} />
        {/each}
    </g>

    <g filter="url(#{filterId})">
        <path d={pathD} fill={color} fill-opacity="0.5" stroke={color} stroke-width="3" stroke-linejoin="round" />
    </g>
    
    {#each keys as key, i}
        {@const [x, y] = getPoint(data[key], i).split(',')}
        <circle cx={x} cy={y} r="4" fill="#fff" stroke={color} stroke-width="2" />
    {/each}
</svg>

<style>
    .radar-chart { overflow: visible; }
</style>