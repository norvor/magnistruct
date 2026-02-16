import { differenceInDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Journey } from "./types/pm";

export function getJourneyDurationType(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return "Season";

    const durationDays = Math.abs(differenceInDays(new Date(endDate), new Date(startDate)));

    if (durationDays <= 14) {
        return "Sprint";
    } else if (durationDays <= 45) {
        return "Season";
    } else {
        return "Era";
    }
}

export function getJourneyStatusLabel(journey: Journey) {
    const durationType = getJourneyDurationType(journey.start_date, journey.end_date);

    if (!journey.start_date || !journey.end_date) {
        return `Draft ${durationType}`;
    }

    const now = new Date();
    const start = startOfDay(new Date(journey.start_date));
    const end = endOfDay(new Date(journey.end_date));

    if (isAfter(start, now)) {
        return `Upcoming ${durationType}`;
    } else if (isBefore(end, now)) {
        return `Past ${durationType}`;
    } else {
        return `Current ${durationType}`;
    }
}

export function getJourneyStatusColor(journey: Journey) {
    if (!journey.start_date || !journey.end_date) {
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }

    const now = new Date();
    const start = startOfDay(new Date(journey.start_date));
    const end = endOfDay(new Date(journey.end_date));

    if (isAfter(start, now)) {
        // Upcoming
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    } else if (isBefore(end, now)) {
        // Past
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    } else {
        // Current
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
}
