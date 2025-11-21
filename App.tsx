import React, { useState, useMemo } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TeamSettings from './components/TeamSettings';
import TaskModal from './components/TaskModal';
import { Task, User, ProjectStats, ThemeColor, ThemeConfig, Status } from './types';
import { Plus, Bell } from 'lucide-react';

// Mock Initial Data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Alice Chen', role: 'Frontend Lead', avatarColor: '#3b82f6', initials: 'AC' },
  { id: '2', name: 'Bob Smith', role: 'Product Manager', avatarColor: '#10b981', initials: 'BS' },
  { id: '3', name: 'Charlie Day', role: 'Designer', avatarColor: '#8b5cf6', initials: 'CD' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Setup React Project',
    description: 'Initialize repository with Vite, TypeScript and Tailwind.',
    status: 'Done',
    priority: 'High',
    tags: ['setup', 'dev'],
    assignee: INITIAL_USERS[0],
    subtasks: [
      { id: 's1', title: 'Install dependencies', completed: true },
      { id: 's2', title: 'Configure Tailwind', completed: true }
    ],
    createdAt: Date.now()
  },
  {
    id: 't2',
    title: 'Design Database Schema',
    description: 'Create ER diagram for the user and task tables.',
    status: 'In Progress',
    priority: 'High',
    tags: ['backend', 'db'],
    assignee: INITIAL_USERS[1],
    subtasks: [
      { id: 's3', title: 'Draft User table', completed: true },
      { id: 's4', title: 'Draft Task table', completed: false }
    ],
    createdAt: Date.now()
  }
];

const themeMap: Record<ThemeColor, ThemeConfig> = {
  blue: { name: 'blue', primary: 'bg-blue-600', secondary: 'bg-blue-100', accent: 'text-blue-600', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  purple: { name: 'purple', primary: 'bg-purple-600', secondary: 'bg-purple-100', accent: 'text-purple-600', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  emerald: { name: 'emerald', primary: 'bg-emerald-600', secondary: 'bg-emerald-100', accent: 'text-emerald-600', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [themeColor, setThemeColor] = useState<ThemeColor>('blue');
  
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Derived State for Dashboard
  const stats: ProjectStats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'Todo').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: tasks.filter(t => t.status === 'Done').length,
      highPriority: tasks.filter(t => t.priority === 'High').length
    };
  }, [tasks]);

  // Handlers
  const handleSaveTask = (updatedTask: Task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      showNotification(`Task "${updatedTask.title}" updated`);
    } else {
      setTasks([...tasks, updatedTask]);
      showNotification(`New task "${updatedTask.title}" created`);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    showNotification("Task deleted");
  };

  const handleMoveTask = (id: string, newStatus: Status) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const theme = themeMap[themeColor];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsLoggedIn(false)}
        theme={theme}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'board' ? 'Kanban Board' : activeTab === 'team' ? 'Team Settings' : 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className={`flex items-center gap-2 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-${themeColor}-200 transition-all`}
            >
              <Plus size={18} />
              New Task
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <div className="absolute top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            {notification}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          {activeTab === 'dashboard' && <Dashboard stats={stats} theme={theme} />}
          
          {activeTab === 'board' && (
            <div className="p-6 h-full">
               <KanbanBoard 
                 tasks={tasks} 
                 onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                 onDeleteTask={handleDeleteTask}
                 onMoveTask={handleMoveTask}
                 theme={theme}
               />
            </div>
          )}

          {activeTab === 'team' && (
            <TeamSettings 
              users={users} 
              setUsers={setUsers}
              currentTheme={themeColor}
              setTheme={setThemeColor}
            />
          )}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        initialTask={editingTask}
        users={users}
      />
    </div>
  );
}

export default App;