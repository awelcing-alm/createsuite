import React from 'react';
import { AbsoluteFill } from 'remotion';

export const AgentUIScene: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#008080'}}> {/* Fallback background */}
       <iframe
          src="http://localhost:3001?demo=true"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Agent UI"
        />
    </AbsoluteFill>
  );
};