import type {
  Task,
  Agent,
  Convoy,
  ApiResponse,
  CreateTaskRequest,
  CreateAgentRequest,
  CreateConvoyRequest,
  AssignTaskRequest,
  TaskStatus,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: error || 'Request failed' };
  }
  try {
    const data = await response.json();
    return { success: true, data };
  } catch {
    return { success: true, data: undefined as T };
  }
}

export const taskApi = {
  async list(status?: TaskStatus): Promise<ApiResponse<Task[]>> {
    const url = status ? `${API_BASE}/tasks?status=${status}` : `${API_BASE}/tasks`;
    const response = await fetch(url);
    return handleResponse<Task[]>(response);
  },

  async get(id: string): Promise<ApiResponse<Task>> {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    return handleResponse<Task>(response);
  },

  async create(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Task>(response);
  },

  async assign(request: AssignTaskRequest): Promise<ApiResponse<Task>> {
    const response = await fetch(`${API_BASE}/tasks/${request.taskId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: request.agentId }),
    });
    return handleResponse<Task>(response);
  },

  async complete(id: string): Promise<ApiResponse<Task>> {
    const response = await fetch(`${API_BASE}/tasks/${id}/complete`, {
      method: 'POST',
    });
    return handleResponse<Task>(response);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    return handleResponse<void>(response);
  },
};

export const agentApi = {
  async list(): Promise<ApiResponse<Agent[]>> {
    const response = await fetch(`${API_BASE}/agents`);
    return handleResponse<Agent[]>(response);
  },

  async get(id: string): Promise<ApiResponse<Agent>> {
    const response = await fetch(`${API_BASE}/agents/${id}`);
    return handleResponse<Agent>(response);
  },

  async create(data: CreateAgentRequest): Promise<ApiResponse<Agent>> {
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Agent>(response);
  },

  async update(id: string, updates: Partial<Agent>): Promise<ApiResponse<Agent>> {
    const response = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Agent>(response);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/agents/${id}`, { method: 'DELETE' });
    return handleResponse<void>(response);
  },
};

export const convoyApi = {
  async list(status?: string): Promise<ApiResponse<Convoy[]>> {
    const url = status ? `${API_BASE}/convoys?status=${status}` : `${API_BASE}/convoys`;
    const response = await fetch(url);
    return handleResponse<Convoy[]>(response);
  },

  async get(id: string): Promise<ApiResponse<Convoy>> {
    const response = await fetch(`${API_BASE}/convoys/${id}`);
    return handleResponse<Convoy>(response);
  },

  async create(data: CreateConvoyRequest): Promise<ApiResponse<Convoy>> {
    const response = await fetch(`${API_BASE}/convoys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Convoy>(response);
  },

  async addTask(convoyId: string, taskId: string): Promise<ApiResponse<Convoy>> {
    const response = await fetch(`${API_BASE}/convoys/${convoyId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    return handleResponse<Convoy>(response);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/convoys/${id}`, { method: 'DELETE' });
    return handleResponse<void>(response);
  },
};

export const workspaceApi = {
  async status(): Promise<ApiResponse<{ name: string; path: string; repository?: string }>> {
    const response = await fetch(`${API_BASE}/status`);
    return handleResponse(response);
  },
};

export const api = {
  tasks: taskApi,
  agents: agentApi,
  convoys: convoyApi,
  workspace: workspaceApi,
};
