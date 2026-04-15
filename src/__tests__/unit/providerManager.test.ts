import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ProviderManager, Provider, ProviderConfig } from '../../providerManager';
import * as fs from 'fs';

vi.mock('fs');
vi.mock('inquirer');

describe('ProviderManager', () => {
  const mockProviders: ProviderConfig[] = [
    {
      provider: Provider.CLAUDE,
      enabled: true,
      authenticated: true,
      model: 'anthropic/claude-opus-4.5',
    },
    {
      provider: Provider.MINIMAX,
      enabled: true,
      authenticated: false,
      model: 'minimax/minimax-2.1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadProviders', () => {
    test('returns empty array if config not found', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const manager = new ProviderManager('/tmp/test-workspace');
      const providers = await manager.loadProviders();

      expect(providers).toEqual([]);
    });

    test('loads providers from config file', async () => {
      const configData = {
        providers: mockProviders,
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(configData));

      const manager = new ProviderManager('/tmp/test-workspace');
      const providers = await manager.loadProviders();

      expect(providers).toEqual(mockProviders);
    });

    test('returns empty array on parse error', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('invalid json');

      const manager = new ProviderManager('/tmp/test-workspace');
      const providers = await manager.loadProviders();

      expect(providers).toEqual([]);
    });
  });

  describe('saveProviders', () => {
    test('creates directory if not exists', async () => {
      vi.spyOn(fs, 'existsSync')
        .mockReturnValueOnce(false) // configDir check
        .mockReturnValueOnce(false); // file exists check
      vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined);
      vi.spyOn(fs, 'writeFileSync').mockReturnValue(undefined);

      const manager = new ProviderManager('/tmp/test-workspace');
      await manager.saveProviders(mockProviders);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('writes config file', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'writeFileSync').mockReturnValue(undefined);

      const manager = new ProviderManager('/tmp/test-workspace');
      await manager.saveProviders(mockProviders);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/tmp/test-workspace/.createsuite/providers.json',
        expect.stringContaining('"providers"')
      );
    });
  });

  describe('validateProvider', () => {
    test('returns true for authenticated provider', async () => {
      const configData = { providers: mockProviders };
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(configData));

      const manager = new ProviderManager('/tmp/test-workspace');
      const result = await manager.validateProvider(Provider.CLAUDE);

      expect(result).toBe(true);
    });

    test('returns false for non-authenticated provider', async () => {
      const configData = { providers: mockProviders };
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(configData));

      const manager = new ProviderManager('/tmp/test-workspace');
      const result = await manager.validateProvider(Provider.MINIMAX);

      expect(result).toBe(false);
    });

    test('returns false for non-existent provider', async () => {
      const configData = { providers: mockProviders };
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(configData));

      const manager = new ProviderManager('/tmp/test-workspace');
      const result = await manager.validateProvider(Provider.GEMINI);

      expect(result).toBe(false);
    });
  });

});
