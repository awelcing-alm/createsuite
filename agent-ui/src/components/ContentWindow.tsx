import React, { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Draggable from 'react-draggable';
import { macosTheme } from '../theme/macos';
import { XIcon, MinusIcon, Maximize2Icon } from './ui/InlineIcon';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const minimizeOut = keyframes`
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0.3; transform: scale(0.95) translateY(20px); }
`;

// Styled Components
const WindowWrapper = styled.div<{ $minimized?: boolean }>`
  position: absolute;
  animation: ${fadeIn} 0.2s ease-out;

  ${props =>
    props.$minimized &&
    `
    animation: ${minimizeOut} 0.3s ease-out forwards;
    pointer-events: none;
  `}
`;

const Window = styled.div<{ $active?: boolean; $maximized?: boolean }>`
  width: ${props => (props.$maximized ? '100vw' : 'min(600px, calc(100vw - 100px))')};
  height: ${props =>
    props.$maximized ? 'calc(100vh - 108px)' : 'min(400px, calc(100vh - 100px))'};
  min-width: ${props => (props.$maximized ? 'unset' : '300px')};
  min-height: ${props => (props.$maximized ? 'unset' : '200px')};
  background: rgba(40, 40, 45, 0.95);
  border-radius: ${props => (props.$maximized ? '0' : '10px')};
  overflow: hidden;
  box-shadow: ${props =>
    props.$active
      ? '0 22px 70px 4px rgba(0, 0, 0, 0.56), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset'
      : '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset'};
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;

  ${props =>
    props.$maximized &&
    `
    position: fixed;
    top: 28px;
    left: 0;
  `}
`;

const TitleBar = styled.div<{ $active?: boolean }>`
  height: 38px;
  background: ${props =>
    props.$active
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

const TrafficLight = styled.button<{
  $color: 'close' | 'minimize' | 'maximize';
  $active?: boolean;
}>`
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
      case 'close':
        return '#ff5f57';
      case 'minimize':
        return '#febc2e';
      case 'maximize':
        return '#28c840';
    }
  }};

  &:hover {
    background: ${props => {
      switch (props.$color) {
        case 'close':
          return '#ff3b30';
        case 'minimize':
          return '#ff9500';
        case 'maximize':
          return '#34c759';
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
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: white;
  padding: 8px;
`;

interface ContentWindowProps {
  id: string;
  title: string;
  type: 'image' | 'browser';
  content: string;
  onClose: (id: string) => void;
  zIndex: number;
  onFocus: (id: string) => void;
  initialPosition?: { x: number; y: number };
  minimized?: boolean;
  maximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const ContentWindow: React.FC<ContentWindowProps> = ({
  id,
  title,
  type,
  content,
  onClose,
  zIndex,
  onFocus,
  initialPosition = { x: 50, y: 50 },
  minimized = false,
  maximized = false,
  onMinimize,
  onMaximize,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);

  const handleFocus = () => {
    setIsActive(true);
    onFocus(id);
  };

  if (minimized) {
    return null; // Don't render minimized windows - they show in the dock
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
                onClick={e => {
                  e.stopPropagation();
                  onClose(id);
                }}
              >
                <XIcon size={8} strokeWidth={2.5} />
              </TrafficLight>
              <TrafficLight
                $color="minimize"
                $active={isActive}
                onClick={e => {
                  e.stopPropagation();
                  onMinimize?.();
                }}
              >
                <MinusIcon size={8} strokeWidth={2.5} />
              </TrafficLight>
              <TrafficLight
                $color="maximize"
                $active={isActive}
                onClick={e => {
                  e.stopPropagation();
                  onMaximize?.();
                }}
              >
                <Maximize2Icon size={6} strokeWidth={2.5} />
              </TrafficLight>
            </TrafficLights>
            <Title>{title}</Title>
            <div style={{ width: 52 }} />
          </TitleBar>

          <ContentArea>
            {type === 'image' && (
              <img
                src={content}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
            {type === 'browser' && (
              <iframe
                src={content}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </ContentArea>
        </Window>
      </WindowWrapper>
    </Draggable>
  );
};

export default ContentWindow;
