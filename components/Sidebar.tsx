import React from 'react';
import { Layout, Kanban, Users, Settings, LogOut, Bot } from 'lucide-react';
import { ThemeConfig } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  theme: ThemeConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, theme }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'board', label: 'Kanban Board', icon: Kanban },
    { id: 'team', label: 'Team & Settings', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${theme.name}-500 to-${theme.name}-700 flex items-center justify-center shadow-lg`}>
          <Bot className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">ProManager</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? `bg-${theme.name}-50 text-${theme.name}-700` 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? `text-${theme.name}-600` : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;