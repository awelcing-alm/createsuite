import * as http from 'http';
import * as url from 'url';
import * as crypto from 'crypto';
import chalk from 'chalk';
import { spawn } from 'child_process';

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

export interface LocalhostOAuthOptions {
  clientId?: string;
  clientSecret?: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri?: string;
  scope?: string;
  port?: number;
}

/**
 * Localhost OAuth flow for secure authentication
 * Implements OAuth 2.0 with PKCE for enhanced security
 */
export class LocalhostOAuth {
  private server: http.Server | null = null;
  private port: number;
  private redirectUri: string;

  constructor(port: number = 3000) {
    this.port = port;
    this.redirectUri = `http://localhost:${port}/callback`;
  }

  /**
   * Generate PKCE challenge
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Start OAuth flow with localhost callback server
   */
  async startFlow(options: LocalhostOAuthOptions): Promise<OAuthTokenResponse> {
    const state = this.generateState();
    const { codeVerifier, codeChallenge } = this.generatePKCE();

    return new Promise((resolve, reject) => {
      // Create callback server
      this.server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url || '', true);

        if (parsedUrl.pathname === '/callback') {
          const { code, state: returnedState, error } = parsedUrl.query;

          // Handle OAuth errors
          if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Authentication Failed</title>
                  <style>
                    body { font-family: system-ui; padding: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                  </style>
                </head>
                <body>
                  <h1 class="error">❌ Authentication Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            this.cleanup();
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          // Verify state to prevent CSRF
          if (returnedState !== state) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Security Error</title>
                  <style>
                    body { font-family: system-ui; padding: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                  </style>
                </head>
                <body>
                  <h1 class="error">🔒 Security Error</h1>
                  <p>State parameter mismatch. Possible CSRF attack.</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            this.cleanup();
            reject(new Error('State parameter mismatch'));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Authentication Error</title>
                  <style>
                    body { font-family: system-ui; padding: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                  </style>
                </head>
                <body>
                  <h1 class="error">❌ No authorization code received</h1>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            this.cleanup();
            reject(new Error('No authorization code received'));
            return;
          }

          try {
            // Exchange code for token
            const tokenResponse = await this.exchangeCodeForToken(
              code as string,
              codeVerifier,
              options
            );

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Authentication Successful</title>
                  <style>
                    body { font-family: system-ui; padding: 40px; text-align: center; }
                    .success { color: #2e7d32; }
                  </style>
                </head>
                <body>
                  <h1 class="success">✅ Authentication Successful!</h1>
                  <p>You can close this window and return to the terminal.</p>
                </body>
              </html>
            `);

            this.cleanup();
            resolve(tokenResponse);
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Token Exchange Failed</title>
                  <style>
                    body { font-family: system-ui; padding: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                  </style>
                </head>
                <body>
                  <h1 class="error">❌ Token Exchange Failed</h1>
                  <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            this.cleanup();
            reject(error);
          }
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      // Start server
      this.server.listen(this.port, () => {
        console.log(chalk.blue(`\n🌐 OAuth server started on http://localhost:${this.port}`));
        
        // Build authorization URL
        const authUrl = new URL(options.authorizationUrl);
        authUrl.searchParams.set('response_type', 'code');
        if (options.clientId) {
          authUrl.searchParams.set('client_id', options.clientId);
        }
        authUrl.searchParams.set('redirect_uri', options.redirectUri || this.redirectUri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        if (options.scope) {
          authUrl.searchParams.set('scope', options.scope);
        }

        const authUrlString = authUrl.toString();
        
        console.log(chalk.yellow('\n🔐 Opening browser for authentication...'));
        console.log(chalk.gray(`If the browser doesn't open, visit:\n${authUrlString}\n`));

        // Open browser
        this.openBrowser(authUrlString);
      });

      // Handle server errors
      this.server.on('error', (err) => {
        console.error(chalk.red('Server error:'), err);
        this.cleanup();
        reject(err);
      });
    });
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    options: LocalhostOAuthOptions
  ): Promise<OAuthTokenResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', options.redirectUri || this.redirectUri);
    body.set('code_verifier', codeVerifier);
    
    if (options.clientId) {
      body.set('client_id', options.clientId);
    }
    if (options.clientSecret) {
      body.set('client_secret', options.clientSecret);
    }

    const response = await fetch(options.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data as OAuthTokenResponse;
  }

  /**
   * API key flow for simpler authentication
   */
  async apiKeyFlow(apiKey: string): Promise<{ apiKey: string }> {
    console.log(chalk.green('✓ API key configured'));
    return { apiKey };
  }

  /**
   * Open browser for OAuth flow
   */
  private openBrowser(url: string): void {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = 'open';
    } else if (platform === 'win32') {
      command = 'start';
    } else {
      // Linux/Unix - try xdg-open, then fallback to common browsers
      command = 'xdg-open';
    }

    try {
      spawn(command, [url], { 
        detached: true,
        stdio: 'ignore'
      }).unref();
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not open browser automatically'));
      console.log(chalk.gray(`Please open this URL manually:\n${url}`));
    }
  }

  /**
   * Cleanup server
   */
  private cleanup(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
