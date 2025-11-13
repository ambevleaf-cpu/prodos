'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ListTodo } from 'lucide-react';
import { type Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskListWidgetProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
    onOpenTaskManager: () => void;
}

export default function TaskListWidget({ tasks, onToggleTask, onOpenTaskManager }: TaskListWidgetProps) {
    const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

    return (
        <Card className="absolute top-4 right-4 w-80 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold">Task List</CardTitle>
                <Button variant="ghost" size="sm" onClick={onOpenTaskManager} className="text-xs">
                    Open App
                </Button>
            </CardHeader>
            <CardContent>
                {incompleteTasks.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        <ListTodo className="mx-auto h-8 w-8 mb-2" />
                        All tasks completed!
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {incompleteTasks.map(task => (
                            <li key={task.id} className="flex items-center gap-2 text-sm">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onToggleTask(task.id)}
                                    className={cn(
                                        "w-5 h-5 rounded-full border-2 transition-all shrink-0",
                                        task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-primary/50 hover:border-primary'
                                    )}
                                    >
                                    {task.completed && <Check className="w-3 h-3" />}
                                </Button>
                                <span className={cn("flex-1 truncate", task.completed && "line-through text-muted-foreground")}>
                                    {task.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
