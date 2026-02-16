import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    user?: {
        name?: string;
        email?: string;
        avatarUrl?: string; // If we add avatars later
    };
    className?: string;
    showName?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({ user, className, showName = false, size = "md" }: UserAvatarProps) {
    const name = user?.name || "Unknown User";
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const sizeClasses = {
        sm: "h-6 w-6 text-[10px]",
        md: "h-8 w-8 text-xs",
        lg: "h-10 w-10 text-sm",
        xl: "h-14 w-14 text-base",
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Avatar className={cn(sizeClasses[size], "border border-border/50")}>
                <AvatarImage src={user?.avatarUrl} alt={name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            {showName && (
                <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{name}</span>
                    {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                </div>
            )}
        </div>
    );
}
