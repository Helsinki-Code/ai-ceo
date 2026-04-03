---
title: Environment Variables
summary: Full environment variable reference
---

All environment variables that AI CEO uses for server configuration.

## Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `HOST` | `127.0.0.1` | Server host binding |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `AI_CEO_HOME` | `~/.ai-ceo` | Base directory for all AI CEO data |
| `AI_CEO_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `AI_CEO_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |

## Secrets

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_CEO_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `AI_CEO_SECRETS_MASTER_KEY_FILE` | `~/.ai-ceo/.../secrets/master.key` | Path to key file |
| `AI_CEO_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

## Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|----------|-------------|
| `AI_CEO_AGENT_ID` | Agent's unique ID |
| `AI_CEO_COMPANY_ID` | Company ID |
| `AI_CEO_API_URL` | AI CEO API base URL |
| `AI_CEO_API_KEY` | Short-lived JWT for API auth |
| `AI_CEO_RUN_ID` | Current heartbeat run ID |
| `AI_CEO_TASK_ID` | Issue that triggered this wake |
| `AI_CEO_WAKE_REASON` | Wake trigger reason |
| `AI_CEO_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `AI_CEO_APPROVAL_ID` | Resolved approval ID |
| `AI_CEO_APPROVAL_STATUS` | Approval decision |
| `AI_CEO_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

## LLM Provider Keys (for adapters)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |
