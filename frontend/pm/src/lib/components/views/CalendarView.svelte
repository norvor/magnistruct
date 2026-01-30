<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Column, Task } from '$lib/api';
    import { fade } from 'svelte/transition';

    export let columns: Column[] = [];

    const dispatch = createEventDispatcher();

    // --- CALENDAR LOGIC ---
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    $: daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    $: firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    
    // Flatten tasks
    $: allTasks = columns.flatMap(c => c.tasks);

    // Group tasks by Date String (YYYY-MM-DD)
    $: tasksByDate = allTasks.reduce((acc, task) => {
        // FIX: Read from classic.due_date
        if (task.classic?.due_date) {
            const dateStr = new Date(task.classic.due_date).toISOString().split('T')[0];
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(task);
        }
        return acc;
    }, {} as Record<string, Task[]>);

    function nextMonth() {
        if (currentMonth === 11) { currentMonth = 0; currentYear++; } 
        else { currentMonth++; }
    }

    function prevMonth() {
        if (currentMonth === 0) { currentMonth = 11; currentYear--; } 
        else { currentMonth--; }
    }

    function handleDayClick(day: number) {
        const date = new Date(currentYear, currentMonth, day);
        // Correct for timezone offset so modal gets the right day
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        dispatch('requestCreate', offsetDate);
    }

    function handleTaskClick(e: Event, task: Task) {
        e.stopPropagation();
        dispatch('openTask', task);
    }
</script>

<div class="calendar-container" transition:fade={{ duration: 200 }}>
    <div class="calendar-header">
        <button on:click={prevMonth}>&lt;</button>
        <h3>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button on:click={nextMonth}>&gt;</button>
    </div>

    <div class="calendar-grid">
        <div class="weekday">Sun</div>
        <div class="weekday">Mon</div>
        <div class="weekday">Tue</div>
        <div class="weekday">Wed</div>
        <div class="weekday">Thu</div>
        <div class="weekday">Fri</div>
        <div class="weekday">Sat</div>

        {#each Array(firstDayIndex) as _}
            <div class="day empty"></div>
        {/each}

        {#each Array(daysInMonth) as _, i}
            {@const day = i + 1}
            {@const dateKey = new Date(Date.UTC(currentYear, currentMonth, day)).toISOString().split('T')[0]}
            {@const dayTasks = tasksByDate[dateKey] || []}
            {@const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()}

            <div 
                class="day" 
                class:today={isToday}
                on:click={() => handleDayClick(day)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && handleDayClick(day)}
            >
                <div class="day-number">{day}</div>
                
                <div class="day-content">
                    {#each dayTasks as task}
                        <button 
                            class="calendar-task {task.classic?.priority || 'p4'}"
                            on:click={(e) => handleTaskClick(e, task)}
                        >
                            {task.title}
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .calendar-container {
        flex: 1;
        background: var(--card-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    .calendar-header {
        padding: 16px;
        display: flex; justify-content: space-between; align-items: center;
        background: var(--glass-highlight);
        border-bottom: 1px solid var(--glass-border);
    }
    .calendar-header h3 { margin: 0; color: var(--text-primary); font-size: 1.1rem; }
    .calendar-header button {
        background: transparent; border: 1px solid var(--glass-border);
        color: var(--text-secondary); width: 32px; height: 32px; border-radius: 6px;
        cursor: pointer;
    }
    .calendar-header button:hover { background: rgba(255,255,255,0.1); }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: 40px repeat(auto-fill, minmax(100px, 1fr));
        flex: 1;
        overflow-y: auto;
    }

    .weekday {
        display: grid; place-items: center;
        font-size: 0.8rem; font-weight: 600; color: var(--text-tertiary);
        border-bottom: 1px solid var(--glass-border);
        background: rgba(0,0,0,0.2);
    }

    .day {
        border-right: 1px solid var(--glass-border);
        border-bottom: 1px solid var(--glass-border);
        min-height: 100px;
        padding: 8px;
        position: relative;
        cursor: pointer;
        transition: background 0.1s;
    }
    .day:hover { background: rgba(255,255,255,0.02); }
    .day:nth-child(7n) { border-right: none; } /* Remove right border for last col */

    .day.today { background: rgba(45, 212, 191, 0.05); }
    .day.today .day-number { 
        background: var(--orb-1-color); color: #000; 
        width: 24px; height: 24px; border-radius: 50%;
        display: grid; place-items: center;
    }

    .day-number {
        font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;
        margin-bottom: 4px;
    }

    .day-content {
        display: flex; flex-direction: column; gap: 4px;
    }

    .calendar-task {
        background: rgba(255,255,255,0.1);
        border: none; border-left: 3px solid transparent;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 0.75rem; color: var(--text-primary);
        text-align: left;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        cursor: pointer;
        width: 100%;
    }
    
    .calendar-task.p1 { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.15); }
    .calendar-task.p2 { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.15); }
    .calendar-task.p3 { border-left-color: #3b82f6; background: rgba(59, 130, 246, 0.15); }
    .calendar-task.p4 { border-left-color: #94a3b8; }
</style>