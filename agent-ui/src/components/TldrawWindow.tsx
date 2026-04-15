import React, { useRef, useState, Suspense } from 'react';
import styled, { keyframes } from 'styled-components';
import Draggable from 'react-draggable';
import { macosTheme } from '../theme/macos';
import { XIcon, MinusIcon, Maximize2Icon, Pencil } from '../ui/InlineIcon';

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

  ${props =>
    props.$minimized &&
    `
    animation: ${minimizeOut} 0.3s ease-out forwards;
    pointer-events: none;
  `}
`;

const Window = styled.div<{ $active?: boolean; $maximized?: boolean }>`
  width: ${props => (props.$maximized ? '100vw' : '900px')};
  height: ${props => (props.$maximized ? 'calc(100vh - 108px)' : '650px')};
  min-width: ${props => (props.$maximized ? 'unset' : '600px')};
  min-height: ${props => (props.$maximized ? 'unset' : '400px')};
  background: #1e1e1e;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;

  .tl-container {
    width: 100% !important;
    height: 100% !important;
  }
`;

const TldrawStyles = () => (
  <style>{`
    @media (min-width: 768px) {
      .tl-share-zone {
        display: none !important;
      }
    }
  `}</style>
);

const LoadingPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-family: ${macosTheme.fonts.system};
`;

interface TldrawCanvasProps {
  persistenceKey: string;
}

const TldrawCanvas = React.lazy(async () => {
  await import('tldraw/tldraw.css');
  const { Tldraw } = await import('tldraw');

  return {
    default: (props: TldrawCanvasProps) => <Tldraw {...props} />,
  };
});

interface TldrawWindowProps {
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

const TldrawWindow: React.FC<TldrawWindowProps> = ({
  id,
  title,
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
            <Title>
              <Pencil size={14} />
              {title}
            </Title>
            <div style={{ width: 52 }} />
          </TitleBar>

          <CanvasContainer onMouseDown={e => e.stopPropagation()}>
            <TldrawStyles />
            <Suspense fallback={<LoadingPlaceholder>Loading canvas...</LoadingPlaceholder>}>
              <TldrawCanvas persistenceKey={`createsuite-tldraw-${id}`} />
            </Suspense>
          </CanvasContainer>
        </Window>
      </WindowWrapper>
    </Draggable>
  );
};

export default TldrawWindow;
