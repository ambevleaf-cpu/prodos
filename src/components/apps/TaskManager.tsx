'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, Calendar, Flag, Star, BarChart, ListTodo, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { type Task } from '@/lib/types';

interface TaskManagerProps {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'completed' | 'starred'>) => void;
    toggleTask: (id: number) => void;
    deleteTask: (id: number) => void;
    toggleStar: (id: number) => void;
}

export default function TaskManager({ tasks, addTask: addTaskProp, toggleTask, deleteTask, toggleStar }: TaskManagerProps) {
  const [taskInput, setTaskInput] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedCategory, setSelectedCategory] = useState<'work' | 'personal' | 'shopping' | 'health' | 'learning' | 'other'>('work');
  const [dueDate, setDueDate] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-500', ring: 'ring-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500', ring: 'ring-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500', ring: 'ring-red-500' }
  ] as const;

  const categories = [
    { value: 'work', label: '💼 Work' },
    { value: 'personal', label: '🏠 Personal' },
    { value: 'shopping', label: '🛒 Shopping' },
    { value: 'health', label: '💪 Health' },
    { value: 'learning', label: '📚 Learning' },
    { value: 'other', label: '📌 Other' }
  ] as const;

  const handleAddTask = () => {
    if (!taskInput.trim()) return;

    addTaskProp({
      title: taskInput,
      priority: selectedPriority,
      category: selectedCategory,
      dueDate: dueDate || null,
    });

    setTaskInput('');
    setDueDate('');
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, progress };
  };

  const stats = getStats();

  const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-y-auto p-4">
      <Card className="flex-grow flex flex-col border-none shadow-xl rounded-3xl">
        <CardHeader className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <CardTitle className="text-4xl font-bold text-gray-800 mb-2">Task Manager Pro</CardTitle>
                    <CardDescription>Organize your life, one task at a time</CardDescription>
                </div>
                <Button onClick={() => setShowStats(!showStats)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg">
                    <BarChart className="w-5 h-5" /> Stats
                </Button>
            </div>
            
            {showStats && (
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg h-auto"
            />
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="What needs to be done?"
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg h-auto"
              />
              <Button onClick={handleAddTask} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg text-base h-auto">
                <Plus className="w-5 h-5" />Add
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label className="block text-sm font-bold text-gray-700 mb-2">Priority</Label>
                    <div className="grid grid-cols-4 gap-2">
                    {priorities.map(p => (
                        <Button
                        key={p.value}
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedPriority(p.value)}
                        className={`transition-all h-10 w-10 ${selectedPriority === p.value ? `ring-2 ${p.ring}` : ''}`}
                        >
                        <Flag className={`w-5 h-5 ${p.color.replace('bg-','text-')}`} />
                        </Button>
                    ))}
                    </div>
                </div>
                <div>
                    <Label className="block text-sm font-bold text-gray-700 mb-2">Category</Label>
                    <Select value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
                        <SelectTrigger className="h-11 text-base">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="block text-sm font-bold text-gray-700 mb-2">Due Date</Label>
                     <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-11 text-base"
                    />
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-grow overflow-y-auto">
            <div className="space-y-4">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                    <ListTodo className="mx-auto h-24 w-24 text-gray-300 mb-6" />
                    <p className="text-2xl text-gray-500 font-medium">No tasks yet. Add one to get started!</p>
                </div>
            ) : (
                filteredTasks.map(task => {
                const priority = priorities.find(p => p.value === task.priority)!;
                const category = categories.find(c => c.value === task.category)!;
                
                return (
                    <div
                    key={task.id}
                    className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                        task.completed ? 'opacity-60' : ''
                    }`}
                    >
                    <div className="flex items-center gap-4">
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleTask(task.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${
                            task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'
                        }`}
                        >
                        {task.completed && <Check className="w-5 h-5" />}
                        </Button>

                        <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                            <span className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{category.label}</span>
                            <span className={`px-3 py-1 ${priority.color} text-white rounded-full text-xs font-semibold`}>{priority.label}</span>
                        </div>

                        {task.dueDate && (
                            <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        )}
                        </div>

                        <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStar(task.id)}
                            className={`rounded-xl transition-all ${
                                task.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        >
                            <Star className={`w-6 h-6 ${task.starred ? 'fill-current' : ''}`} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 className="w-6 h-6" />
                        </Button>
                        </div>
                    </div>
                    </div>
                );
                })
            )}
            </div>
        </CardContent>
        {tasks.length > 0 && (
          <div className="p-8 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-700">Overall Progress</span>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(stats.progress)}%
              </span>
            </div>
            <Progress value={stats.progress} className="h-6" />
          </div>
        )}
      </Card>
    </div>
  );
}
