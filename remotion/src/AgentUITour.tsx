import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';

const COLORS = {
  win95Teal: '#008080',
  win95Gray: '#c0c0c0',
  win95Blue: '#000080',
  win95White: '#ffffff',
  win95Black: '#000000',
};

const FONT_FAMILY = 'Tahoma, Geneva, sans-serif';

const Win95Window: React.FC<{
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ title, x, y, width, height, children }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      fontFamily: FONT_FAMILY,
      fontSize: 14,
    }}
  >
    <div
      style={{
        backgroundColor: COLORS.win95Gray,
        borderLeft: '3px solid #fff',
        borderTop: '3px solid #fff',
        borderRight: '3px solid #404040',
        borderBottom: '3px solid #404040',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.win95Blue,
          color: COLORS.win95White,
          padding: '4px 8px',
          fontWeight: 'bold',
        }}
      >
        {title}
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: COLORS.win95White,
          borderLeft: '3px solid #404040',
          borderTop: '3px solid #404040',
          borderRight: '3px solid #fff',
          borderBottom: '3px solid #fff',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const TerminalWindow: React.FC<{
  title: string;
  x: number;
  y: number;
  commands: string[];
}> = ({ title, x, y, commands }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 600,
      height: 400,
      fontFamily: 'Courier New, monospace',
      fontSize: 14,
    }}
  >
    <div
      style={{
        backgroundColor: COLORS.win95Gray,
        borderLeft: '3px solid #fff',
        borderTop: '3px solid #fff',
        borderRight: '3px solid #404040',
        borderBottom: '3px solid #404040',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.win95Blue,
          color: COLORS.win95White,
          padding: '4px 8px',
          fontWeight: 'bold',
          fontSize: 14,
        }}
      >
        💻 {title}
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: '#000',
          color: '#0f0',
          padding: 12,
          lineHeight: 1.8,
          borderLeft: '3px solid #404040',
          borderTop: '3px solid #404040',
          borderRight: '3px solid #fff',
          borderBottom: '3px solid #fff',
        }}
      >
        {commands.map((cmd, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{ color: '#0ff' }}>$</span> {cmd}
          </div>
        ))}
        <span style={{ animation: 'blink 1s infinite' }}>_</span>
        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  </div>
);

const TitleScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.win95Teal }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          color: COLORS.win95White,
          textShadow: '4px 4px 0px #000',
          marginBottom: 30,
          fontFamily: FONT_FAMILY,
        }}
      >
        Agent UI
      </div>
      <div
        style={{
          fontSize: 32,
          color: COLORS.win95Black,
          backgroundColor: COLORS.win95Gray,
          padding: '16px 32px',
          borderLeft: '3px solid #fff',
          borderTop: '3px solid #fff',
          borderRight: '3px solid #000',
          borderBottom: '3px solid #000',
          fontFamily: FONT_FAMILY,
          fontWeight: 'bold',
        }}
      >
        The Command Center
      </div>
    </div>
  </AbsoluteFill>
);

const MenuScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.win95Teal }}>
    <Win95Window title="Start Menu" x={660} y={200} width={600} height={400}>
      <div style={{ fontSize: 24, lineHeight: 2.5, textAlign: 'left' }}>
        <div style={{ marginBottom: 12 }}>💻 Z.ai GLM 4.7</div>
        <div style={{ marginBottom: 12 }}>🎨 Asset Generator (HF)</div>
        <div style={{ marginBottom: 12 }}>🧠 Sisyphus (Claude)</div>
        <div style={{ marginBottom: 12 }}>🔮 Oracle (OpenAI)</div>
        <div style={{ borderTop: '2px solid #404040', marginTop: 20, paddingTop: 20 }}>
          🎯 Convoy Delivery Test
        </div>
      </div>
    </Win95Window>
  </AbsoluteFill>
);

const SpawningScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.win95Teal }}>
    <TerminalWindow
      title="Z.ai Agent (GLM 4.7)"
      x={50}
      y={100}
      commands={[
        'export OPENCODE_PROVIDER=zai-coding-plan',
        'export OPENCODE_MODEL=glm-4.7',
        'echo "Starting Z.ai Agent..."',
        'opencode',
      ]}
    />
    <TerminalWindow
      title="Asset Generator (HF)"
      x={1270}
      y={100}
      commands={[
        'export OPENCODE_PROVIDER=huggingface',
        'export OPENCODE_MODEL=stable-diffusion',
        'echo "Starting Asset Generator..."',
        'opencode',
      ]}
    />
    <TerminalWindow
      title="Sisyphus (Claude)"
      x={50}
      y={550}
      commands={[
        'export OPENCODE_PROVIDER=anthropic',
        'export OPENCODE_MODEL=claude-opus-4.5',
        'echo "Starting Sisyphus..."',
        'opencode',
      ]}
    />
    <TerminalWindow
      title="Oracle (OpenAI)"
      x={1270}
      y={550}
      commands={[
        'export OPENCODE_PROVIDER=openai',
        'export OPENCODE_MODEL=gpt-5.2',
        'echo "Starting Oracle..."',
        'opencode',
      ]}
    />
  </AbsoluteFill>
);

const FeaturesScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.win95Teal }}>
    <Win95Window title="Features" x={260} y={80} width={1400} height={500}>
      <div style={{ fontSize: 28, lineHeight: 2, textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>🤖 Multiple AI Providers</div>
        <div style={{ marginBottom: 16 }}>🪟 Draggable Windows</div>
        <div style={{ marginBottom: 16 }}>🎯 Windows 95 Taskbar</div>
        <div style={{ marginBottom: 16 }}>📦 Spawning 4 Agents</div>
        <div style={{ marginBottom: 16 }}>🖥️ Real xterm.js Terminals</div>
        <div>🎨 Content Windows</div>
      </div>
    </Win95Window>
  </AbsoluteFill>
);

const CallToActionScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.win95Teal }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.win95White,
          textShadow: '4px 4px 0px #000',
          marginBottom: 40,
          fontFamily: FONT_FAMILY,
        }}
      >
        Get Started Today
      </div>
      <div
        style={{
          fontSize: 28,
          color: COLORS.win95Black,
          backgroundColor: COLORS.win95Gray,
          padding: '20px 40px',
          borderLeft: '3px solid #fff',
          borderTop: '3px solid #fff',
          borderRight: '3px solid #000',
          borderBottom: '3px solid #000',
          fontFamily: 'Courier New',
          fontWeight: 'bold',
        }}
      >
        cd agent-ui & npm run dev
      </div>
    </div>
  </AbsoluteFill>
);

export const AgentUITour: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={120}>
      <TitleScene />
    </Sequence>

    <Sequence from={120} durationInFrames={120}>
      <MenuScene />
    </Sequence>

    <Sequence from={240} durationInFrames={180}>
      <SpawningScene />
    </Sequence>

    <Sequence from={420} durationInFrames={120}>
      <FeaturesScene />
    </Sequence>

    <Sequence from={540} durationInFrames={120}>
      <CallToActionScene />
    </Sequence>
  </>
);
