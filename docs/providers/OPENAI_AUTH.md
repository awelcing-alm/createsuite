# OpenAI Authentication Guide

## Overview

CreateSuite now supports secure localhost-based authentication for OpenAI, with two methods:

1. **API Key Method** (Recommended) - Simple and direct
2. **OAuth Flow** (Browser-based) - For advanced use cases

## Quick Start

### Method 1: API Key (Recommended)

```bash
# Run provider setup
cs provider setup

# When prompted for OpenAI:
# 1. Select "API Key (Recommended)"
# 2. Get your key from: https://platform.openai.com/api-keys
# 3. Paste your API key (starts with "sk-")
# 4. Confirm to save securely
```

Your API key is stored locally in `.createsuite/openai-credentials.json` with restricted permissions (0600).

### Method 2: OAuth Flow

```bash
# Run provider setup
cs provider setup

# When prompted for OpenAI:
# 1. Select "OAuth Flow (Browser)"
# 2. Browser will open automatically
# 3. Complete authentication
# 4. Return to terminal
```

**Note:** OpenAI primarily uses API keys for authentication. The OAuth flow is provided for consistency but will fall back to API key method.

## Security Features

### 🔒 Secure Storage
- API keys stored with `0600` permissions (owner read/write only)
- Credentials never logged or displayed
- Git-ignored by default

### 🔐 PKCE Protection
- OAuth flow uses PKCE (Proof Key for Code Exchange)
- SHA-256 code challenge prevents interception attacks
- State parameter prevents CSRF attacks

### 🌐 Localhost OAuth
- OAuth callback runs on `localhost:3000`
- No external servers involved
- Automatic browser opening with fallback URL display

## Credential Storage

Credentials are stored in your workspace at:

```
.createsuite/
├── openai-credentials.json    # API keys (git-ignored)
├── providers.json              # Provider configs (git-ignored)
└── oauth-token.json            # OAuth tokens (git-ignored)
```

**Security Best Practices:**
- ✅ Never commit credentials to git (already in `.gitignore`)
- ✅ Use workspace-specific credentials
- ✅ Rotate API keys regularly
- ✅ Review permissions before sharing workspace

## Testing Your Setup

After authentication, test your OpenAI connection:

```bash
# List configured providers
cs provider list

# You should see:
# OpenAI GPT-5.2
#   Model: openai/gpt-5.2
#   Status: ✓ Authenticated
#   Last validated: [timestamp]
```

## Troubleshooting

### API Key Not Accepted

**Problem:** "API key is invalid" error

**Solutions:**
1. Verify your API key starts with `sk-`
2. Check key is active at https://platform.openai.com/api-keys
3. Ensure you have sufficient API credits
4. Re-run authentication: `cs provider auth`

### OAuth Port Already in Use

**Problem:** "Port 3000 is already in use"

**Solutions:**
1. Close application using port 3000
2. Use a different port (edit `localhostOAuth.ts`)
3. Wait a moment and try again

### Browser Doesn't Open

**Problem:** Browser doesn't open automatically

**Solutions:**
1. Manually copy the URL shown in terminal
2. Paste into your browser
3. Complete authentication
4. Return to terminal

### Permission Denied

**Problem:** "Permission denied" when saving credentials

**Solutions:**
1. Check `.createsuite/` directory exists
2. Verify write permissions: `ls -la .createsuite/`
3. Create directory if missing: `mkdir -p .createsuite`

## Advanced Usage

### Programmatic Authentication

```typescript
import { LocalhostOAuth, ProviderManager } from 'createsuite';

// API Key method
const providerManager = new ProviderManager('/path/to/workspace');
await providerManager.setupProviders();

// OAuth method (for other providers)
const oauth = new LocalhostOAuth(3000);
const tokens = await oauth.startFlow({
  clientId: 'your-client-id',
  authorizationUrl: 'https://provider.com/oauth/authorize',
  tokenUrl: 'https://provider.com/oauth/token',
  scope: 'openid profile email'
});
```

### Custom OAuth Configuration

```typescript
const oauth = new LocalhostOAuth(3001); // Custom port

const tokens = await oauth.startFlow({
  clientId: 'client-id',
  clientSecret: 'client-secret',  // Optional
  authorizationUrl: 'https://auth.example.com/authorize',
  tokenUrl: 'https://auth.example.com/token',
  redirectUri: 'http://localhost:3001/callback',
  scope: 'read write',
  port: 3001
});
```

### Clearing Credentials

```bash
# Remove OpenAI credentials
rm .createsuite/openai-credentials.json

# Re-authenticate
cs provider auth
```

## API Reference

### LocalhostOAuth

#### `constructor(port?: number)`
Creates a new OAuth handler with optional port (default: 3000).

#### `startFlow(options: LocalhostOAuthOptions): Promise<OAuthTokenResponse>`
Starts OAuth flow with localhost callback server.

**Options:**
- `authorizationUrl` (required): OAuth authorization endpoint
- `tokenUrl` (required): Token exchange endpoint
- `clientId` (optional): OAuth client ID
- `clientSecret` (optional): OAuth client secret
- `redirectUri` (optional): Callback URI (default: http://localhost:{port}/callback)
- `scope` (optional): OAuth scopes
- `port` (optional): Server port

**Returns:**
```typescript
{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}
```

#### `apiKeyFlow(apiKey: string): Promise<{ apiKey: string }>`
Simple API key authentication method.

## Security Considerations

### What's Protected
- ✅ API keys encrypted at rest (filesystem permissions)
- ✅ PKCE prevents authorization code interception
- ✅ State parameter prevents CSRF attacks
- ✅ localhost-only OAuth callbacks
- ✅ Secure credential storage with restricted permissions

### What to Watch For
- ⚠️ Workspace shared across users (credentials are workspace-specific)
- ⚠️ Backup systems that might expose credentials
- ⚠️ Screen sharing while entering API keys
- ⚠️ Logging that might capture sensitive data

### Best Practices
1. **Rotate Keys Regularly**: Set calendar reminder to rotate API keys
2. **Limit Key Permissions**: Use least-privilege principle
3. **Monitor Usage**: Check OpenAI dashboard for unexpected usage
4. **Secure Backups**: Exclude `.createsuite/` from backups
5. **Use Environment Variables**: For CI/CD, use env vars not committed keys

## FAQ

**Q: Is my API key sent to any external servers?**  
A: No. Your API key is stored locally and only used for direct OpenAI API calls.

**Q: Can I use the same API key across multiple workspaces?**  
A: Yes, but we recommend workspace-specific keys for better security and usage tracking.

**Q: What if I accidentally commit my credentials?**  
A: 1) Immediately revoke the key at platform.openai.com, 2) Generate a new key, 3) Remove from git history using `git filter-repo` or BFG Repo-Cleaner.

**Q: Does this work with OpenAI teams/organizations?**  
A: Yes. Use your organization API key and it will work the same way.

**Q: Can I use this for other providers?**  
A: Yes! The `LocalhostOAuth` class supports any OAuth 2.0 provider with PKCE support.

## Support

- **Issues**: https://github.com/awelcing-alm/createsuite/issues
- **Discussions**: https://github.com/awelcing-alm/createsuite/discussions
- **OpenAI API Docs**: https://platform.openai.com/docs

## Related Documentation

- [Provider Setup Guide](PROVIDER_SETUP.md)
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Security Best Practices](SECURITY.md)
