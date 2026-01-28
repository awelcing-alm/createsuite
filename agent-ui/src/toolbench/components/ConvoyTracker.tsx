import React from 'react';
import styled from 'styled-components';
import { Button } from 'react95';
import { Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Convoy, ConvoyStatus } from '../types';

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

const ConvoyList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ConvoyCard = styled.div`
  background: #ffffff;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
  padding: 12px;
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background: #f0f0f0;
    border-color: #000000 #c0c0c0 #c0c0c0 #000000;
  }
`;

const ConvoyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const ConvoyTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const ConvoyId = styled.span`
  font-size: 10px;
  font-family: monospace;
  color: #666;
  margin-left: 8px;
`;

const ConvoyDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ProgressBar = styled.div`
  height: 20px;
  background: #e0e0e0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number; $status: ConvoyStatus }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#00aa00';
      case 'active': return '#0000aa';
      case 'paused': return '#aaaa00';
      default: return '#808080';
    }
  }};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: bold;
  color: #000000;
  text-shadow: 1px 1px 0 #ffffff;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  font-size: 11px;
`;

const Stat = styled.span<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#00aa00';
      case 'in_progress': return '#0000aa';
      case 'open': return '#666666';
      case 'blocked': return '#aa0000';
      default: return '#666666';
    }
  }};
`;

const StatusBadge = styled.span<{ $status: ConvoyStatus }>`
  font-size: 10px;
  padding: 2px 6px;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#ccffcc';
      case 'active': return '#ccccff';
      case 'paused': return '#ffffcc';
      default: return '#e0e0e0';
    }
  }};
  border: 1px solid;
  border-color: ${props => {
    switch (props.$status) {
      case 'completed': return '#00aa00';
      case 'active': return '#0000aa';
      case 'paused': return '#aaaa00';
      default: return '#808080';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 12px;
`;

const TaskBreakdown = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const TaskDot = styled.div<{ $status: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#00aa00';
      case 'in_progress': return '#0000aa';
      case 'open': return '#e0e0e0';
      case 'blocked': return '#aa0000';
      default: return '#e0e0e0';
    }
  }};
  border: 1px solid;
  border-color: ${props => {
    switch (props.$status) {
      case 'completed': return '#008800';
      case 'in_progress': return '#000088';
      case 'open': return '#c0c0c0';
      case 'blocked': return '#880000';
      default: return '#c0c0c0';
    }
  }};
`;

interface ConvoyTrackerProps {
  convoys: Convoy[];
  onSelectConvoy?: (convoy: Convoy) => void;
}

const STATUS_LABELS: Record<ConvoyStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={12} />,
  in_progress: <Clock size={12} />,
  open: <Clock size={12} />,
  blocked: <AlertCircle size={12} />,
};

export const ConvoyTracker: React.FC<ConvoyTrackerProps> = ({
  convoys,
  onSelectConvoy,
}) => {
  return (
    <Container>
      <Toolbar>
        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Convoys</span>
        <Button size="sm">New Convoy</Button>
      </Toolbar>
      <ConvoyList>
        {convoys.length === 0 ? (
          <EmptyState>
            <Truck size={32} style={{ marginBottom: '8px' }} />
            <p>No convoys yet</p>
            <p>Group tasks into convoys to track progress</p>
          </EmptyState>
        ) : (
          convoys.map(convoy => (
            <ConvoyCard
              key={convoy.id}
              onClick={() => onSelectConvoy?.(convoy)}
            >
              <ConvoyHeader>
                <div>
                  <ConvoyTitle>{convoy.name}</ConvoyTitle>
                  <ConvoyId>{convoy.id}</ConvoyId>
                </div>
                <StatusBadge $status={convoy.status}>
                  {STATUS_LABELS[convoy.status]}
                </StatusBadge>
              </ConvoyHeader>
              {convoy.description && (
                <ConvoyDescription>{convoy.description}</ConvoyDescription>
              )}
              <ProgressBar>
                <ProgressFill
                  $percentage={convoy.progress.percentage}
                  $status={convoy.status}
                />
                <ProgressText>
                  {convoy.progress.completed}/{convoy.progress.total} ({convoy.progress.percentage}%)
                </ProgressText>
              </ProgressBar>
              <StatsRow>
                <Stat $status="completed">
                  {ICON_MAP.completed}
                  {convoy.progress.completed} Done
                </Stat>
                <Stat $status="in_progress">
                  {ICON_MAP.in_progress}
                  {convoy.progress.inProgress} Active
                </Stat>
                <Stat $status="blocked">
                  {ICON_MAP.blocked}
                  {convoy.progress.blocked} Blocked
                </Stat>
              </StatsRow>
              <TaskBreakdown>
                {Array.from({ length: convoy.tasks.length }).map((_, i) => {
                  const statuses = ['completed', 'in_progress', 'open', 'blocked'];
                  const status = statuses[i % 4] as 'completed' | 'in_progress' | 'open' | 'blocked';
                  return <TaskDot key={i} $status={status} title={`Task ${i + 1}: ${status}`} />;
                })}
              </TaskBreakdown>
            </ConvoyCard>
          ))
        )}
      </ConvoyList>
    </Container>
  );
};

export default ConvoyTracker;
