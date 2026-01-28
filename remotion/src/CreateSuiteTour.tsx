import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  random,
  Img,
  staticFile,
} from 'remotion';

// --- SASSY CONSTANTS ---

const COLORS = {
  hotPink: '#FF00CC',
  electricBlue: '#3333FF',
  neonGreen: '#00FF66',
  void: '#000000',
  pureWhite: '#FFFFFF',
  warning: '#FFCC00',
};

const FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// --- ANIMATED BACKGROUND ---

const SassyBackground: React.FC<{
  primaryColor: string;
  secondaryColor: string;
}> = ({primaryColor, secondaryColor}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Create a moving gradient background
  const gradientOffset = (frame * 5) % (width * 2);
  
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite', // CSS animation simulation via manual updates if needed, but linear-gradient shift is easier
        transform: `translate(${-gradientOffset / 10}px, 0)`, // Subtle movement
        width: '150%', // clear edges
        height: '100%',
      }}
    >
       <AbsoluteFill style={{
         background: `radial-gradient(circle at center, transparent 0%, ${COLORS.void} 120%)`,
         opacity: 0.7
       }} />
    </AbsoluteFill>
  );
};

// --- COMPONENTS ---

const BigText: React.FC<{children: React.ReactNode; color?: string; delay?: number}> = ({children, color = COLORS.pureWhite, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 100},
  });

  const rotate = interpolate(enter, [0, 1], [10, 0]);
  const scale = interpolate(enter, [0, 1], [0.5, 1]);

  return (
    <h1
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize: 140,
        color: color,
        textAlign: 'center',
        margin: 0,
        lineHeight: 0.9,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        textShadow: '10px 10px 0px rgba(0,0,0,0.5)',
        letterSpacing: '-5px',
        opacity: enter
      }}
    >
      {children}
    </h1>
  );
};

const SubText: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 20},
  });

  const y = interpolate(enter, [0, 1], [100, 0]);

  return (
    <p
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 50,
        color: COLORS.pureWhite,
        textAlign: 'center',
        marginTop: 40,
        maxWidth: '80%',
        transform: `translateY(${y}px)`,
        opacity: enter,
        background: COLORS.void,
        padding: '10px 40px',
        borderRadius: 50,
        display: 'inline-block'
      }}
    >
      {children}
    </p>
  );
};

// --- SCENES ---

const TitleScene: React.FC = () => {
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <SassyBackground primaryColor={COLORS.hotPink} secondaryColor={COLORS.electricBlue} />
      <div style={{zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <BigText>CREATESUITE</BigText>
        <SubText delay={10}>Stop coding like it's 2015.</SubText>
      </div>
    </AbsoluteFill>
  );
};

const AgentsScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <AgentUIScene />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none'}}>
        <BigText color={COLORS.neonGreen}>ACTUAL<br/>WORKERS</BigText>
        <div style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px 40px',
            borderRadius: 50,
            marginTop: 40,
            display: 'inline-block'
        }}>
            <SubText delay={15}>Unlike your last intern, they have their own desktop.</SubText>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GitScene: React.FC = () => {
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <SassyBackground primaryColor={COLORS.electricBlue} secondaryColor={COLORS.hotPink} />
      <div style={{zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 200, marginBottom: 20}}>🔥</div>
        <BigText color={COLORS.warning}>GIT-BACKED<br/>DRAMA</BigText>
        <SubText delay={15}>Everything is tracked. We saw what you broke.</SubText>
      </div>
    </AbsoluteFill>
  );
};

// --- TERMINAL COMPONENT ---

