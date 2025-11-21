export type Status = 'Todo' | 'In Progress' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';
export type ThemeColor = 'blue' | 'purple' | 'emerald';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tags: string[];
  assignee?: User;
  dueDate?: string;
  subtasks: Subtask[];
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface ProjectStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
}

export interface ThemeConfig {
  name: ThemeColor;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  text: string;
  badge: string;
}
