import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import BackgroundEvaluationLab from './components/BackgroundEvaluationLab';
import { macosTheme } from './theme/macos';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${macosTheme.fonts.system};
    background: ${macosTheme.colors.desktopBg};
    margin: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  input, select, textarea, button {
    font-family: ${macosTheme.fonts.system};
  }

  ::selection {
    background: ${macosTheme.colors.accent};
    color: white;
  }
`;

const AppFrame = styled.div`
  width: 100vw;
  height: 100vh;
`;

const BackgroundEvaluationApp: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <AppFrame>
        <BackgroundEvaluationLab />
      </AppFrame>
    </>
  );
};

export default BackgroundEvaluationApp;
