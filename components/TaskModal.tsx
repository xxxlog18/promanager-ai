import React, { useState, useEffect } from 'react';
import { Task, Status, Priority, User, Subtask } from '../types';
import { X, Sparkles, Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import { generateTaskDetails, generateSubtasks } from '../services/gemini';
import { v4 as uuidv4 } from 'uuid'; // We don't have uuid package, so simulate or use crypto

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
  users: User[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialTask, users }) => {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('Todo');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [dueDate, setDueDate] = useState('');

  // AI Loading States
  const [isAiAssisting, setIsAiAssisting] = useState(false);
  const [isAiSubtasking, setIsAiSubtasking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description);
        setStatus(initialTask.status);
        setPriority(initialTask.priority);
        setTags(initialTask.tags);
        setAssigneeId(initialTask.assignee?.id || '');
        setSubtasks(initialTask.subtasks);
        setDueDate(initialTask.dueDate || '');
      } else {
        // Reset for new task
        setTitle('');
        setDescription('');
        setStatus('Todo');
        setPriority('Medium');
        setTags([]);
        setAssigneeId('');
        setSubtasks([]);
        setDueDate('');
      }
    }
  }, [isOpen, initialTask]);

  const handleSave = () => {
    if (!title.trim()) return;

    const task: Task = {
      id: initialTask ? initialTask.id : generateId(),
      title,
      description,
      status,
      priority,
      tags,
      assignee: users.find(u => u.id === assigneeId),
      subtasks,
      dueDate,
      createdAt: initialTask ? initialTask.createdAt : Date.now(),
    };
    onSave(task);
    onClose();
  };

  const handleAiAssist = async () => {
    if (!title) return;
    setIsAiAssisting(true);
    try {
      const result = await generateTaskDetails(title);
      setDescription(result.description);
      setPriority(result.priority as Priority);
      setTags(result.tags);
    } catch (e) {
      alert("Failed to generate details. Check API Key.");
    } finally {
      setIsAiAssisting(false);
    }
  };

  const handleAiSubtasks = async () => {
    if (!title) return;
    setIsAiSubtasking(true);
    try {
      const resultStrings = await generateSubtasks(title, description);
      const newSubtasks: Subtask[] = resultStrings.map(str => ({
        id: generateId(),
        title: str,
        completed: false
      }));
      setSubtasks([...subtasks, ...newSubtasks]);
    } catch (e) {
      alert("Failed to generate subtasks.");
    } finally {
      setIsAiSubtasking(false);
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: generateId(), title: 'New Subtask', completed: false }]);
  };

  const updateSubtask = (id: string, text: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, title: text } : s));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. Redesign Homepage"
              />
              <button
                onClick={handleAiAssist}
                disabled={!title || isAiAssisting}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
              >
                {isAiAssisting ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>AI Assist</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Detailed description..."
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Comma separated)</label>
             <input
                type="text"
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 outline-none"
                placeholder="design, frontend, api"
             />
          </div>

          {/* Subtasks */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-700">Subtasks</label>
              <div className="flex gap-2">
                <button
                  onClick={handleAiSubtasks}
                  disabled={!title || isAiSubtasking}
                  className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  {isAiSubtasking ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                  Auto-Generate
                </button>
                <button onClick={addSubtask} className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {subtasks.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No subtasks yet.</p>}
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 group">
                  <input 
                    type="checkbox" 
                    checked={st.completed} 
                    onChange={() => {
                      setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s));
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => updateSubtask(st.id, e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 border-b border-transparent focus:border-slate-300 outline-none text-sm py-1"
                  />
                  <button onClick={() => deleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95">
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;