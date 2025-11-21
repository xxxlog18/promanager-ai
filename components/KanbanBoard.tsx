import React from 'react';
import { Task, Status, ThemeConfig } from '../types';
import { MoreHorizontal, Calendar, CheckSquare, UserCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: Status) => void;
  theme: ThemeConfig;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask, onDeleteTask, onMoveTask, theme }) => {
  
  const columns: { id: Status; title: string; color: string }[] = [
    { id: 'Todo', title: 'To Do', color: 'bg-slate-500' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'Done', title: 'Done', color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[600px]">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-slate-100/50 rounded-xl border border-slate-200/60 h-full">
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-100/50 backdrop-blur-sm z-10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                <h3 className="font-semibold text-slate-700">{col.title}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks List */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {colTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={() => onEditTask(task)}
                  onMove={(status) => onMoveTask(task.id, status)}
                  theme={theme}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TaskCard = ({ task, onEdit, onMove, theme }: { task: Task, onEdit: () => void, onMove: (s: Status) => void, theme: ThemeConfig }) => {
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  const priorityColors = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-orange-100 text-orange-600',
    High: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative cursor-pointer" onClick={onEdit}>
      
      {/* Quick Move Actions (Visible on hover/focus) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10" onClick={e => e.stopPropagation()}>
        {task.status !== 'Todo' && (
           <button onClick={() => onMove(task.status === 'Done' ? 'In Progress' : 'Todo')} className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-xs">
             ←
           </button>
        )}
        {task.status !== 'Done' && (
          <button onClick={() => onMove(task.status === 'Todo' ? 'In Progress' : 'Done')} className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-xs">
            →
          </button>
        )}
      </div>

      {/* Priority & Menu */}
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wider ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <h4 className="font-semibold text-slate-800 mb-1 leading-tight">{task.title}</h4>
      
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded border border-${theme.name}-100 text-${theme.name}-600 bg-${theme.name}-50`}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1"><CheckSquare size={12}/> {completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-${theme.name}-500 rounded-full`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Footer: Due Date & Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {task.dueDate && (
            <>
            <Calendar size={12} />
            <span>{task.dueDate}</span>
            </>
          )}
        </div>
        
        {task.assignee ? (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white"
            style={{ backgroundColor: task.assignee.avatarColor }}
            title={task.assignee.name}
          >
            {task.assignee.initials}
          </div>
        ) : (
          <UserCircle size={20} className="text-slate-300" />
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;