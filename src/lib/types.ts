export interface Task {
    id: number;
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'work' | 'personal' | 'shopping' | 'health' | 'learning' | 'other';
    dueDate: string | null;
    starred: boolean;
}
