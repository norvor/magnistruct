"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
    onFilterChange: (filters: any) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...activeFilters };
        if (value === "all" || !value) {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        onFilterChange({});
    };

    const filterCount = Object.keys(activeFilters).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {filterCount > 0 && (
                        <Badge
                            variant="default"
                            className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                        >
                            {filterCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Refine your actions view
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={activeFilters.status || "all"}
                            onValueChange={(value) => handleFilterChange("status", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="review">In Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={activeFilters.priority || "all"}
                            onValueChange={(value) => handleFilterChange("priority", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={activeFilters.type || "all"}
                            onValueChange={(value) => handleFilterChange("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="action">Action</SelectItem>
                                <SelectItem value="bug">Bug</SelectItem>
                                <SelectItem value="feature">Feature</SelectItem>
                                <SelectItem value="story">Story</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assignee Filter */}
                    <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Select
                            value={activeFilters.assignee || "all"}
                            onValueChange={(value) => handleFilterChange("assignee", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All assignees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All assignees</SelectItem>
                                <SelectItem value="me">Assigned to me</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Filters */}
                    {filterCount > 0 && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm">Active Filters</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-8 text-xs"
                                >
                                    Clear all
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(activeFilters).map(([key, value]) => (
                                    <Badge
                                        key={key}
                                        variant="secondary"
                                        className="gap-1 pr-1"
                                    >
                                        <span className="capitalize">{key}:</span>
                                        <span className="font-normal">{value}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 hover:bg-destructive/20"
                                            onClick={() => handleFilterChange(key, "")}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
