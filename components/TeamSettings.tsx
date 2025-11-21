import React, { useState } from 'react';
import { User, ThemeColor } from '../types';
import { Plus, Trash2, Shield, Palette, Check } from 'lucide-react';

interface TeamSettingsProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentTheme: ThemeColor;
  setTheme: (color: ThemeColor) => void;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ users, setUsers, currentTheme, setTheme }) => {
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddUser = () => {
    if (!newMemberName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMemberName,
      role: 'Member',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      initials: newMemberName.substring(0, 2).toUpperCase()
    };
    setUsers([...users, newUser]);
    setNewMemberName('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const themes: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500' },
    { id: 'emerald', name: 'Forest Emerald', color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Settings & Team</h2>

      {/* Theme Customization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800">App Theme</h3>
        </div>
        <div className="flex gap-4">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`group relative w-24 h-24 rounded-xl ${theme.color} shadow-lg transition-transform active:scale-95 flex items-center justify-center`}
            >
              {currentTheme === theme.id && (
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Check className="text-white w-6 h-6" />
                </div>
              )}
              <span className="absolute bottom-2 text-xs font-medium text-white/90">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Team Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800">Team Members</h3>
        </div>

        {/* Add Member Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter name..."
            className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleAddUser}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteUser(user.id)}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;