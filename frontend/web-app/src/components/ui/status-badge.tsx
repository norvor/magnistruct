import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "purple"
    | "pink"
    | "indigo";

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
    label?: string; // Optional custom label, defaults to status capitalized
}

// Map common statuses to variants
export const getStatusVariant = (status: string): StatusVariant => {
    const s = status.toLowerCase();
    if (['completed', 'done', 'active', 'published', 'won', 'success', 'passed'].includes(s)) return 'success';
    if (['in_progress', 'processing', 'running', 'ongoing'].includes(s)) return 'info';
    if (['pending', 'waiting', 'draft', 'todo', 'backlog'].includes(s)) return 'secondary';
    if (['failed', 'error', 'blocked', 'rejected', 'lost', 'critical', 'high'].includes(s)) return 'destructive';
    if (['warning', 'medium', 'review'].includes(s)) return 'warning';
    if (['low', 'trivial'].includes(s)) return 'outline';
    return 'default';
};

const variantStyles: Record<string, string> = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/50 text-secondary-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    outline: "text-foreground border-border",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

export function StatusBadge({ status, variant, className, label }: StatusBadgeProps) {
    const toggleVariant = variant || getStatusVariant(status);
    const displayLabel = label || status.replace(/_/g, " ");

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize font-medium border px-2 py-0.5 shadow-sm transition-colors",
                variantStyles[toggleVariant as string] || variantStyles.default,
                className
            )}
        >
            {displayLabel}
        </Badge>
    );
}
