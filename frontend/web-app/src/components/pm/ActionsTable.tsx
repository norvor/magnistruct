import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateWorkItem } from "@/lib/hooks/usePM";

interface ActionsTableProps {
    actions: any[];
}

export function ActionsTable({ actions }: ActionsTableProps) {
    const updateWorkItem = useUpdateWorkItem();

    const statusColors: Record<string, string> = {
        'todo': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
        'in_progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'done': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };

    if (!actions || actions.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No tasks found.</div>;
    }

    const handleToggleDone = (action: any, checked: boolean) => {
        updateWorkItem.mutate({
            id: action.id,
            data: { status: checked ? "done" : "todo" }
        });
    };

    return (
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Task Title</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Updated</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {actions.map((action) => (
                    <TableRow key={action.id} className="border-border/10 hover:bg-muted/30 transition-colors group">
                        <TableCell>
                            <Checkbox
                                checked={action.status === "done"}
                                onCheckedChange={(checked) => handleToggleDone(action, checked as boolean)}
                                className="border-border/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                        </TableCell>
                        <TableCell>
                            <Link href={`/dashboard/actions/${action.id}`}>
                                <div className={`font-medium group-hover:text-primary transition-colors cursor-pointer ${action.status === "done" ? "text-muted-foreground/50 line-through decoration-emerald-500/30" : ""}`}>
                                    {action.title}
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`capitalize border-0 ${statusColors[action.status.replace(" ", "_")] || 'bg-muted/50 text-muted-foreground'}`}>
                                {action.status.replace("_", " ")}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono opacity-60">
                            {formatDistanceToNow(new Date(action.updated_at), { addSuffix: true })}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
