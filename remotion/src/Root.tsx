import React from 'react';
import {Composition} from 'remotion';
import {CreateSuiteTour} from './CreateSuiteTour';
import {AgentUITour} from './AgentUITour';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CreateSuiteTour"
        component={CreateSuiteTour}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="AgentUITour"
        component={AgentUITour}
        durationInFrames={660}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
