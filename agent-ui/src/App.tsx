import React, { useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset, AppBar, Toolbar, Button, MenuList, MenuListItem, Separator } from 'react95';
import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';
import TerminalWindow from './components/TerminalWindow';
import { Monitor, Terminal as TerminalIcon, Cpu } from 'lucide-react';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
  body {
    background-color: #008080; /* Classic Windows Teal */
    margin: 0;
    overflow: hidden;
  }
`;

const Desktop = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const TaskbarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
`;

interface TerminalState {
  id: string;
  title: string;
  zIndex: number;
  position: { x: number; y: number };
  initialCommand?: string;
}

const App: React.FC = () => {
  const [terminals, setTerminals] = useState<TerminalState[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [agentsMenuOpen, setAgentsMenuOpen] = useState(false);
  const [topZIndex, setTopZIndex] = useState(1);

  const spawnTerminal = (title: string = 'OpenCode Terminal', command?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    
    // Offset slightly for cascading effect
    const offset = terminals.length * 20;
    const position = { 
      x: 50 + (offset % 300), 
      y: 50 + (offset % 300) 
    };

    setTerminals([...terminals, {
      id,
      title: `${title} - ${id.substr(0, 4)}`,
      zIndex: newZ,
      position,
      initialCommand: command
    }]);
    setStartMenuOpen(false);
    setAgentsMenuOpen(false);
  };

  const closeTerminal = (id: string) => {
    setTerminals(terminals.filter(t => t.id !== id));
  };

  const focusTerminal = (id: string) => {
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setTerminals(terminals.map(t => t.id === id ? { ...t, zIndex: newZ } : t));
  };

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      <Desktop>
        {terminals.map(term => (
          <TerminalWindow
            key={term.id}
            id={term.id}
            title={term.title}
            zIndex={term.zIndex}
            initialPosition={term.position}
            onClose={closeTerminal}
            onFocus={focusTerminal}
            initialCommand={term.initialCommand}
          />
        ))}

        <TaskbarContainer>
          <AppBar style={{ position: 'static', top: 'auto', bottom: 0 }}>
            <Toolbar style={{ justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button 
                  onClick={() => setStartMenuOpen(!startMenuOpen)} 
                  active={startMenuOpen} 
                  style={{ fontWeight: 'bold' }}
                >
                  <img
                    src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
                    alt="logo"
                    style={{ height: '20px', marginRight: 4 }}
                  />
                  Start
                </Button>
                {startMenuOpen && (
                  <MenuList 
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: '100%',
                      zIndex: 10001
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <MenuListItem onClick={() => setAgentsMenuOpen(!agentsMenuOpen)}>
                      <Cpu size={16} style={{ marginRight: 8 }} />
                      Agents
                      <span style={{ marginLeft: 'auto' }}>▶</span>
                      {agentsMenuOpen && (
                        <MenuList
                          style={{
                            position: 'absolute',
                            left: '100%',
                            bottom: '0',
                            zIndex: 10002
                          }}
                        >
                          <MenuListItem onClick={() => spawnTerminal('Z.ai Agent (GLM 4.7)', 'export OPENCODE_PROVIDER=zai OPENCODE_MODEL=glm-4.7; echo "Starting Z.ai GLM 4.7 Agent..."; opencode')}>
                            <img
                              src="https://win98icons.alexmeub.com/icons/png/network_internet_pcs_installer-0.png"
                              alt="zai"
                              style={{ height: '16px', marginRight: 8 }}
                            />
                            Z.ai GLM 4.7
                          </MenuListItem>
                        </MenuList>
                      )}
                    </MenuListItem>
                    <Separator />
                    <MenuListItem onClick={() => spawnTerminal()}>
                      <TerminalIcon size={16} style={{ marginRight: 8 }} />
                      New Terminal
                    </MenuListItem>
                    <Separator />
                    <MenuListItem disabled>
                      <Monitor size={16} style={{ marginRight: 8 }} />
                      System Monitor
                    </MenuListItem>
                  </MenuList>
                )}
              </div>
              
              {/* Taskbar Items */}
              <div style={{ flex: 1, display: 'flex', marginLeft: 10, overflowX: 'auto' }}>
                 {terminals.map(term => (
                   <Button
                    key={term.id}
                    active={term.zIndex === topZIndex}
                    onClick={() => focusTerminal(term.id)}
                    style={{ marginRight: 4, minWidth: 100, textAlign: 'left', display: 'flex', alignItems: 'center' }}
                   >
                     <img
                        src="https://win98icons.alexmeub.com/icons/png/console_prompt-0.png"
                        alt="term"
                        style={{ height: '16px', marginRight: 4 }}
                      />
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                       {term.title}
                     </span>
                   </Button>
                 ))}
              </div>

              <div style={{ paddingRight: 6 }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Toolbar>
          </AppBar>
        </TaskbarContainer>
      </Desktop>
    </ThemeProvider>
  );
};

export default App;