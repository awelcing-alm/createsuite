import { createRoot } from 'react-dom/client';

async function bootstrap() {
  const path = window.location.pathname;
  const module = path === '/background-lab' || path === '/background-lab/'
    ? await import('./BackgroundEvaluationApp.tsx')
    : await import('./App.tsx');

  const RootComponent = module.default;

  createRoot(document.getElementById('root')!).render(<RootComponent />);
}

bootstrap();
