// Extended types for Toolbench (extends core types)

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentTask?: string;
  capabilities: string[];
  createdAt: Date;
  lastActive?: Date;
}

export type AgentStatus = 'idle' | 'working' | 'offline' | 'error';

export interface Convoy {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  status: ConvoyStatus;
  createdAt: Date;
  progress: ConvoyProgress;
}

export type ConvoyStatus = 'active' | 'completed' | 'paused';

export interface ConvoyProgress {
  total: number;
  completed: number;
  inProgress: number;
  open: number;
  blocked: number;
  percentage: number;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  icon?: string;
  expanded?: boolean;
}

export interface PanelState {
  id: string;
  title: string;
  icon: string;
  component: string;
  visible: boolean;
  collapsed: boolean;
  size: number;
  minSize: number;
  maxSize: number;
}

export interface LayoutState {
  leftPanel: {
    visible: boolean;
    width: number;
    tabs: PanelState[];
    activeTab: string;
  };
  rightPanel: {
    visible: boolean;
    width: number;
    tabs: PanelState[];
    activeTab: string;
  };
  bottomPanel: {
    visible: boolean;
    height: number;
    tabs: PanelState[];
    activeTab: string;
  };
  centerPanel: {
    activeView: 'taskboard' | 'convoy' | 'files';
  };
}

export interface DragItem {
  type: 'task' | 'file' | 'agent';
  id: string;
  sourceColumn?: string;
}

export interface FilterState {
  agent?: string;
  priority?: TaskPriority;
  tags: string[];
  status?: TaskStatus[];
  searchQuery: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string[];
  assignedAgent?: string;
}

export interface AgentFormData {
  name: string;
  capabilities: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string[];
}

export interface CreateAgentRequest {
  name: string;
  capabilities: string[];
}

export interface CreateConvoyRequest {
  name: string;
  description: string;
  tasks: string[];
}

export interface AssignTaskRequest {
  taskId: string;
  agentId: string;
}
