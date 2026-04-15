import { Socket, Channel } from 'phoenix';

export class TerminalChannel {
  private socket: Socket;
  private channel: Channel | null = null;
  private sessionId: string;
  
  public onOutput?: (data: string) => void;
  public onExit?: () => void;
  public onConnect?: () => void;
  public onError?: () => void;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.socket = new Socket('/socket');
  }

  public join(cols: number, rows: number): void {
    this.socket.connect();
    
    // Support the terminal session topic
    this.channel = this.socket.channel(`terminal:${this.sessionId}`, { cols, rows });
    
    this.channel.on('output', (payload: { data: string } | string) => {
      if (this.onOutput) {
        // Handle both raw strings or typical Phoenix JSON payloads
        const outputData = typeof payload === 'string' ? payload : payload.data;
        this.onOutput(outputData);
      }
    });

    this.channel.on('exit', () => {
      if (this.onExit) {
        this.onExit();
      }
    });

    this.channel.join()
      .receive('ok', () => {
        if (this.onConnect) this.onConnect();
      })
      .receive('error', () => {
        if (this.onError) this.onError();
      })
      .receive('timeout', () => {
        if (this.onError) this.onError();
      });

    this.socket.onError(() => {
      if (this.onError) this.onError();
    });
  }

  public sendInput(data: string): void {
    if (this.channel) {
      this.channel.push('input', { data });
    }
  }

  public resize(cols: number, rows: number): void {
    if (this.channel) {
      this.channel.push('resize', { cols, rows });
    }
  }

  public leave(): void {
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
    }
    this.socket.disconnect();
  }
}
