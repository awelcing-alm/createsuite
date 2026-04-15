import styled from 'styled-components';

export const BackgroundCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  display: block;
`;

export const FallbackBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #0a0a14 0%, #0d1117 40%, #1a1020 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(0, 100, 150, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(150, 50, 100, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(0, 80, 120, 0.08) 0%, transparent 60%);
  }
`;
