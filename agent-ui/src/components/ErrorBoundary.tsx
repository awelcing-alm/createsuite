import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #c0c0c0;
  min-height: 200px;
  color: #000;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #8b0000;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleDismiss = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Window style={{ width: 400, position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
          <WindowHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Error</span>
            <Button onClick={this.handleDismiss} size='sm' square>
              <span style={{ fontWeight: 'bold' }}>x</span>
            </Button>
          </WindowHeader>
          <WindowContent>
            <ErrorContainer>
              <ErrorTitle>Something went wrong</ErrorTitle>
              <ErrorMessage>
                {this.state.error?.message || 'An unexpected error occurred'}
              </ErrorMessage>
              <ButtonGroup>
                <Button onClick={this.handleReload}>Reload</Button>
                <Button onClick={this.handleDismiss}>Dismiss</Button>
              </ButtonGroup>
            </ErrorContainer>
          </WindowContent>
        </Window>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
