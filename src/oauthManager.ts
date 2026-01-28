import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { OAuthConfig } from './types';

/**
 * Token data structure for OAuth storage
 */
interface TokenData {
  accessToken: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * OAuth integration for coding plan authentication
 */
export class OAuthManager {
  private workspaceRoot: string;
  private tokenPath: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.tokenPath = path.join(workspaceRoot, '.createsuite', 'oauth-token.json');
  }

  /**
   * Check if OAuth token exists and is valid
   */
  async hasValidToken(): Promise<boolean> {
    try {
      await fsp.access(this.tokenPath);
    } catch {
      return false;
    }

    try {
      const data = await fsp.readFile(this.tokenPath, 'utf-8');
      const tokenData = JSON.parse(data);
      
      // Check if token is expired (simple check)
      if (tokenData.expiresAt) {
        const expiresAt = new Date(tokenData.expiresAt);
        if (expiresAt < new Date()) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get stored OAuth token
   */
  async getToken(): Promise<string | null> {
    try {
      await fsp.access(this.tokenPath);
    } catch {
      return null;
    }

    try {
      const data = await fsp.readFile(this.tokenPath, 'utf-8');
      const tokenData = JSON.parse(data);
      return tokenData.accessToken || null;
    } catch {
      return null;
    }
  }

  /**
   * Store OAuth token
   */
  async storeToken(accessToken: string, expiresIn?: number): Promise<void> {
    const tokenData: TokenData = {
      accessToken,
      createdAt: new Date().toISOString()
    };

    if (expiresIn) {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      tokenData.expiresAt = expiresAt.toISOString();
    }

    const tokenDir = path.dirname(this.tokenPath);
    try {
      await fsp.access(tokenDir);
    } catch {
      await fsp.mkdir(tokenDir, { recursive: true });
    }

    await fsp.writeFile(this.tokenPath, JSON.stringify(tokenData, null, 2), {
      mode: 0o600 // Restrict permissions
    });
  }

  /**
   * Clear stored token
   */
  async clearToken(): Promise<void> {
    try {
      await fsp.access(this.tokenPath);
      await fsp.unlink(this.tokenPath);
    } catch {
      // Token doesn't exist, nothing to clear
    }
  }

  /**
   * Initialize OAuth flow (placeholder)
   * In production, this would open browser for OAuth flow
   * 
   * WARNING: This is a development placeholder. In production:
   * - Implement proper OAuth 2.0 flow with PKCE
   * - Use a secure callback server
   * - Validate state parameter
   * - Exchange authorization code for real access token
   */
  async initializeOAuth(config: OAuthConfig): Promise<void> {
    console.log('⚠️  DEVELOPMENT MODE: OAuth Flow Placeholder');
    console.log('Scopes:', config.scopes.join(', '));
    console.log('\nIn production, this would:');
    console.log('1. Open browser to authorization URL');
    console.log('2. Handle callback with authorization code');
    console.log('3. Exchange code for access token');
    console.log('4. Store token securely');
    
    // Development placeholder - DO NOT use in production
    // Store a marker token to indicate OAuth was initiated
    await this.storeToken('dev_placeholder_token', 3600);
    console.log('\n✓ Development placeholder token stored');
  }

  /**
   * Get OAuth config
   */
  getOAuthConfig(): OAuthConfig {
    return {
      scopes: ['repo', 'workflow', 'read:org'],
      clientId: process.env.OAUTH_CLIENT_ID
    };
  }
}
