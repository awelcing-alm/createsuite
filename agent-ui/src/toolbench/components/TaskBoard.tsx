import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import type { Task, TaskStatus as TaskStatusType, TaskPriority } from '../types';

const BoardContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  height: 100%;
  overflow-x: auto;
  background: #c0c0c0;
`;

const Column = styled.div<{ $minWidth: number }>`
  min-width: ${props => props.$minWidth}px;
  max-width: 320px;
  background: #d4d4d4;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  display: flex;
  flex-direction: column;
`;

const ColumnHeader = styled.div<{ $status: TaskStatusType }>`
  padding: 8px;
  background: ${props => {
    switch (props.$status) {
      case 'open': return '#e0e0e0';
      case 'in_progress': return '#c0c0ff';
      case 'completed': return '#c0ffc0';
      case 'blocked': return '#ffc0c0';
      default: return '#e0e0e0';
    }
  }};
  font-weight: bold;
  border-bottom: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskCount = styled.span`
  font-size: 11px;
  background: #404040;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 8px;
`;

const TaskList = styled.div`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskCard = styled.div<{ $priority: TaskPriority }>`
  background: #ffffff;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  padding: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.1s;

  &:hover {
    background: #f0f0f0;
    border-color: #000000 #c0c0c0 #c0c0c0 #000000;
  }
`;

const TaskCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

const TaskId = styled.span`
  font-size: 10px;
  color: #666;
  font-family: monospace;
`;

const TaskTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const TaskTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
`;

const Tag = styled.span`
  font-size: 10px;
  background: #e0e0e0;
  padding: 2px 4px;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
`;

const PriorityBadge = styled.span<{ $priority: TaskPriority }>`
  font-size: 10px;
  padding: 1px 4px;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$priority) {
      case 'critical': return '#ffcccc';
      case 'high': return '#ffe0cc';
      case 'medium': return '#ffffcc';
      case 'low': return '#ccffcc';
      default: return '#e0e0e0';
    }
  }};
`;

const Toolbar = styled.div`
  padding: 8px;
  border-bottom: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 150px;
  padding: 4px 8px;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  background: #ffffff;
  font-family: inherit;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #000080;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
`;

const ViewButton = styled(Button)<{ $active?: boolean }>`
  border-radius: 0;
  border: none;
  background: ${props => props.$active ? '#a0a0a0' : '#c0c0c0'};
  box-shadow: ${props => props.$active ? 'inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff' : 'none'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 12px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30000;
`;

const ModalContent = styled(Window)`
  width: 450px;
  max-width: 90vw;
`;

const ModalBody = styled(WindowContent)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  font-weight: bold;
`;

const FormInput = styled.input`
  padding: 4px 8px;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  background: #ffffff;
  font-family: inherit;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #000080;
  }
`;

const FormTextarea = styled.textarea`
  padding: 4px 8px;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  background: #ffffff;
  font-family: inherit;
  font-size: 12px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #000080;
  }
`;

const FormSelect = styled.select`
  padding: 4px 8px;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  background: #ffffff;
  font-family: inherit;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #000080;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

interface TaskBoardProps {
  tasks: Task[];
  agents: { id: string; name: string }[];
  onCreateTask?: (task: Partial<Task>) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onSelectTask?: (task: Task) => void;
  onDropTask?: (taskId: string, newStatus: TaskStatusType) => void;
}

const COLUMNS: { status: TaskStatusType; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'blocked', label: 'Blocked' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onCreateTask,
  onSelectTask,
  onDropTask,
}) => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    tags: '',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !search || 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [tasks, search]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatusType, Task[]> = {
      open: [],
      in_progress: [],
      completed: [],
      blocked: [],
    };
    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    onCreateTask?.({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'open',
    });
    setShowCreateModal(false);
    setNewTask({ title: '', description: '', priority: 'medium', tags: '' });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatusType) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDropTask?.(taskId, status);
  };

  if (view === 'list') {
    return (
      <div style={{ padding: '12px', height: '100%', overflow: 'auto' }}>
        <Toolbar>
          <SearchInput 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <ViewToggle>
            <ViewButton onClick={() => setView('board')}>Board</ViewButton>
            <ViewButton $active onClick={() => setView('list')}>List</ViewButton>
          </ViewToggle>
          <Button onClick={() => setShowCreateModal(true)}>New Task</Button>
        </Toolbar>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', border: '2px solid #808080' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '8px', border: '2px solid #808080' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '8px', border: '2px solid #808080' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '8px', border: '2px solid #808080' }}>Priority</th>
              <th style={{ textAlign: 'left', padding: '8px', border: '2px solid #808080' }}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} onClick={() => onSelectTask?.(task)} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '8px', border: '1px solid #c0c0c0', fontFamily: 'monospace' }}>{task.id}</td>
                <td style={{ padding: '8px', border: '1px solid #c0c0c0' }}>{task.title}</td>
                <td style={{ padding: '8px', border: '1px solid #c0c0c0' }}>{task.status}</td>
                <td style={{ padding: '8px', border: '1px solid #c0c0c0' }}>{task.priority}</td>
                <td style={{ padding: '8px', border: '1px solid #c0c0c0' }}>{task.tags.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <Toolbar>
        <SearchInput 
          placeholder="Search tasks..." 
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <ViewToggle>
          <ViewButton $active onClick={() => setView('board')}>Board</ViewButton>
          <ViewButton onClick={() => setView('list')}>List</ViewButton>
        </ViewToggle>
        <Button onClick={() => setShowCreateModal(true)}>New Task</Button>
      </Toolbar>
      <BoardContainer>
        {COLUMNS.map(column => (
          <Column key={column.status} $minWidth={280}>
            <ColumnHeader $status={column.status}>
              <span>{column.label}</span>
              <TaskCount>{tasksByStatus[column.status]?.length || 0}</TaskCount>
            </ColumnHeader>
            <TaskList
              onDragOver={handleDragOver}
              onDrop={(e: React.DragEvent) => handleDrop(e, column.status)}
            >
              {tasksByStatus[column.status]?.map(task => (
                <TaskCard
                  key={task.id}
                  $priority={task.priority}
                  draggable
                  onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask?.(task)}
                >
                  <TaskCardHeader>
                    <TaskId>{task.id}</TaskId>
                    <PriorityBadge $priority={task.priority}>{task.priority}</PriorityBadge>
                  </TaskCardHeader>
                  <TaskTitle>{task.title}</TaskTitle>
                  {task.tags.length > 0 && (
                    <TaskTags>
                      {task.tags.slice(0, 3).map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </TaskTags>
                  )}
                </TaskCard>
              ))}
              {(!tasksByStatus[column.status] || tasksByStatus[column.status].length === 0) && (
                <EmptyState>No tasks</EmptyState>
              )}
            </TaskList>
          </Column>
        ))}
      </BoardContainer>

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <WindowHeader>Create New Task</WindowHeader>
            <ModalBody>
              <FormRow>
                <FormLabel>Title *</FormLabel>
                <FormInput
                  value={newTask.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                  autoFocus
                />
              </FormRow>
              <FormRow>
                <FormLabel>Description</FormLabel>
                <FormTextarea
                  value={newTask.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description"
                  rows={3}
                />
              </FormRow>
              <FormRow>
                <FormLabel>Priority</FormLabel>
                <FormSelect
                  value={newTask.priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </FormSelect>
              </FormRow>
              <FormRow>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormInput
                  value={newTask.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="frontend, api, urgent"
                />
              </FormRow>
              <ButtonRow>
                <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreateTask} primary>Create</Button>
              </ButtonRow>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default TaskBoard;