const TerminalBox: React.FC<{
  title: string;
  color: string;
  lines: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  delay?: number;
}> = ({title, color, lines, x, y, width = 600, height = 400, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  
  // Pop in effect
  const scale = spring({
    frame: frame - delay,
    fps,
    config: {damping: 15, stiffness: 120}
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: COLORS.void,
        border: `4px solid ${color}`,
        borderRadius: 10,
        overflow: 'hidden',
        transform: `scale(${scale})`,
        opacity: scale,
        boxShadow: `10px 10px 0px ${color}40`,
        fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div style={{
        background: color,
        color: COLORS.void,
        padding: '5px 10px',
        fontWeight: 'bold',
        fontSize: 24,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>{title}</span>
        <span>_</span>
      </div>
      
      {/* Content */}
      <div style={{padding: 15, color: color, fontSize: 20}}>
        {lines.map((line, i) => {
          const lineDelay = delay + (i * 10) + 10;
          const show = frame > lineDelay;
          return (
            <div key={i} style={{opacity: show ? 1 : 0, marginBottom: 5}}>
              {line}
            </div>
          );
        })}
        {(frame - delay) % 20 < 10 && <div style={{display: 'inline-block', width: 15, height: 25, background: color}} />}
      </div>
    </div>
  );
};

const ConvoyCoordinatedScene: React.FC = () => {
    const {width, height} = useVideoConfig();
    
    // Layout logic similar to agent-ui
    // 1920x1080 canvas
    // Terminals: ~800x450 to fit 4 nicely with gaps
    const termW = 800;
    const termH = 450;
    const gap = 60;
    const startX = (width - (termW * 2 + gap)) / 2;
    const startY = (height - (termH * 2 + gap)) / 2;

    return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <SassyBackground primaryColor={COLORS.void} secondaryColor={'#222'} />
      
      <AbsoluteFill>
        {/* Title overlay */}
        <div style={{
            position: 'absolute', 
            top: 50, 
            width: '100%', 
            textAlign: 'center', 
            zIndex: 10
        }}>
            <h1 style={{
                color: COLORS.hotPink, 
                fontFamily: FONT_FAMILY, 
                fontSize: 80, 
                margin: 0,
                textShadow: '5px 5px 0px #FFF'
            }}>CONVOY MODE: ACTIVATED</h1>
        </div>

        {/* Top Left: Z.ai */}
        <TerminalBox 
          title="Z.ai (Librarian)" 
          color={COLORS.electricBlue}
          x={startX} 
          y={startY}
          width={termW}
          height={termH}
          delay={5}
          lines={[
            "> Searching docs for 'Remotion'...",
            "> Found 142 matches in src/",
            "> Indexing complete.",
            "> Context prepared for Sisyphus."
          ]}
        />

        {/* Top Right: Hugging Face */}
        <TerminalBox 
          title="Hugging Face (Assets)" 
          color={COLORS.hotPink}
          x={startX + termW + gap} 
          y={startY}
          width={termW}
          height={termH}
          delay={15}
          lines={[
             "> Generating assets...",
             "> Style: Cyberpunk Sassy",
             "> Rendering background.png... [OK]",
             "> Rendering icon.svg... [OK]"
          ]}
        />

        {/* Bottom Left: Claude */}
        <TerminalBox 
          title="Claude (Sisyphus)" 
          color={COLORS.neonGreen}
          x={startX} 
          y={startY + termH + gap}
          width={termW}
          height={termH}
          delay={25}
          lines={[
            "> Received context from Librarian.",
            "> Analyzing asset requirements...",
            "> Delegating to Oracle for review...",
            "> Plan executing: 98% complete."
          ]}
        />

        {/* Bottom Right: OpenAI */}
        <TerminalBox 
          title="OpenAI (Oracle)" 
          color={COLORS.warning}
          x={startX + termW + gap} 
          y={startY + termH + gap}
          width={termW}
          height={termH}
          delay={35}
          lines={[
             "> Reviewing architecture...",
             "> Optimization vector found.",
             "> Debugging race condition...",
             "> All systems nominal."
          ]}
        />

      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CLIScene: React.FC = () => {
    const frame = useCurrentFrame();
    const lines = [
        "> cs init --fancy",
        "> cs agent hire --sassy",
        "> cs convoy dispatch",
        "> ...profit?"
    ];

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.void, padding: 100, fontFamily: 'monospace'}}>
      <h2 style={{color: COLORS.neonGreen, fontSize: 80, margin: 0, marginBottom: 60}}>THE CLI:</h2>
      {lines.map((line, i) => {
          const delay = i * 20;
          const show = frame > delay;
          return (
              <div key={i} style={{
                  color: COLORS.pureWhite, 
                  fontSize: 60, 
                  marginBottom: 30,
                  opacity: show ? 1 : 0,
                  transform: `translateX(${show ? 0 : -50}px)`,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                  {line}
              </div>
          )
      })}
    </AbsoluteFill>
  );
};

const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const scale = spring({frame, fps, config: {stiffness: 200, damping: 10}});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.hotPink}}>
      <div style={{transform: `scale(${scale})`, textAlign: 'center'}}>
        <BigText color={COLORS.pureWhite}>INSTALL IT.</BigText>
        <div style={{
            marginTop: 60,
            background: COLORS.void,
            color: COLORS.neonGreen,
            padding: '30px 80px',
            fontSize: 60,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            borderRadius: 20,
            boxShadow: '20px 20px 0px rgba(0,0,0,0.3)'
        }}>
            npm install createsuite
        </div>
        <p style={{color: COLORS.pureWhite, fontSize: 30, marginTop: 40, fontWeight: 'bold'}}>
            Do it. I'll wait.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// --- MAIN COMPOSITION ---

const SCENE_DURATION = 90; // 3 seconds - keep it snappy!

export const CreateSuiteTour: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.void}}>
      <Sequence from={0} durationInFrames={SCENE_DURATION}>
        <TitleScene />
      </Sequence>
      
      <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
        <AgentsScene />
      </Sequence>
      
      <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
        <GitScene />
      </Sequence>
      
      <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
        <ConvoyCoordinatedScene />
      </Sequence>

       <Sequence from={SCENE_DURATION * 4} durationInFrames={SCENE_DURATION}>
        <CLIScene />
      </Sequence>

      <Sequence from={SCENE_DURATION * 5} durationInFrames={SCENE_DURATION}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};