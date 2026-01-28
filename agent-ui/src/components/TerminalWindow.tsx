import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { io, Socket } from 'socket.io-client';
import styled, { keyframes } from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import Draggable from 'react-draggable';

// Loading spinner animation
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 14px;
`;

const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;
  background: black;
  padding: 4px;
  overflow: hidden;
  
  /* Custom scrollbar for xterm if needed */
  .xterm-viewport {
    overflow-y: auto;
  }
`;

const StyledWindow = styled(Window)`
  width: min(600px, calc(100vw - 100px));
  height: min(400px, calc(100vh - 100px));
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  min-height: 200px;
`;

const StyledWindowContent = styled(WindowContent)`
  flex: 1;
  display: flex;
  padding: 0;
  margin: 4px;
`;

interface TerminalWindowProps {
  id: string;
  title: string;
  onClose: (id: string) => void;
  zIndex: number;
  onFocus: (id: string) => void;
  initialPosition?: { x: number; y: number };
  initialCommand?: string;
  onUiCommand?: (command: any) => void;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ 
  id, 
  title, 
  onClose, 
  zIndex, 
  onFocus,
  initialPosition = { x: 50, y: 50 },
  initialCommand,
  onUiCommand
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Initialize Socket - use relative path for production compatibility
    // In dev, Vite proxy handles this. In prod, served from same origin.
    socketRef.current = io();

    // Initialize Terminal
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"Cascadia Code", Menlo, monospace',
      fontSize: 14,
      theme: {
        background: '#000000',
        foreground: '#ffffff',
      }
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle Resize
    const handleResize = () => {
      fitAddon.fit();
      if (socketRef.current) {
        socketRef.current.emit('resize', { cols: term.cols, rows: term.rows });
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Socket Events
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      term.writeln('\x1b[32mConnected to Agent Backend...\x1b[0m');
      socketRef.current?.emit('spawn', { cols: term.cols, rows: term.rows });
      setIsLoading(false);
      
      if (initialCommand) {
        // Send initial command once connected and spawned
        // We add a small delay to ensure shell is ready
        setTimeout(() => {
          socketRef.current?.emit('input', initialCommand + '\r');
        }, 500);
      }
    });

    socketRef.current.on('connect_error', () => {
      setConnectionStatus('error');
      term.writeln('\x1b[31mFailed to connect to Agent Backend...\x1b[0m');
    });

    socketRef.current.on('output', (data: string) => {
      term.write(data);
    });

    socketRef.current.on('ui-command', (payload: any) => {
      if (onUiCommand) {
        onUiCommand(payload);
      }
    });

    term.onData((data) => {
      socketRef.current?.emit('input', data);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      socketRef.current?.disconnect();
    };
  }, []);

  // Re-fit when window size changes (e.g. dragging might not change size, but specific resize handles would)
  // For now we just have fixed size windows with dragging.

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      defaultPosition={initialPosition}
      onMouseDown={() => onFocus(id)}
    >
      <div ref={nodeRef} style={{ position: 'absolute', zIndex }}>
        <StyledWindow className='window'>
          <WindowHeader className='window-header' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ marginLeft: 4 }}>{title}</span>
            <Button onClick={() => onClose(id)} size='sm' square>
              <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>x</span>
            </Button>
          </WindowHeader>
          <StyledWindowContent>
            <TerminalContainer ref={terminalRef} onMouseDown={(e) => e.stopPropagation()} />
            {isLoading && (
              <LoadingOverlay>
                <Spinner />
                <span>
                  {connectionStatus === 'error' 
                    ? 'Connection failed' 
                    : 'Connecting to Agent Backend...'}
                </span>
              </LoadingOverlay>
            )}
          </StyledWindowContent>
        </StyledWindow>
      </div>
    </Draggable>
  );
};

export default TerminalWindow;
