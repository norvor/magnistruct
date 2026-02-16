'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { User, Building2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* User Info */}
                <Card className="overflow-hidden border-border/40 bg-background/60 backdrop-blur-xl transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex-1">
                            <CardTitle className="text-sm font-medium">User Profile</CardTitle>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                            <User className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user?.fullName || 'User Name'}</div>
                        <p className="text-xs text-muted-foreground">
                            {user?.email || 'user@example.com'}
                        </p>
                    </CardContent>
                </Card>

                {/* Team Info */}
                <Card className="overflow-hidden border-border/40 bg-background/60 backdrop-blur-xl transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex-1">
                            <CardTitle className="text-sm font-medium">Current Team</CardTitle>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(user as any)?.teamName || 'No Team Assigned'}</div>
                        <p className="text-xs text-muted-foreground">
                            Team ID: {(user as any)?.teamId || 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                {/* Org Info */}
                <Card className="overflow-hidden border-border/40 bg-background/60 backdrop-blur-xl transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex-1">
                            <CardTitle className="text-sm font-medium">Organization</CardTitle>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Building2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(user as any)?.orgName || 'Workspace'}</div>
                        <p className="text-xs text-muted-foreground">
                            Org ID: {(user as any)?.orgId || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/40 bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                        Detailed information about your access and role in the workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                        <span className="text-sm font-semibold">{user?.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Email Address</span>
                        <span className="text-sm font-semibold">{user?.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Current Team</span>
                        <span className="text-sm font-semibold">{(user as any)?.teamName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Organization</span>
                        <span className="text-sm font-semibold">{(user as any)?.orgName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Account Status</span>
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                            Active
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
