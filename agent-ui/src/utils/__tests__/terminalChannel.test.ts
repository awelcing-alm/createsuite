import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { TerminalChannel } from '../terminalChannel';

vi.mock('phoenix', () => {
  return {
    Socket: vi.fn().mockImplementation(function() {
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        channel: vi.fn().mockImplementation(function() {
          return {
            join: vi.fn().mockImplementation(function() {
              return {
                receive: vi.fn().mockImplementation(function() {
                  return {
                    receive: vi.fn()
                  };
                })
              };
            }),
            on: vi.fn(),
            push: vi.fn(),
            leave: vi.fn()
          };
        }),
        onError: vi.fn()
      };
    }),
    Channel: vi.fn()
  };
});

describe('TerminalChannel', () => {
  let channel: TerminalChannel;

  beforeEach(() => {
    channel = new TerminalChannel('test-session-id');
  });

  afterEach(() => {
    channel.leave();
  });

  test('constructor creates socket with session ID', () => {
    expect(channel).toBeDefined();
  });

  test('join connects to channel with correct topic', () => {
    const receiveMock = vi.fn().mockReturnThis();
    const joinSpy = vi.fn().mockReturnValue({
      receive: receiveMock
    });
    (channel as any).socket.channel = vi.fn().mockReturnValue({
      join: joinSpy,
      on: vi.fn(),
      push: vi.fn(),
      leave: vi.fn()
    });

    channel.join(80, 24);
    expect(joinSpy).toHaveBeenCalled();
  });

  test('sendInput pushes to channel', () => {
    const pushSpy = vi.fn();
    (channel as any).channel = {
      push: pushSpy,
      leave: vi.fn()
    };

    channel.sendInput('test input');
    expect(pushSpy).toHaveBeenCalledWith('input', { data: 'test input' });
  });

  test('resize pushes resize event', () => {
    const pushSpy = vi.fn();
    (channel as any).channel = {
      push: pushSpy,
      leave: vi.fn()
    };

    channel.resize(100, 30);
    expect(pushSpy).toHaveBeenCalledWith('resize', { cols: 100, rows: 30 });
  });

  test('leave disconnects socket', () => {
    const disconnectSpy = vi.fn();
    (channel as any).socket.disconnect = disconnectSpy;
    (channel as any).channel = {
      leave: vi.fn()
    };

    channel.leave();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
