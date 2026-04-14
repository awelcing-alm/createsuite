import React, { useState, useRef, useEffect } from 'react';
import { Tldraw } from 'tldraw';
import { useSyncDemo } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import styled, { keyframes } from 'styled-components';
import Draggable from 'react-draggable';
import { macosTheme } from '../theme/macos';
import { Users, X, Minus, Maximize2 } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const minimizeOut = keyframes`
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0.3; transform: scale(0.95) translateY(20px); }
`;

const WindowWrapper = styled.div<{ $minimized?: boolean }>`
  position: absolute;
  animation: ${fadeIn} 0.2s ease-out;
  
  ${props => props.$minimized && `
    animation: ${minimizeOut} 0.3s ease-out forwards;
    pointer-events: none;
  `}
`;

const Window = styled.div<{ $active?: boolean; $maximized?: boolean }>`
  width: ${props => props.$maximized ? '100vw' : '1000px'};
  height: ${props => props.$maximized ? 'calc(100vh - 108px)' : '750px'};
  min-width: ${props => props.$maximized ? 'unset' : '800px'};
  min-height: ${props => props.$maximized ? 'unset' : '600px'};
  background: #1e1e1e;
  border-radius: ${props => props.$maximized ? '0' : '10px'};
  overflow: hidden;
  box-shadow: ${props => props.$active 
    ? '0 22px 70px 4px rgba(0, 0, 0, 0.56), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset'
    : '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset'};
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  
  ${props => props.$maximized && `
    position: fixed;
    top: 28px;
    left: 0;
  `}
`;

const TitleBar = styled.div<{ $active?: boolean }>`
  height: 38px;
  background: ${props => props.$active 
    ? 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)'
    : 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)'};
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  cursor: default;
  user-select: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;

const TrafficLights = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TrafficLight = styled.button<{ $color: 'close' | 'minimize' | 'maximize'; $active?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  
  background: ${props => {
    if (!props.$active) return '#4a4a4c';
    switch (props.$color) {
      case 'close': return '#ff5f57';
      case 'minimize': return '#febc2e';
      case 'maximize': return '#28c840';
    }
  }};
  
  &:hover {
    background: ${props => {
      switch (props.$color) {
        case 'close': return '#ff3b30';
        case 'minimize': return '#ff9500';
        case 'maximize': return '#34c759';
      }
    }};
  }
  
  svg {
    width: 8px;
    height: 8px;
    opacity: 0;
    color: rgba(0, 0, 0, 0.6);
    transition: opacity 0.1s;
  }
  
  ${TrafficLights}:hover & svg {
    opacity: 1;
  }
`;

const Title = styled.div`
  flex: 1;
  text-align: center;
  font-family: ${macosTheme.fonts.system};
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const RoomIdInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  color: white;
  font-family: ${macosTheme.fonts.mono};
  font-size: 12px;
  width: 120px;
  outline: none;
  
  &:focus {
    border-color: #007aff;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const QuadGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const QuadPanel = styled.div`
  position: relative;
  background: #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  height: 28px;
  background: rgba(30, 30, 35, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelLabel = styled.span`
  font-family: ${macosTheme.fonts.system};
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserCount = styled.span`
  font-family: ${macosTheme.fonts.system};
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BoardContainer = styled.div`
  flex: 1;
  position: relative;
  background: #1a1a1a;
  
  .tl-container {
    width: 100% !important;
    height: 100% !important;
  }
`;

interface QuadBoardWindowProps {
  id: string;
  title: string;
  onClose: (id: string) => void;
  zIndex: number;
  onFocus: (id: string) => void;
  initialPosition?: { x: number; y: number };
  minimized?: boolean;
  maximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const panelLabels = ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'];

const QuadBoardWindow: React.FC<QuadBoardWindowProps> = ({ 
  id, 
  title, 
  onClose, 
  zIndex, 
  onFocus,
  initialPosition = { x: 30, y: 30 },
  minimized = false,
  maximized = false,
  onMinimize,
  onMaximize
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [roomId, setRoomId] = useState(() => {
    const stored = localStorage.getItem(`createsuite-quad-room-${id}`);
    return stored || `quad-${id.slice(0, 8)}`;
  });

  useEffect(() => {
    localStorage.setItem(`createsuite-quad-room-${id}`, roomId);
  }, [roomId, id]);

  const handleFocus = () => {
    setIsActive(true);
    onFocus(id);
  };

  if (minimized) {
    return null;
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".title-bar"
      defaultPosition={maximized ? { x: 0, y: 0 } : initialPosition}
      position={maximized ? { x: 0, y: 0 } : undefined}
      disabled={maximized}
      onMouseDown={handleFocus}
    >
      <WindowWrapper ref={nodeRef} style={{ zIndex }} $minimized={minimized}>
        <Window $active={isActive} $maximized={maximized} onMouseDown={handleFocus}>
          <TitleBar className="title-bar" $active={isActive}>
            <TrafficLights>
              <TrafficLight 
                $color="close" 
                $active={isActive}
                onClick={(e) => { e.stopPropagation(); onClose(id); }}
              >
                <X size={8} strokeWidth={2.5} />
              </TrafficLight>
              <TrafficLight 
                $color="minimize" 
                $active={isActive}
                onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
              >
                <Minus size={8} strokeWidth={2.5} />
              </TrafficLight>
              <TrafficLight 
                $color="maximize" 
                $active={isActive}
                onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
              >
                <Maximize2 size={6} strokeWidth={2.5} />
              </TrafficLight>
            </TrafficLights>
            <Title>
              <Users size={14} />
              {title}
            </Title>
            <RoomIdInput 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="room-id"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </TitleBar>
          
          <QuadGrid onMouseDown={(e) => e.stopPropagation()}>
            {[0, 1, 2, 3].map((panelIndex) => (
              <QuadPanel key={panelIndex}>
                <PanelHeader>
                  <PanelLabel>{panelLabels[panelIndex]}</PanelLabel>
                  <UserCount>
                    <Users size={10} />
                    Join: {roomId}-{panelIndex}
                  </UserCount>
                </PanelHeader>
                <BoardContainer>
                  <CollaborativeBoard 
                    roomId={`${roomId}-${panelIndex}`} 
                  />
                </BoardContainer>
              </QuadPanel>
            ))}
          </QuadGrid>
        </Window>
      </WindowWrapper>
    </Draggable>
  );
};

interface CollaborativeBoardProps {
  roomId: string;
}

const CollaborativeBoard: React.FC<CollaborativeBoardProps> = ({ roomId }) => {
  const store = useSyncDemo({ roomId });
  
  return (
    <Tldraw 
      store={store}
    />
  );
};

export default QuadBoardWindow;
