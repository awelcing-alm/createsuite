import React, { useState } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import { Cpu, User, Activity, Shield, Code, Palette, Terminal } from 'lucide-react';
import type { Agent, AgentStatus as AgentStatusType } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
`;

const Toolbar = styled.div`
  padding: 8px;
  border-bottom: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AgentList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AgentCard = styled.div<{ $status: AgentStatusType }>`
  background: #ffffff;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  padding: 10px;
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background: #f0f0f0;
    border-color: #000000 #c0c0c0 #c0c0c0 #000000;
  }

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: ${props => {
      switch (props.$status) {
        case 'working': return '#00aa00';
        case 'idle': return '#aaaa00';
        case 'error': return '#aa0000';
        case 'offline': return '#808080';
        default: return '#808080';
      }
    }};
  }
`;

const AgentCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const AgentAvatar = styled.div<{ $status: AgentStatusType }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$status) {
      case 'working': return '#e0ffe0';
      case 'idle': return '#ffffe0';
      case 'error': return '#ffe0e0';
      case 'offline': return '#e0e0e0';
      default: return '#e0e0e0';
    }
  }};
  border: 2px solid;
  border-color: ${props => {
    switch (props.$status) {
      case 'working': return '#00aa00';
      case 'idle': return '#aaaa00';
      case 'error': return '#aa0000';
      case 'offline': return '#808080';
      default: return '#808080';
    }
  }};
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const AgentStatus = styled.div<{ $status: AgentStatusType }>`
  font-size: 11px;
  text-transform: uppercase;
  color: ${props => {
    switch (props.$status) {
      case 'working': return '#00aa00';
      case 'idle': return '#aaaa00';
      case 'error': return '#aa0000';
      case 'offline': return '#808080';
      default: return '#808080';
    }
  }};
`;

const Capabilities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Capability = styled.span<{ $type?: string }>`
  font-size: 10px;
  padding: 2px 6px;
  background: #e0e0ff;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
`;

const CurrentTask = styled.div`
  margin-top: 8px;
  padding: 6px;
  background: #f0f0f0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  font-size: 11px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
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
  width: 400px;
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

const CapabilityGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CapabilityOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => props.$selected ? '#a0a0a0' : '#e0e0e0'};
  border: 2px solid;
  border-color: ${props => props.$selected ? '#000000 #ffffff #ffffff #000000' : '#ffffff #808080 #808080 #ffffff'};
  cursor: pointer;
  font-size: 11px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const ICON_MAP: Record<string, React.ReactNode> = {
  frontend: <Palette size={12} />,
  backend: <Code size={12} />,
  testing: <Shield size={12} />,
  api: <Terminal size={12} />,
  devops: <Activity size={12} />,
  default: <Cpu size={12} />,
};

const STATUS_LABELS: Record<AgentStatusType, string> = {
  idle: 'Idle',
  working: 'Working',
  offline: 'Offline',
  error: 'Error',
};

interface AgentStatusProps {
  agents: Agent[];
  onCreateAgent?: (agent: Partial<Agent>) => void;
  onSelectAgent?: (agent: Agent) => void;
}

const AVAILABLE_CAPABILITIES = [
  'frontend', 'backend', 'testing', 'api', 'devops', 'database', 
  'security', 'performance', 'docs', 'design'
];

export const AgentStatusPanel: React.FC<AgentStatusProps> = ({
  agents,
  onCreateAgent,
  onSelectAgent,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    capabilities: [] as string[],
  });

  const handleCreateAgent = () => {
    if (!newAgent.name.trim() || newAgent.capabilities.length === 0) return;
    onCreateAgent?.({
      name: newAgent.name,
      capabilities: newAgent.capabilities,
      status: 'idle',
    });
    setShowCreateModal(false);
    setNewAgent({ name: '', capabilities: [] });
  };

  const toggleCapability = (cap: string) => {
    setNewAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  return (
    <>
      <Container>
        <Toolbar>
          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Agents</span>
          <Button onClick={() => setShowCreateModal(true)} size="sm">New Agent</Button>
        </Toolbar>
        <AgentList>
          {agents.length === 0 ? (
            <EmptyState>
              <Cpu size={32} style={{ marginBottom: '8px' }} />
              <p>No agents yet</p>
              <p>Create an agent to get started</p>
            </EmptyState>
          ) : (
            agents.map(agent => (
              <AgentCard
                key={agent.id}
                $status={agent.status}
                onClick={() => onSelectAgent?.(agent)}
              >
                <AgentCardHeader>
                  <AgentAvatar $status={agent.status}>
                    <User size={20} />
                  </AgentAvatar>
                  <AgentInfo>
                    <AgentName>{agent.name}</AgentName>
                    <AgentStatus $status={agent.status}>
                      {STATUS_LABELS[agent.status]}
                    </AgentStatus>
                  </AgentInfo>
                </AgentCardHeader>
                {agent.capabilities.length > 0 && (
                  <Capabilities>
                    {agent.capabilities.slice(0, 5).map(cap => (
                      <Capability key={cap}>
                        {ICON_MAP[cap] || ICON_MAP.default}
                        <span style={{ marginLeft: '4px' }}>{cap}</span>
                      </Capability>
                    ))}
                  </Capabilities>
                )}
                {agent.currentTask && (
                  <CurrentTask>
                    <strong>Current task:</strong> {agent.currentTask}
                  </CurrentTask>
                )}
              </AgentCard>
            ))
          )}
        </AgentList>
      </Container>

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <WindowHeader>Create New Agent</WindowHeader>
            <ModalBody>
              <FormRow>
                <FormLabel>Name *</FormLabel>
                <FormInput
                  value={newAgent.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewAgent(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Agent name (e.g., Alice, Bob)"
                  autoFocus
                />
              </FormRow>
              <FormRow>
                <FormLabel>Capabilities *</FormLabel>
                <CapabilityGrid>
                  {AVAILABLE_CAPABILITIES.map(cap => (
                    <CapabilityOption
                      key={cap}
                      $selected={newAgent.capabilities.includes(cap)}
                    >
                      <input
                        type="checkbox"
                        checked={newAgent.capabilities.includes(cap)}
                        onChange={() => toggleCapability(cap)}
                        style={{ display: 'none' }}
                      />
                      {ICON_MAP[cap] || ICON_MAP.default}
                      <span>{cap}</span>
                    </CapabilityOption>
                  ))}
                </CapabilityGrid>
              </FormRow>
              <ButtonRow>
                <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateAgent} 
                  primary
                  disabled={!newAgent.name.trim() || newAgent.capabilities.length === 0}
                >
                  Create
                </Button>
              </ButtonRow>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AgentStatusPanel;
