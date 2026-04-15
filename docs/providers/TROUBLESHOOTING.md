# Provider Troubleshooting Guide

Comprehensive guide for diagnosing and fixing AI provider issues in CreateSuite.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Authentication Issues](#authentication-issues)
3. [Rate Limiting](#rate-limiting)
4. [Token Refresh Problems](#token-refresh-problems)
5. [Network Connectivity](#network-connectivity)
6. [Provider-Specific Issues](#provider-specific-issues)

---

## Quick Diagnostics

Run this first to get an overview of your provider status:

```bash
cs provider status
```

### Check OpenCode Installation

```bash
which opencode
opencode --version
```

If OpenCode is not installed, see [Installation Guide](OPENAI_AUTH.md).

### Verify oh-my-opencode Plugin

```bash
opencode plugin list
```

Ensure `oh-my-opencode` appears in the plugin list.

---

## Authentication Issues

### Symptom: "Not authenticated" status

**Diagnosis:**
```bash
cs provider list
```

**Solutions:**

1. **Run authentication wizard:**
   ```bash
   cs provider auth
   ```

2. **For Claude:**
   ```bash
   opencode auth login
   # Select: Anthropic
   # Select: Claude Pro or Max
   # Complete OAuth in browser
   ```

3. **For OpenAI:**
   ```bash
   cs provider setup
   # Choose API Key method
   # Enter your key from https://platform.openai.com/api-keys
   ```

4. **For Z.ai GLM:**
   ```bash
   opencode auth login
   # Select: Z.ai
   # Complete authentication
   ```

### Symptom: Authentication succeeds but provider shows as "Not authenticated"

**Diagnosis:**
Check the provider configuration file:
```bash
cat ~/.createsuite/providers.json
```

**Solutions:**

1. **Re-run setup:**
   ```bash
   cs provider setup
   ```

2. **Check file permissions:**
   ```bash
   chmod 600 ~/.createsuite/providers.json
   ```

---

## Rate Limiting

### Symptom: "Rate limit exceeded" errors

**Diagnosis:**
```bash
cs provider status
```

**Solutions:**

1. **Wait and retry** - Most providers reset limits after a cooldown period

2. **Reduce request frequency** - Implement delays between requests

3. **Check provider quotas:**
   - **OpenAI:** https://platform.openai.com/account/rate-limits
   - **Anthropic:** https://docs.anthropic.com/en/api/rate-limits
   - **MiniMax:** Check your plan details

### Provider Rate Limits

| Provider | Free Tier | Pro Tier |
|---------|-----------|----------|
| OpenAI GPT-5.2 | 3 req/min | 500 req/min |
| Claude Opus 4.5 | 50 req/min | 200 req/min |
| MiniMax 2.1 | 100 req/min | 1000 req/min |

---

## Token Refresh Problems

### Symptom: "Token expired" errors

**Diagnosis:**
```bash
cs provider status
# Check "Last validated" timestamp
```

**Solutions:**

1. **Manual refresh:**
   ```bash
   opencode auth login
   ```

2. **Clear stored credentials:**
   ```bash
   rm ~/.createsuite/provider-credentials.json
   cs provider auth
   ```

3. **For Z.ai users:**
   - Visit https://z.ai/coding-plan
   - Generate new API key
   - Update via `cs provider setup`

---

## Network Connectivity

### Symptom: "Connection refused" or timeout errors

**Diagnosis:**
```bash
curl -v https://api.openai.com/v1/models
curl -v https://api.anthropic.com
```

**Solutions:**

1. **Check firewall/proxy settings**

2. **For corporate networks:**
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   cs provider list
   ```

3. **Check DNS resolution:**
   ```bash
   nslookup api.openai.com
   nslookup api.anthropic.com
   ```

---

## Provider-Specific Issues

### OpenAI

**Issue: Invalid API key format**
```
Error: OpenAI API keys must start with "sk-"
```

**Fix:** Ensure your API key is correct and hasn't expired:
```bash
# Verify key format
echo $OPENAI_API_KEY | head -c 5
```

**Issue: Model not found**
```
Error: Model 'gpt-5.2' not found
```

**Fix:** Check available models:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Claude (Anthropic)

**Issue: Tier not supported**
```
Error: Model requires Pro/Max tier
```

**Fix:** Upgrade your Anthropic plan or use a different model:
```bash
# Check your current tier
opencode auth status
```

### MiniMax

**Issue: Region restrictions**
```
Error: Service not available in your region
```

**Fix:** Use a VPN or check MiniMax availability in your region.

### Google Gemini

**Issue: OAuth configuration**
```
Error: Missing google-oauth config
```

**Fix:**
```bash
npm install -g opencode-antigravity-auth
opencode auth login
# Select: Google
# Select: OAuth with Antigravity
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Provider not found` | Provider not configured | Run `cs provider setup` |
| `Authentication expired` | Token too old | Run `cs provider auth` |
| `Rate limit exceeded` | Too many requests | Wait or upgrade plan |
| `Network timeout` | Connectivity issue | Check internet/firewall |
| `Invalid API key` | Wrong or expired key | Regenerate key in provider dashboard |

---

## Getting Help

### Enable Debug Logging

```bash
export DEBUG=opencode,oh-my-opencode
cs provider status
```

### Reset Everything

```bash
# Clear all provider data
rm -rf ~/.createsuite/providers.json
rm -rf ~/.createsuite/provider-credentials.json

# Re-setup
cs provider setup
```

### Check System Requirements

```bash
# OpenCode version
opencode --version  # Need >= 1.0

# Node version
node --version  # Need >= 22

# npm version
npm --version
```

---

## Related Documentation

- [Provider Setup Guide](PROVIDER_SETUP.md)
- [OpenAI Authentication](OPENAI_AUTH.md)
- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
