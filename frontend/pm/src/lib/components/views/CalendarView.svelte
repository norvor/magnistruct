<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Column, Task } from '$lib/api';

    export let columns: Column[] = [];
    const dispatch = createEventDispatcher();

    // Date Logic
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    $: daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    $: firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    $: tasksByDate = (() => {
        const map: Record<number, Task[]> = {};
        columns.forEach(col => {
            col.tasks.forEach(t => {
                if (t.due_date) {
                    const d = new Date(t.due_date);
                    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                        const day = d.getDate();
                        if (!map[day]) map[day] = [];
                        map[day].push(t);
                    }
                }
            });
        });
        return map;
    })();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function changeMonth(delta: number) {
        currentMonth += delta;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    }

    function handleDayClick(day: number) {
        const date = new Date(currentYear, currentMonth, day);
        dispatch('requestCreate', date);
    }
</script>

<div class="calendar-plate">
    <div class="calendar-toolbar">
        <div class="month-title">
            <h3>{monthNames[currentMonth]} {currentYear}</h3>
        </div>
        <div class="nav-actions">
            <button class="nav-btn" on:click={() => changeMonth(-1)}>←</button>
            <button class="today-btn" on:click={() => { currentMonth = today.getMonth(); currentYear = today.getFullYear(); }}>Today</button>
            <button class="nav-btn" on:click={() => changeMonth(1)}>→</button>
        </div>
    </div>

    <div class="calendar-grid">
        <div class="day-head">Sun</div>
        <div class="day-head">Mon</div>
        <div class="day-head">Tue</div>
        <div class="day-head">Wed</div>
        <div class="day-head">Thu</div>
        <div class="day-head">Fri</div>
        <div class="day-head">Sat</div>

        {#each Array(firstDayIndex) as _}
            <div class="day-cell disabled"></div>
        {/each}

        {#each Array(daysInMonth) as _, i}
            {@const dayNum = i + 1}
            {@const dayTasks = tasksByDate[dayNum] || []}
            {@const isToday = dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()}
            
            <div 
                class="day-cell" 
                class:is-today={isToday}
                on:click={() => handleDayClick(dayNum)}
                role="button" tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && handleDayClick(dayNum)}
            >
                <div class="date-header">
                    <span class="num">{dayNum}</span>
                </div>

                <div class="event-stack">
                    {#each dayTasks as task}
                        <button 
                            class="event-pill {task.priority}" 
                            on:click|stopPropagation={() => dispatch('openTask', task)}
                            title={task.title}
                        >
                            {task.title}
                        </button>
                    {/each}
                </div>

                <div class="hover-add">+</div>
            </div>
        {/each}
    </div>
</div>

<style>
    .calendar-plate {
        width: 100%; height: 100%;
        background: var(--card-bg); /* Solid Plate */
        border: 1px solid var(--card-border);
        border-radius: 12px;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    /* TOOLBAR */
    .calendar-toolbar {
        padding: 16px 24px;
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid var(--glass-border);
        background: var(--card-bg);
    }
    .month-title h3 { margin: 0; font-size: 1.2rem; color: var(--text-primary); }

    .nav-actions { display: flex; gap: 8px; }
    .nav-btn, .today-btn {
        background: var(--column-bg); border: 1px solid var(--glass-border);
        color: var(--text-primary); padding: 6px 12px; border-radius: 6px;
        cursor: pointer; font-size: 0.9rem; transition: 0.2s;
    }
    .nav-btn:hover, .today-btn:hover { background: var(--glass-highlight); }

    /* GRID STRUCTURE */
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        /* Force rows to fill available height evenly */
        grid-auto-rows: 1fr; 
        flex: 1;
        overflow-y: auto;
        background: var(--glass-border); /* Creates the grid lines */
        gap: 1px; /* The gap shows the background color (borders) */
    }

    /* HEADERS */
    .day-head {
        background: var(--column-bg);
        color: var(--text-secondary);
        font-size: 0.75rem; text-transform: uppercase; font-weight: 700;
        padding: 10px; text-align: center;
        /* Sticky headers for scrolling inside month */
        position: sticky; top: 0; z-index: 10;
        min-height: 30px; max-height: 30px; /* Don't grow */
    }

    /* CELLS */
    .day-cell {
        background: var(--card-bg); /* Reset from gap color */
        padding: 8px; min-height: 120px;
        position: relative; cursor: pointer;
        display: flex; flex-direction: column; gap: 4px;
        transition: background 0.1s;
    }
    .day-cell:hover { background: var(--list-hover); }
    .day-cell.disabled { background: var(--column-bg); opacity: 0.5; cursor: default; }

    /* TODAY HIGHLIGHT */
    .day-cell.is-today { background: rgba(45, 212, 191, 0.05); }
    .day-cell.is-today .num { 
        background: var(--orb-1-color); color: #000; 
        width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; 
    }

    .date-header { display: flex; justify-content: flex-end; margin-bottom: 4px; }
    .num { font-size: 0.8rem; color: var(--text-tertiary); font-weight: 500; }

    /* EVENT PILLS */
    .event-stack { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 100%; }

    .event-pill {
        font-size: 0.75rem; padding: 4px 8px; border-radius: 4px;
        border: none; text-align: left; cursor: pointer;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        color: white; width: 100%;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        font-weight: 500;
    }

    /* Solid Colors for Readability */
    .event-pill.p1 { background: #ef4444; }
    .event-pill.p2 { background: #f59e0b; }
    .event-pill.p3 { background: #3b82f6; }
    .event-pill.p4 { background: #64748b; }

    /* HOVER ADD */
    .hover-add {
        position: absolute; bottom: 8px; left: 8px;
        font-size: 1.2rem; color: var(--text-tertiary);
        opacity: 0; transition: 0.2s; line-height: 1;
    }
    .day-cell:hover .hover-add { opacity: 1; }
</style>